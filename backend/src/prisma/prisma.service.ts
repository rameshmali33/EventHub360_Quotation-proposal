import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dummy';
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    if (process.env.DATABASE_URL) {
      try {
        await this.$connect();
        console.log('PostgreSQL database connected successfully.');
      } catch (err) {
        console.warn('Prisma failed to connect to the database. Falling back to in-memory mode.', err.message);
      }
    } else {
      console.log('No DATABASE_URL found. Running in in-memory mode.');
    }
  }

  async onModuleDestroy() {
    if (process.env.DATABASE_URL) {
      try {
        await this.$disconnect();
      } catch {}
    }
  }
}

