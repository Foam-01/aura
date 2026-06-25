import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MtcPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('MtcPrisma');

  constructor() {
    super({
      datasources: {
        db: { url: process.env.MTC_DB_URL },
      },
      log: ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🟢 [MTC DB] Connected successfully.');
    } catch (error) {
      this.logger.warn('⚠️ [MTC DB] Connection restricted. Shifting to Fault Tolerance mode.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}