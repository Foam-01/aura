import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; 

@ApiTags('Search') 
@ApiBearerAuth()   
@Controller('api/user')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Query('keyword') keyword: string, @Req() req: any) {
    return await this.searchService.searchUserAcrossSystems(keyword, req);
  }
}