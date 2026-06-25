import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CentralPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('CentralPrisma');

  constructor() {
    super({
      datasources: {
        db: { url: process.env.CENTRAL_URL || process.env.CENTRAL_DB_URL || process.env.DATABASE_URL },
      },
      log: ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🟢 [Central Audit Log DB] Connected successfully.');
    } catch (error) {
      // แปลงเป็น any เพื่อดึง .message ออกมาได้โดยไม่มีเส้นแดงกวนใจ
      this.logger.error('❌ [Central Audit Log DB] Connection failed critically:', (error as any).message || error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}