import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HealthStatus } from '@prisma/client';
import { Redis } from 'ioredis';

export interface ServiceResult {
    serviceName: string;
    status: HealthStatus;
    responseTimeMs: number;
    details?: string;
}

@Injectable()
export class HealthService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) { }

    async onModuleInit() {
        console.log('🩺 Executando Health Check inicial...');
        await this.checkAll();
    }
    
    // ── Verifica todos os serviços ──────────────────────────────────────────

    async checkAll(): Promise<ServiceResult[]> {
        const checks = await Promise.allSettled([
            this.checkDatabase(),
            this.checkSelf(),
            this.checkRedis(),
            this.checkExternalService(),
        ]);

        const results: ServiceResult[] = checks.map((c) =>
            c.status === 'fulfilled'
                ? c.value
                : {
                    serviceName: 'Desconhecido',
                    status: 'DOWN' as HealthStatus,
                    responseTimeMs: 0,
                    details: 'Erro inesperado na verificação.',
                },
        );

        // Persiste no banco em background (não bloqueia a resposta)
        this.persistChecks(results).catch(() => { });

        return results;
    }

    // ── Histórico ───────────────────────────────────────────────────────────

    async getHistory(limit = 50) {
        return this.prisma.healthCheck.findMany({
            orderBy: { checkedAt: 'desc' },
            take: limit,
        });
    }

    // ── Último status por serviço (usado pelo Dashboard) ────────────────────

    async getLatestPerService(): Promise<ServiceResult[]> {
        // Busca o check mais recente de cada serviço
        const services = ['PostgreSQL', 'API (self)', 'Redis', this.config.get('EXTERNAL_SERVICE_NAME') ?? 'Serviço Externo'];

        const latest = await Promise.all(
            services.map((name) =>
                this.prisma.healthCheck.findFirst({
                    where: { serviceName: name },
                    orderBy: { checkedAt: 'desc' },
                }),
            ),
        );

        return latest
            .filter(Boolean)
            .map((hc) => ({
                serviceName: hc!.serviceName,
                status: hc!.status,
                responseTimeMs: hc!.responseTimeMs,
                details: hc!.details ?? undefined,
            }));
    }

    // ── Checks individuais ──────────────────────────────────────────────────

    private async checkDatabase(): Promise<ServiceResult> {
        const start = Date.now();
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                serviceName: 'PostgreSQL',
                status: 'HEALTHY',
                responseTimeMs: Date.now() - start,
                details: 'Conexão com o banco estabelecida.',
            };
        } catch (e) {
            return {
                serviceName: 'PostgreSQL',
                status: 'DOWN',
                responseTimeMs: Date.now() - start,
                details: `Erro: ${(e as Error).message}`,
            };
        }
    }

    private async checkSelf(): Promise<ServiceResult> {
        const start = Date.now();
        try {
            const port = this.config.get<number>('PORT') ?? 3000;
            const res = await fetch(`http://localhost:${port}/api/health/ping`);
            const ms = Date.now() - start;
            return {
                serviceName: 'API (self)',
                status: res.ok ? (ms > 1000 ? 'DEGRADED' : 'HEALTHY') : 'DOWN',
                responseTimeMs: ms,
                details: `HTTP ${res.status}`,
            };
        } catch (e) {
            return {
                serviceName: 'API (self)',
                status: 'DOWN',
                responseTimeMs: Date.now() - start,
                details: `Erro: ${(e as Error).message}`,
            };
        }
    }

    private async checkRedis(): Promise<ServiceResult> {
        const start = Date.now();
        let client: Redis | null = null; // Tipagem simplificada

        try {
            const redisUrl = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';

            // Criação direta do cliente
            client = new Redis(redisUrl, {
                connectTimeout: 3000,
                lazyConnect: true,
                maxRetriesPerRequest: 0
            });

            await client.connect();
            await client.ping();

            const ms = Date.now() - start;
            return {
                serviceName: 'Redis',
                status: ms > 500 ? 'DEGRADED' : 'HEALTHY',
                responseTimeMs: ms,
                details: 'PONG recebido.',
            };
        } catch (e) {
            return {
                serviceName: 'Redis',
                status: 'DOWN',
                responseTimeMs: Date.now() - start,
                details: `Erro: ${(e as Error).message}`,
            };
        } finally {
            if (client) {
                client.disconnect();
            }
        }
    }

    private async checkExternalService(): Promise<ServiceResult> {
        const start = Date.now();
        const url = this.config.get<string>('EXTERNAL_SERVICE_URL');
        const name = this.config.get<string>('EXTERNAL_SERVICE_NAME') ?? 'Serviço Externo';

        if (!url) {
            return {
                serviceName: name,
                status: 'DEGRADED',
                responseTimeMs: 0,
                details: 'EXTERNAL_SERVICE_URL não configurado.',
            };
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            const ms = Date.now() - start;
            return {
                serviceName: name,
                status: res.ok ? (ms > 2000 ? 'DEGRADED' : 'HEALTHY') : 'DOWN',
                responseTimeMs: ms,
                details: `HTTP ${res.status}`,
            };
        } catch (e) {
            return {
                serviceName: name,
                status: 'DOWN',
                responseTimeMs: Date.now() - start,
                details: (e as Error).name === 'AbortError' ? 'Timeout (5s)' : `Erro: ${(e as Error).message}`,
            };
        }
    }

    // ── Persiste resultados no banco ────────────────────────────────────────

    private async persistChecks(results: ServiceResult[]) {
        await this.prisma.healthCheck.createMany({
            data: results.map((r) => ({
                serviceName: r.serviceName,
                status: r.status,
                responseTimeMs: r.responseTimeMs,
                details: r.details,
            })),
        });
    }
}