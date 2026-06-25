import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class GtPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('GtPrisma');

  constructor() {
    super({
      datasources: {
        db: { url: process.env.GT_DB_URL },
      },
      log: ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🟢 [GlobalTrade DB] Connected successfully.');
    } catch (error) {
      this.logger.warn('⚠️ [GlobalTrade DB] Connection restricted. Shifting to Fault Tolerance mode.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}