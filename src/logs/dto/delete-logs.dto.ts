import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteLogsDto {
    @ApiProperty({
        example: '2026-01-01T00:00:00Z',
        description: 'Remove todos os logs anteriores a esta data.',
    })
    @IsDateString()
    before: string;
}