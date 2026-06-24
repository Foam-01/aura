import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CentralPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    
    super({
      datasources: {
        db: { url: process.env.CENTRAL_DB_URL },
      },
      log: ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}