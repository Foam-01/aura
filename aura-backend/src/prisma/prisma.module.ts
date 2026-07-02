import { Global, Module } from '@nestjs/common';
import { CentralPrismaService } from './central-prisma.service';
import { AiraPrismaService } from './aira-prisma.service';
import { AtsPrismaService } from './ats-prisma.service';
import { MtcPrismaService } from './mtc-prisma.service';
import { ForecastPrismaService } from './forecast-prisma.service';
import { GtPrismaService } from './gt-prisma.service';
import { IpoPrismaService } from './ipo-prisma.service';
import { PreconfirmPrismaService } from './preconfirm-prisma.service';
import { TfexPrismaService } from './tfex-prisma.service';
import { IconixPrismaService } from './iconix-prisma.service';
import { SbaPrismaService } from './sba-prisma.service';

@Global()
@Module({
  providers: [
    CentralPrismaService, 
    AiraPrismaService,
    AtsPrismaService,
    MtcPrismaService,
    ForecastPrismaService,
    GtPrismaService,
    IpoPrismaService,
    PreconfirmPrismaService,
    TfexPrismaService,
    IconixPrismaService,
    SbaPrismaService
  ],
  exports: [
    CentralPrismaService, 
    AiraPrismaService,
    AtsPrismaService,
    MtcPrismaService,
    ForecastPrismaService,
    GtPrismaService,
    IpoPrismaService,
    PreconfirmPrismaService,
    TfexPrismaService,
    IconixPrismaService,
    SbaPrismaService
  ],
})
export class PrismaModule {}