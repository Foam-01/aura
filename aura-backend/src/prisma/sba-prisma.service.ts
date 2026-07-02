import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

@Injectable()
export class SbaPrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('SbaPrisma');

  constructor() {
    // สแตนด์บาย String คอนฟิกเพื่อนำไปใช้ส่งต่อให้ Driver ยิงคำสั่งเข้า Informix ขนานกับ Prisma ระบบอื่น ๆ
  }

  async onModuleInit() {
    try {
      this.logger.log('🟢 [SBA Informix] Initialized configuration context.');
    } catch (error) {
      this.logger.warn('⚠️ [SBA Informix] Initialization restricted.');
    }
  }

  async onModuleDestroy() {
    // เคลียร์ Connection Pool เมื่อระบบปิดตัว
  }
}