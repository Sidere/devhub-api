import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';
import { QueryLogsDto } from './dto/query-logs.dto';
import { DeleteLogsDto } from './dto/delete-logs.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LogsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: QueryLogsDto) {
        const {
            level, service, from, to,
            requestId, correlationId, search,
            page = 1, limit = 50,
        } = query;

        const where: Prisma.SystemLogWhereInput = {
            ...(level && { level }),
            ...(service && { service: { contains: service, mode: 'insensitive' } }),
            ...(requestId && { requestId: { contains: requestId, mode: 'insensitive' } }),
            ...(correlationId && { correlationId: { contains: correlationId, mode: 'insensitive' } }),
            ...(search && { message: { contains: search, mode: 'insensitive' } }),
            ...((from || to) && {
                createdAt: {
                    ...(from && { gte: new Date(from) }),
                    ...(to && { lte: new Date(to) }),
                },
            }),
        };

        const [total, logs] = await Promise.all([
            this.prisma.systemLog.count({ where }),
            this.prisma.systemLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            }),
        ]);

        return {
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const log = await this.prisma.systemLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!log) {
            throw new NotFoundException(`Log ${id} não encontrado.`);
        }

        return log;
    }

    async create(dto: CreateLogDto) {
        return this.prisma.systemLog.create({
            data: {
                level: dto.level,
                service: dto.service,
                message: dto.message,
                requestId: dto.requestId,
                correlationId: dto.correlationId,
                userId: dto.userId,
                endpoint: dto.endpoint,
                statusCode: dto.statusCode,
                metadata: (dto.metadata as any) ?? Prisma.JsonNull,
            },
        });
    }

    async deleteOldLogs(dto: DeleteLogsDto) {
        const result = await this.prisma.systemLog.deleteMany({
            where: {
                createdAt: { lt: new Date(dto.before) },
            },
        });

        return {
            message: `${result.count} log(s) removido(s).`,
            deletedCount: result.count,
        };
    }

    async createInternal(data: {
        level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
        service: string;
        message: string;
        requestId?: string;
        correlationId?: string;
        userId?: string;
        endpoint?: string;
        statusCode?: number;
        metadata?: Record<string, any>;
    }) {
        try {
            await this.prisma.systemLog.create({
                data: {
                    ...data,
                    metadata: (data.metadata as any) ?? Prisma.JsonNull,
                }
            });
        } catch (error) {
            console.error('Falha ao salvar log interno:', error);
        }
    }
}