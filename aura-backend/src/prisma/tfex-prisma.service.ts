import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TfexPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('TfexPrisma');

  constructor() {
    super({
      datasources: {
        // 🟢 [แก้ไขแล้ว]: เปลี่ยนมาดึงค่าจาก TFEX_DB_URL ให้ตรงระบบตัวจริงครับโฟม
        db: { url: process.env.TFEX_DB_URL },
      },
      log: ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🟢 [TfexMIS DB] Connected successfully.');
    } catch (error) {
      this.logger.warn('⚠️ [TfexMIS DB] Connection restricted. Shifting to Fault Tolerance mode.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}