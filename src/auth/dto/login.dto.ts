import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'devhub@coringadevs.local' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Coringa@devs' })
    @IsString()
    @MinLength(6)
    password: string;
}