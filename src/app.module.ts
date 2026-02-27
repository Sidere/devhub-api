import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    // UsersModule,    ← Passo 3
    // LogsModule,     ← Passo 4
    // HealthModule,   ← Passo 5
  ],
})
export class AppModule { }