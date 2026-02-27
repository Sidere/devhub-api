import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) { }

    // Valida email/senha — usado pela LocalStrategy
    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return user;
    }

    // Login: gera access token + refresh token
    async login(user: User) {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user.id),
        ]);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    // Renova access token via refresh token válido
    async refresh(token: string) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!stored || stored.revoked || stored.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token inválido ou expirado.');
        }

        if (!stored.user.isActive) {
            throw new ForbiddenException('Usuário inativo.');
        }

        // Rotaciona o refresh token (revoga o antigo, gera novo)
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revoked: true },
        });

        const [accessToken, newRefreshToken] = await Promise.all([
            this.generateAccessToken(stored.user),
            this.generateRefreshToken(stored.user.id),
        ]);

        return { accessToken, refreshToken: newRefreshToken };
    }

    // Logout: revoga o refresh token
    async logout(token: string) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token },
        });

        if (!stored || stored.revoked) {
            throw new UnauthorizedException('Token não encontrado ou já revogado.');
        }

        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revoked: true },
        });

        return { message: 'Logout realizado com sucesso.' };
    }

    // Helpers privados
    private async generateAccessToken(user: User): Promise<string> {
        return this.jwt.signAsync(
            {
                sub: user.id,
                email: user.email,
                role: user.role
            },
            {
                secret: process.env.JWT_SECRET,
                expiresIn: '15m',
            }
        );

    }

    private async generateRefreshToken(userId: string): Promise<string> {
        const token = uuidv4();
        const expiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));

        await this.prisma.refreshToken.create({
            data: { token, userId, expiresAt },
        });

        return token;
    }
}