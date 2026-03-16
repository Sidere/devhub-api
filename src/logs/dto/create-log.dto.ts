import { IsEnum, IsOptional, IsString, IsInt, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LogLevel } from '@prisma/client';

export class CreateLogDto {
    @ApiProperty({ enum: LogLevel })
    @IsEnum(LogLevel)
    level: LogLevel;

    @ApiProperty({ example: 'Auth' })
    @IsString()
    service: string;

    @ApiProperty({ example: 'Usuário autenticado com sucesso' })
    @IsString()
    message: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    requestId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    correlationId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({ example: 'api/auth/login' })
    @IsOptional()
    @IsString()
    endpoint?: string;

    @ApiPropertyOptional({ example: 200 })
    @IsOptional()
    @IsInt()
    statusCode?: number;

    @ApiPropertyOptional()
    @IsOptional()
    metadata?: Record<string, unknown>;
}
