import { Controller, Get } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // 🌐 ยิงมาที่ GET http://localhost:3000/search/test เพื่อทดสอบ
  @Get('test')
  async testPrisma() {
    return await this.searchService.testConnections();
  }
}