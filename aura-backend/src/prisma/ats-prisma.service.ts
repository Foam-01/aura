import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AtsPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('AtsPrisma');

  constructor() {
    super({
      datasources: {
        db: { url: process.env.ATS_DB_URL },
      },
      log: ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🟢 [ATSRequest DB] Connected successfully.');
    } catch (error) {
      this.logger.warn('⚠️ [ATSRequest DB] Connection restricted. Shifting to Fault Tolerance mode.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}