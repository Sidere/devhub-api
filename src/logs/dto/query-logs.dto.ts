import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min, Max } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { LogLevel } from "@prisma/client";

export class QueryLogsDto {
    @ApiPropertyOptional({ enum: LogLevel })
    @IsOptional()
    @IsEnum(LogLevel)
    level?: LogLevel;

    @ApiPropertyOptional({ example: 'Auth' })
    @IsOptional()
    @IsString()
    service?: string;

    @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ example: '2026-01-31T23:59:59.999Z' })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional({ example: 'abc-123' })
    @IsOptional()
    @IsString()
    requestId?: string;

    @ApiPropertyOptional({ example: 'xyz-456' })
    @IsOptional()
    @IsString()
    correlationId?: string;

    @ApiPropertyOptional({ example: 'Erro de autenticação' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 50;
}
