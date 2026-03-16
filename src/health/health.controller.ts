import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private healthService: HealthService) { }

    // Endpoint público — usado pelo checkSelf e por monitoramento externo
    @Get('ping')
    ping() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    // Status geral — requer autenticação
    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Verifica o status de todos os serviços' })
    @ApiResponse({ status: 200, description: 'Status dos serviços.' })
    async check() {
        const results = await this.healthService.checkAll();

        const allHealthy = results.every((r) => r.status === 'HEALTHY');
        const hasDegraded = results.some((r) => r.status === 'DEGRADED');

        return {
            status: allHealthy ? 'HEALTHY' : hasDegraded ? 'DEGRADED' : 'DOWN',
            timestamp: new Date().toISOString(),
            services: results,
        };
    }

    @Get('history')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Histórico de health checks' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Histórico retornado.' })
    async history(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        return this.healthService.getHistory(limitNum);
    }

    // Opcional: Criar um endpoint apenas para o Dashboard
    @Get('latest')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Status mais recente de cada serviço' })
    async latest() {
        return this.healthService.getLatestPerService();
    }
}