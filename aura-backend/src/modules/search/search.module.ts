import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { JwtModule } from '@nestjs/jwt'; // 🌟 ดึงปลั๊กแกะ Token มาใช้งาน
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuditLogModule,
    // 🔒 [แก้ไขจุดนี้]: บังคับป้อนรหัสลับประจำแอป AURA เพื่อให้แกะตั๋วหน้าบ้านสำเร็จครับ
    JwtModule.register({
      secret: 'your-secret-key', 
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}