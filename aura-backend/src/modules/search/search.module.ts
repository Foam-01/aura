import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { JwtModule } from '@nestjs/jwt'; 
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuditLogModule,
    JwtModule.register({
      secret: 'your-secret-key', 
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}