import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'dev@coringadevs.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Coringa@devs' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nome do Dev' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: Role, default: Role.DEV })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}