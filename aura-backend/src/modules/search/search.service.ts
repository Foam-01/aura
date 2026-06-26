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
                insight: 'พบชื่อผู้ใช้งานในบัญชีควบคุมระบบหลักสิทธิ์ผู้ดูแลกลาง',
                details: {},
              }))
            : [{ system: 'AIRA', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบประวัติผูกบัญชีในระบบแกนกลางหลัก', details: {} }],
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
                insight: 'พบโครงสร้างสิทธิ์เข้าทำงานระเบียนขอสิทธิ์คำสั่งโอนย้ายระบบส่งกำลัง',
                details: { fullName: u.name },
              }))
            : [{ system: 'ATSRequest', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีรายชื่อขอยื่นสิทธิ์ผ่านระบบ ATS ค้างสารบบ', details: {} }],
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
                insight: 'พบบัญชีเข้าใช้งานระบบวิเคราะห์และพยากรณ์ส่วนแบ่งการตลาด',
                details: { fullName: u.name, department: u.user_group },
              }))
            : [{ system: 'ForeCast', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'พนักงานไม่มีส่วนเกี่ยวข้องกับสายงานการวิเคราะห์พยากรณ์ข้อมูล', details: {} }],
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
                insight: 'พบบัญชีปฏิบัติการระบบธุรกรรมซื้อขายตราสารทุนต่างประเทศ',
                details: { fullName: u.name, department: 'N/A' },
              }))
            : [{ system: 'GlobalTrade', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีบัญชีอนุมัติสำหรับเปิดพอร์ตธุรกรรมระหว่างประเทศ', details: {} }],
        )
        .catch((e) => this.handleSystemError('GlobalTrade', e, keyword)),

      // 5. IPO Plus
      this.ipoPrisma.$queryRaw<any[]>`
        SELECT username, name, authorize, project_access, is_active 
        FROM [dbo].[users] 
        WHERE (${isNumeric} = 1 AND LOWER(username) = ${searchKey})
           OR (${isNumeric} = 0 AND (LOWER(username) LIKE ${likeParam} OR LOWER(name) LIKE ${likeParam}))
      `
        .then((res) =>
          res.length > 0
            ? res.map((u) => ({
                system: 'IPO Plus',
                username: u.username,
                role: u.authorize === 'H' ? 'Head' : 'Low/Operator',
                status: u.is_active === 1 || u.is_active === true ? 'ACTIVE' : 'INACTIVE',
                insight: 'พบบัญชีสิทธิ์จัดสรรหุ้นไอพีโอออกใหม่รายระบบแยกตามรายชื่อควบคุม',
                details: { fullName: u.name, projectGroup: u.project_access },
              }))
            : [{ system: 'IPO Plus', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบบัญชีสิทธิ์เข้าใช้งานระบบจองซื้อหุ้นกู้หรือ IPO', details: {} }],
        )
        .catch((e) => this.handleSystemError('IPO Plus', e, keyword)),

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
                role: u.username?.toUpperCase() === 'ADMIN' ? 'Admin' : 'General User',
                status: u.is_active ? 'ACTIVE' : 'INACTIVE',
                insight: 'ระบุสถานะระเบียนผู้คุมบัญชีสัญญาระบบสินเชื่อและจำนำทะเบียนหลักทรัพย์',
                details: { fullName: u.name },
              }))
            : [{ system: 'MTC', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบบันทึกประวัติเปิดใช้บริการในระบบจำนำหลักทรัพย์ค้ำประกัน', details: {} }],
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
                role: u.authoize === 'IT' ? 'Admin' : 'Marketing / General User',
                status: u.active ? 'ACTIVE' : 'INACTIVE',
                insight: 'พบข้อมูลระบุความจำนงจับคู่สัญญาก่อนส่งคำสั่งซื้อขายจริงเข้าตลาดหลักทรัพย์',
                details: { fullName: u.name, group: u.user_group },
              }))
            : [{ system: 'PreConfirm', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีประวัติสิทธิ์การออกใบยืนยันตั๋วซื้อขายชั่วคราวค้างชำระ', details: {} }],
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
                insight: 'พบบัญชีระบบสารสนเทศเพื่อการจัดการตลาดสัญญาซื้อขายล่วงหน้า (TFEX)',
                details: { fullName: u.name, group: u.user_group },
              }))
            : [{ system: 'TfexMIS', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบสิทธิ์เปิดใช้ระบบสารสนเทศบริหารงานล่วงหน้าในเครือ', details: {} }],
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

    try {
      const adminUser = req.user?.username || req.user?.user || req.user?.userId || 'Unknown Admin';
      await this.auditLogService.createLog({
        action_user: String(adminUser),
        search_key: keyword,
        ip_address: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        browser_info: req.headers['user-agent'] || 'Unknown Browser',
      });
    } catch (auditError) {
      console.error('❌ Failed to write log inside parallel search core:', auditError);
    }

    return {
      status: 'success',
      count: mergedResults.length,
      data: mergedResults,
    };
  }

  private handleSystemError(systemName: string, error: any, fallbackKeyword: string) {
    console.error(`🔥 [${systemName}] System query failed:`, error?.message || error);
    return [
      {
        system: systemName,
        username: fallbackKeyword,
        role: 'N/A',
        status: 'OFFLINE',
        insight: 'ช่องการเชื่อมต่อเซิร์ฟเวอร์ระบบเครือข่ายขัดข้องภายนอกชั่วคราว',
        details: { error: 'Connection failed' },
      },
    ];
  }
}