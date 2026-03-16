import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';
import { CreateLogDto } from './dto/create-log.dto';
import { DeleteLogsDto } from './dto/delete-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
    constructor(private logsService: LogsService) { }

    @Get()
    @ApiOperation({ summary: 'Lista logs com filtros e paginação' })
    @ApiResponse({ status: 200, description: 'Logs retornados.' })
    findAll(@Query() query: QueryLogsDto) {
        return this.logsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhe de um log' })
    @ApiResponse({ status: 200, description: 'Log encontrado.' })
    @ApiResponse({ status: 404, description: 'Log não encontrado.' })
    findOne(@Param('id') id: string) {
        return this.logsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Cria log manualmente' })
    @ApiResponse({ status: 201, description: 'Log criado.' })
    create(@Body() dto: CreateLogDto) {
        return this.logsService.create(dto);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove logs anteriores a uma data' })
    @ApiResponse({ status: 200, description: 'Logs removidos.' })
    deleteOld(@Body() dto: DeleteLogsDto) {
        return this.logsService.deleteOldLogs(dto);
    }
}