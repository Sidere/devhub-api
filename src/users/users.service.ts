import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { toSafeUser } from './dto/user-response.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return users.map(toSafeUser);
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException(`Usuário ${id} não encontrado.`);
        }

        return toSafeUser(user);
    }

    async create(dto: CreateUserDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existing) {
            throw new ConflictException('Já existe um usuário com este email.');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                role: dto.role ?? Role.DEV,
            },
        });

        return toSafeUser(user);
    }

    async updateRole(id: string, dto: UpdateRoleDto) {
        await this.findOne(id); // garante que existe

        const user = await this.prisma.user.update({
            where: { id },
            data: { role: dto.role },
        });

        return toSafeUser(user);
    }

    async deactivate(id: string) {
        await this.findOne(id); // garante que existe

        const user = await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });

        // Revoga todos os refresh tokens do usuário
        await this.prisma.refreshToken.updateMany({
            where: { userId: id, revoked: false },
            data: { revoked: true },
        });

        return {
            message: `Usuário ${user.name} desativado com sucesso.`,
            user: toSafeUser(user),
        };
    }
}