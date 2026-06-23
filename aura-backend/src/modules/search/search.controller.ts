import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// 🌟 1. ดึงตัวแจ้งสถานะความปลอดภัยของ Swagger เข้ามาใช้งาน
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; 

@ApiTags('Search') // 🏷️ ช่วยจัดหมวดหมู่ให้สวยงามบนหน้าเว็บ
@ApiBearerAuth()   // 🔒 [แก้ไขจุดนี้]: สั่งให้ Swagger เปิดสแกนตั๋ว Token ประจำท่อนี้ทั้งหมดครับโฟม!
@Controller('api/user')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Query('keyword') keyword: string, @Req() req: any) {
    return await this.searchService.searchUserAcrossSystems(keyword, req);
  }
}