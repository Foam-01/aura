import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from '../../prisma/central-prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: CentralPrismaService) {}

  // 📝 ฟังก์ชันสำหรับสร้าง Log ใหม่ลงตาราง AuditLogs (ของเดิม)
  async createLog(data: {
    action_user: string;
    search_key: string;
    ip_address?: string;
    browser_info?: string;
  }) {
    try {
      return await this.prisma.auditLogs.create({
        data: {
          action_user: data.action_user,
          search_key: data.search_key,
          ip_address: data.ip_address || '127.0.0.1',
          browser_info: data.browser_info || 'Unknown Browser',
        },
      });
    } catch (error) {
      console.error('❌ Failed to write audit log in Prisma:', error);
      throw error;
    }
  }

  // 📜 [เพิ่มฟังก์ชันนี้]: ดึงประวัติ Log ทั้งหมดส่งออกไปหน้าบ้าน (เรียงจากใหม่สุดไปเก่าสุด)
  async getLogs() {
    try {
      return await this.prisma.auditLogs.findMany({
        orderBy: {
          created_at: 'desc', // ดึงอันล่าสุดขึ้นมาโชว์ก่อนเพื่อความปลอดภัยในการตรวจสอบ
        },
      });
    } catch (error) {
      console.error('❌ Failed to fetch audit logs from Prisma:', error);
      throw error;
    }
  }
}