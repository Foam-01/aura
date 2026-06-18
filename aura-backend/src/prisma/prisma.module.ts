import { Global, Module } from '@nestjs/common';
import { CentralPrismaService } from './central-prisma.service';
import { AiraPrismaService } from './aira-prisma.service';

@Global()
@Module({
  providers: [CentralPrismaService, AiraPrismaService],
  exports: [CentralPrismaService, AiraPrismaService],
})
export class PrismaModule {}