import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from '../../prisma/central-prisma.service';
import { AiraPrismaService } from '../../prisma/aira-prisma.service';
import { AtsPrismaService } from '../../prisma/ats-prisma.service';
import { MtcPrismaService } from '../../prisma/mtc-prisma.service';
import { ForecastPrismaService } from '../../prisma/forecast-prisma.service';
import { GtPrismaService } from '../../prisma/gt-prisma.service';
import { IpoPrismaService } from '../../prisma/ipo-prisma.service';
import { PreconfirmPrismaService } from '../../prisma/preconfirm-prisma.service';
import { TfexPrismaService } from '../../prisma/tfex-prisma.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly airaPrisma: AiraPrismaService,
    private readonly atsPrisma: AtsPrismaService,
    private readonly mtcPrisma: MtcPrismaService,
    private readonly forecastPrisma: ForecastPrismaService,
    private readonly gtPrisma: GtPrismaService,
    private readonly ipoPrisma: IpoPrismaService,
    private readonly preconfirmPrisma: PreconfirmPrismaService,
    private readonly tfexPrisma: TfexPrismaService,
  ) {}

  async searchUserAcrossSystems(keyword: string) {
    if (!keyword) return { status: 'success', count: 0, data: [] };

    const searchKey = keyword.toLowerCase().trim();
    const likeParam = `%${searchKey}%`;

    // 🚀 ยิง Query ค้นหาขนานพร้อมกัน 8 ระบบ (ตรวจสอบทั้งรหัสใน username และชื่อใน name คอลัมน์)
    const [
      airaResult,
      atsResult,
      forecastResult,
      gtResult,
      ipoResult,
      mtcResult,
      preconfirmResult,
      tfexResult,
    ] = await Promise.all([
      
      // 1. AIRA
      this.airaPrisma.$queryRaw<any[]>`
        SELECT Username, IsAdmin FROM [Admin] 
        WHERE LOWER(Username) = ${searchKey}
           OR LOWER(Username) LIKE ${likeParam}
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'AIRA',
                username: u.Username,
                role: u.IsAdmin === 1 ? 'Admin' : 'General User',
                status: 'ACTIVE',
                details: {},
              }))
            : [{ system: 'AIRA', username: keyword, role: 'N/A', status: 'NOT_FOUND', details: {} }],
        )
        .catch((e) => this.handleSystemError('AIRA', e, keyword)),

      // 2. ATSRequest (🌟 ซ่อมแซม: ค้นหาตรวจสอบทั้งช่องเลขรหัส และช่อง name)
      this.atsPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, is_active FROM [users] 
        WHERE LOWER(username) LIKE ${likeParam}
           OR LOWER(name) LIKE ${likeParam}
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'ATSRequest',
                username: u.username,
                role: u.authorize === 'H' ? 'Head/Admin' : 'User',
                status: u.is_active ? 'ACTIVE' : 'INACTIVE',
                details: { fullName: u.name },
              }))
            : [{ system: 'ATSRequest', username: keyword, role: 'N/A', status: 'NOT_FOUND', details: {} }],
        )
        .catch((e) => this.handleSystemError('ATSRequest', e, keyword)),

      // 3. ForeCast (🌟 ซ่อมแซม: ดักจับทั้งรหัสพนักงาน และชื่อจริงภาษาอังกฤษอย่าง Pornsiri/Suthep)
      this.forecastPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, user_group, is_active FROM [tbl_user] 
        WHERE LOWER(username) LIKE ${likeParam}
           OR LOWER(name) LIKE ${likeParam}
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'ForeCast',
                username: u.username,
                role: u.authorize === 'H' ? 'Head' : 'Low/Operator',
                status: u.is_active ? 'ACTIVE' : 'INACTIVE',
                details: { fullName: u.name, department: u.user_group },
              }))
            : [{ system: 'ForeCast', username: keyword, role: 'N/A', status: 'NOT_FOUND', details: {} }],
        )
        .catch((e) => this.handleSystemError('ForeCast', e, keyword)),

      // 4. GlobalTrade (🌟 ซ่อมแซม: ส่องหาทั้งรหัส และชื่อภาษาอังกฤษ Ubonwan/Sirinthorn)
      this.gtPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize FROM [users] 
        WHERE LOWER(username) LIKE ${likeParam}
           OR LOWER(name) LIKE ${likeParam}
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'GlobalTrade',
                username: u.username,
                role: u.authorize === 'H' ? 'Admin' : 'Operator',
                status: 'ACTIVE',
                details: { fullName: u.name, department: 'N/A' },
              }))
            : [{ system: 'GlobalTrade', username: keyword, role: 'N/A', status: 'NOT_FOUND', details: {} }],
        )
        .catch((e) => this.handleSystemError('GlobalTrade', e, keyword)),

      // 5. IPO Plus (🌟 ซ่อมแซม: ค้นหาควบทั้งรหัสตัวเลขพนักงาน และช่องคอลัมน์ name)
      this.ipoPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, project_access, is_active FROM [users] 
        WHERE LOWER(username) = ${searchKey}
           OR LOWER(username) LIKE ${likeParam}
           OR LOWER(name) LIKE ${likeParam}
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'IPO Plus',
                username: u.username,
                role: u.authorize === 'H' ? 'Head' : 'Low/Operator',
                status: u.is_active ? 'ACTIVE' : 'INACTIVE',
                details: { fullName: u.name, projectGroup: u.project_access },
              }))
            : [{ system: 'IPO Plus', username: keyword, role: 'N/A', status: 'NOT_FOUND', details: {} }],
        )
        .catch((e) => this.handleSystemError('IPO Plus', e, keyword)),

      // 6. MTC
      this.mtcPrisma.$queryRaw<any[]>`
        SELECT username, name, is_active FROM [users] 
        WHERE LOWER(username) = ${searchKey}
           OR LOWER(name) LIKE ${likeParam}
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'MTC',
                username: u.username,
                role: u.username?.toUpperCase() === 'ADMIN' ? 'Admin' : 'General User',
                status: u.is_active ? 'ACTIVE' : 'INACTIVE',
                details: { fullName: u.name },
              }))
            : [{ system: 'MTC', username: keyword, role: 'N/A', status: 'NOT_FOUND', details: {} }],
        )
        .catch((e) => this.handleSystemError('MTC', e, keyword)),

      // 7. PreConfirm (🌟 ซ่อมแซม: ค้นหาอิงจากฟิลด์ username และ name ภาษาอังกฤษยาวเหยียดใน DB)
      this.preconfirmPrisma.$queryRaw<any[]>`
        SELECT username, name, authoize, user_group, active FROM [tbl_user] 
        WHERE LOWER(username) LIKE ${likeParam}
           OR LOWER(name) LIKE ${likeParam}
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'PreConfirm',
                username: u.username,
                role: u.authoize === 'IT' ? 'Admin' : 'Marketing / General User',
                status: u.active ? 'ACTIVE' : 'INACTIVE',
                details: { fullName: u.name, group: u.user_group },
              }))
            : [{ system: 'PreConfirm', username: keyword, role: 'N/A', status: 'NOT_FOUND', details: {} }],
        )
        .catch((e) => this.handleSystemError('PreConfirm', e, keyword)),

      // 8. TfexMIS
      this.tfexPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, user_group, is_active FROM TfexMIS.dbo.users 
        WHERE LOWER(username) LIKE ${likeParam}
           OR LOWER(name) LIKE ${likeParam}
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'TfexMIS',
                username: u.username,
                role: u.authorize === 'H' ? 'Admin' : 'Operator',
                status: u.is_active ? 'ACTIVE' : 'INACTIVE',
                details: { fullName: u.name, group: u.user_group },
              }))
            : [{ system: 'TfexMIS', username: keyword, role: 'N/A', status: 'NOT_FOUND', details: {} }],
        )
        .catch((e) => this.handleSystemError('TfexMIS', e, keyword)),
    ]);

    const mergedResults = [
      ...airaResult,
      ...atsResult,
      ...forecastResult,
      ...gtResult,
      ...ipoResult,
      ...mtcResult,
      ...preconfirmResult,
      ...tfexResult,
    ];

    const uniqueResults = mergedResults.filter(
      (item, index, self) =>
        index === self.findIndex((other) => other.system === item.system),
    );

    return {
      status: 'success',
      count: uniqueResults.length,
      data: uniqueResults,
    };
  }

  private handleSystemError(systemName: string, error: any, fallbackKeyword: string) {
    console.error(`🔥 [${systemName}] System is unreachable or query failed:`, error?.message || error);
    return [
      {
        system: systemName,
        username: fallbackKeyword,
        role: 'N/A',
        status: 'OFFLINE',
        details: { error: 'Connection failed' },
      },
    ];
  }
}