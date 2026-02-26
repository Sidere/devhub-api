import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Iniciando seed...');

  const hash = await bcrypt.hash('Coringa@devs', 10);

  try {
    await prisma.user.upsert({
      where: { email: 'devhub@coringadevs.local' },
      update: {},
      create: {
        email: 'devhub@coringadevs.local',
        passwordHash: hash,
        name: 'Coringa Devs',
        role: Role.DEV,
      },
    });

    console.log('✅ Seed concluído — usuário Dev criado');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});