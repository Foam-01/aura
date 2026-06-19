import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('test')
  async search(@Query('keyword') keyword: string) {
    // ถ้ายิงมาดุ่ย ๆ แบบไม่มีพารามิเตอร์ ให้ตั้งค่าเริ่มต้นเพื่อทดสอบค้นหาคำว่า "admin"
    const searchWord = keyword || 'admin'; 
    return await this.searchService.searchUserAcrossSystems(searchWord);
  }
}