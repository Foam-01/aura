import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AiraPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('AiraPrisma');

  constructor() {
    super({
      datasources: {
        db: { url: process.env.AIRA_DB_URL },
      },
      log: ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🟢 [AIRA DB] Connected successfully.');
    } catch (error) {
      this.logger.warn('⚠️ [AIRA DB] Connection restricted. Shifting to Fault Tolerance mode.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}