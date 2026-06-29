import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchUserDto } from './dto/search-user.dto';
import { ValidationPipe } from '@nestjs/common';
import { UsePipes } from '@nestjs/common';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('user')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(@Query() query: SearchUserDto, @Req() req: any) {
    return await this.searchService.searchUserAcrossSystems(query.keyword, req);
  }
}
