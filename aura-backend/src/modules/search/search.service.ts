import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CentralPrismaService } from '../../prisma/central-prisma.service';
import { AiraPrismaService } from '../../prisma/aira-prisma.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly airaPrisma: AiraPrismaService,
  ) {}

  async testConnections() {
    try {
      const centralLogs = await this.centralPrisma.auditLogs.findMany({
        take: 3,
      });

      const airaAdmins = await this.airaPrisma.airaAdmin.findMany({
        take: 3,
      });

      return {
        status: 'success',
        message: 'เชื่อมต่อแบบแยกโมดูลอิสระเสร็จสมบูรณ์ร้อยเปอร์เซ็นต์ครับโฟม!',
        data: {
          centralLogs,
          airaAdmins,
        },
      };
    } catch (error) {
      // 🌟 มาตรฐานระดับองค์กร: พ่น Log รายละเอียดข้อผิดพลาดลงฝั่งเซิร์ฟเวอร์ก่อนเสมอ
      console.error('🔥 [SearchService.testConnections] Database Query Failed!');
      console.error('📋 Error Object:', error);

      // โยน Exception มาตรฐานของ NestJS กลับไปให้หน้าบ้าน (React) รับ Status 500 ที่ถูกต้อง
      throw new InternalServerErrorException('เกิดข้อผิดพลาดภายในระบบ ไม่สามารถดึงข้อมูลได้');
    }
  }
}