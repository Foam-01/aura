import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // 🌟 ดึงเครื่องมือเข้ามา

@ApiTags('AuditLog')
@ApiBearerAuth()   // 🔒 สั่งเปิดช่องใส่ Token บนหน้าคู่มือของท่อประวัติย้อนหลังด้วยครับโฟม
@Controller('api/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllLogs() {
    return await this.auditLogService.getLogs();
  }
}