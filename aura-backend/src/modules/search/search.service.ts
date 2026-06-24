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
// 🌟 1. Import ตัวกล้องวงจรปิดที่เราสร้างขึ้นมาใช้งานครับโฟม
import { AuditLogService } from '../audit-log/audit-log.service';

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
    // 🔌 2. ฉีด AuditLogService เข้ามาในระบบควบคุม Search ขนาน
    private readonly auditLogService: AuditLogService,
  ) {}

  
  async searchUserAcrossSystems(keyword: string, req: any) {
    if (!keyword) return { status: 'success', count: 0, data: [] };

    const searchKey = keyword.toLowerCase().trim();
    const likeParam = `%${searchKey}%`;

    
    if (searchKey === '%' || searchKey === '%%') {
      return { status: 'success', count: 0, data: [] };
    }

  
    const isNumeric = /^\d+$/.test(searchKey);

  
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
        WHERE (CASE WHEN ${isNumeric} = 1 THEN CAST(ID AS VARCHAR) ELSE LOWER(Username) END) = ${searchKey}
           OR (CASE WHEN ${isNumeric} = 0 THEN LOWER(Username) ELSE '' END) LIKE ${likeParam}
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
            : [
                {
                  system: 'AIRA',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
        )
        .catch((e) => this.handleSystemError('AIRA', e, keyword)),

      // 2. ATSRequest
      this.atsPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, is_active FROM [users] 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
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
            : [
                {
                  system: 'ATSRequest',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
        )
        .catch((e) => this.handleSystemError('ATSRequest', e, keyword)),

      // 3. ForeCast
      this.forecastPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, user_group, is_active FROM [tbl_user] 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
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
            : [
                {
                  system: 'ForeCast',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
        )
        .catch((e) => this.handleSystemError('ForeCast', e, keyword)),

      // 4. GlobalTrade
      this.gtPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize FROM [users] 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
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
            : [
                {
                  system: 'GlobalTrade',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
        )
        .catch((e) => this.handleSystemError('GlobalTrade', e, keyword)),

      // 5. IPO Plus
      this.ipoPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, project_access, is_active FROM [users] 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
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
            : [
                {
                  system: 'IPO Plus',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
        )
        .catch((e) => this.handleSystemError('IPO Plus', e, keyword)),
        // 5. IPO Plus 
      // 💣 [แก้ไขจุดนี้]: วางระเบิดจำลองไว้ที่นี่ชั่วคราว เพื่อบังคับดีดไปเข้า .catch ด้านล่างทันทีครับ
      //เปิด  Promise.resolve().then(() => {
       //เปิด  throw new Error('Simulated Database Timeout / Connection Lost');
     //เปิด  })
      /*  คอมเมนต์โค้ดเดิมของ IPO ตัวนี้ไว้ชั่วคราวก่อนครับโฟม
      this.ipoPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, project_access, is_active FROM [users] 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
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
            : [
                {
                  system: 'IPO Plus',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
        )
      */
        // 🛡️ ท่อนนี้จะจับระเบิดที่เราวางไว้ข้างบน แล้วส่งสถานะ OFFLINE กลับหน้าบ้านทันที!
        //เปิด  .catch((e) => this.handleSystemError('IPO Plus', e, keyword)),

      // 6. MTC
      this.mtcPrisma.$queryRaw<any[]>`
        SELECT username, name, is_active FROM [users] 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'MTC',
                username: u.username,
                role:
                  u.username?.toUpperCase() === 'ADMIN'
                    ? 'Admin'
                    : 'General User',
                status: u.is_active ? 'ACTIVE' : 'INACTIVE',
                details: { fullName: u.name },
              }))
            : [
                {
                  system: 'MTC',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
        )
        .catch((e) => this.handleSystemError('MTC', e, keyword)),

      // 7. PreConfirm
      this.preconfirmPrisma.$queryRaw<any[]>`
        SELECT username, name, authoize, user_group, active FROM [tbl_user] 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'PreConfirm',
                username: u.username,
                role:
                  u.authoize === 'IT' ? 'Admin' : 'Marketing / General User',
                status: u.active ? 'ACTIVE' : 'INACTIVE',
                details: { fullName: u.name, group: u.user_group },
              }))
            : [
                {
                  system: 'PreConfirm',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
        )
        .catch((e) => this.handleSystemError('PreConfirm', e, keyword)),

      // 8. TfexMIS
      this.tfexPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, user_group, is_active FROM TfexMIS.dbo.users 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
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
            : [
                {
                  system: 'TfexMIS',
                  username: keyword,
                  role: 'N/A',
                  status: 'NOT_FOUND',
                  details: {},
                },
              ],
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

    try {
      const adminUser =
        req.user?.username ||
        req.user?.user ||
        req.user?.userId ||
        'Unknown Admin';

      await this.auditLogService.createLog({
        action_user: String(adminUser),
        search_key: keyword,
        ip_address: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        browser_info: req.headers['user-agent'] || 'Unknown Browser',
      });
      console.log(
        `[Audit Log] 📝 บันทึกประวัติสำเร็จ: ${adminUser} เสิร์ชรหัส ${keyword}`,
      );
    } catch (auditError) {
      console.error(
        '❌ Failed to write log inside parallel search core:',
        auditError,
      );
    }

    return {
      status: 'success',
      count: uniqueResults.length,
      data: uniqueResults,
    };
  }

  private handleSystemError(
    systemName: string,
    error: any,
    fallbackKeyword: string,
  ) {
    console.error(
      `🔥 [${systemName}] System is unreachable or query failed:`,
      error?.message || error,
    );
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
