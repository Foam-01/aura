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
    if (searchKey === '%' || searchKey === '%%') {
      return { status: 'success', count: 0, data: [] };
    }

   
    // 🎯 🟢 ปรับปรุงหลังบ้าน: ยอมรับ Format ID (ตัวเลขล้วน), s+ID หรือพิมพ์คำว่า 'admin' ตรงตัวพอ
    const isValidEmployeeId = /^[a-zA-Z]?\d+$/.test(searchKey) || searchKey === 'admin';

    if (!isValidEmployeeId) {
      return {
        status: 'success',
        count: 0,
        data: [],
      };
    }

    // 🟢 ยิงเงื่อนไขหาตรงตัวแปรสิทธิ์ (Exact Match) ตามโครงสร้างรหัสพนักงาน ไม่ทำ LIKE ชื่อแล้ว ป้องกันการสืบค้นนอกเหนือระบบควบคุม
    const airaQuery = this.airaPrisma.$queryRaw<any[]>`SELECT Username, IsAdmin FROM [Admin] WHERE CAST(ID AS VARCHAR) = ${searchKey} OR LOWER(Username) = ${searchKey}`;
    const atsQuery = this.atsPrisma.$queryRaw<any[]>`SELECT username, name, authorize, is_active FROM [users] WHERE LOWER(username) = ${searchKey}`;
    const forecastQuery = this.forecastPrisma.$queryRaw<any[]>`SELECT username, name, authorize, user_group, is_active FROM [tbl_user] WHERE LOWER(username) = ${searchKey}`;
    const gtQuery = this.gtPrisma.$queryRaw<any[]>`SELECT username, name, authorize, depart_id, is_active FROM [users] WHERE LOWER(username) = ${searchKey}`;
    const ipoQuery = this.ipoPrisma.$queryRaw<any[]>`SELECT username, name, authorize, project_access, is_active FROM [dbo].[users] WHERE LOWER(username) = ${searchKey}`;
    const mtcQuery = this.mtcPrisma.$queryRaw<any[]>`SELECT username, name, is_active FROM [users] WHERE LOWER(username) = ${searchKey}`;
    const preconfirmQuery = this.preconfirmPrisma.$queryRaw<any[]>`SELECT username, name, authoize, user_group, active FROM [tbl_user] WHERE LOWER(username) = ${searchKey}`;
    const tfexQuery = this.tfexPrisma.$queryRaw<any[]>`SELECT username, name, authorize, user_group, is_active FROM TfexMIS.dbo.users WHERE LOWER(username) = ${searchKey}`;

    // 🟢 ยิงคิวรีขนานแยก Engine Isolation
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
      airaQuery
        .then((res) => res.length > 0 ? res.map((u) => ({ system: 'AIRA', username: u.Username, role: u.IsAdmin === 1 ? 'ADMIN' : 'USER', status: 'ACTIVE', insight: 'พบชื่อผู้ใช้งานในบัญชีควบคุมระบบหลักสิทธิ์ผู้ดูแลกลาง', details: {} })) : [{ system: 'AIRA', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบประวัติผูกบัญชีในระบบแกนกลางหลัก', details: {} }])
        .catch((e) => this.handleSystemError('AIRA', e, keyword)),

      atsQuery
        .then((res) => res.length > 0 ? res.map((u) => ({ system: 'ATSRequest', username: u.username, role: u.authorize, status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'พบโครงสร้างสิทธิ์เข้าทำงานระเบียนขอสิทธิ์คำสั่งโอนย้ายระบบส่งกำลัง', details: { fullName: u.name } })) : [{ system: 'ATSRequest', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีรายชื่อขอยื่นสิทธิ์ผ่านระบบ ATS ค้างสารบบ', details: {} }])
        .catch((e) => this.handleSystemError('ATSRequest', e, keyword)),

      forecastQuery
        .then((res) => res.length > 0 ? res.map((u) => ({ system: 'ForeCast', username: u.username, role: u.authorize, status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'พบบัญชีเข้าใช้งานระบบวิเคราะห์และพยากรณ์ส่วนแบ่งการตลาด', details: { fullName: u.name, user_group: u.user_group } })) : [{ system: 'ForeCast', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'พนักงานไม่มีส่วนเกี่ยวข้องกับสายงานการวิเคราะห์พยากรณ์ข้อมูล', details: {} }])
        .catch((e) => this.handleSystemError('ForeCast', e, keyword)),

      gtQuery
        .then((res) => res.length > 0 ? res.map((u) => ({ system: 'GlobalTrade', username: u.username, role: u.authorize, status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'พบบัญชีปฏิบัติการระบบธุรกรรมซื้อขายตราสารทุนต่างประเทศ', details: { fullName: u.name, user_group: u.depart_id } })) : [{ system: 'GlobalTrade', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีบัญชีอนุมัติสำหรับเปิดพอร์ตธุรกรรมระหว่างประเทศ', details: {} }])
        .catch((e) => this.handleSystemError('GlobalTrade', e, keyword)),

      ipoQuery
        .then((res) => res.length > 0 ? res.map((u) => ({ system: 'IPO Plus', username: u.username, role: u.authorize, status: (u.is_active === 1 || u.is_active === true) ? 'ACTIVE' : 'INACTIVE', insight: 'พบบัญชีสิทธิ์จัดสรรหุ้นไอพีโอออกใหม่รายระบบแยกตามรายชื่อควบคุม', details: { fullName: u.name, projectGroup: u.project_access } })) : [{ system: 'IPO Plus', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบบัญชีสิทธิ์เข้าใช้งานระบบจองซื้อหุ้นกู้หรือ IPO', details: {} }])
        .catch((e) => this.handleSystemError('IPO Plus', e, keyword)),

      mtcQuery
        .then((res) => res.length > 0 ? res.map((u) => ({ system: 'MTC', username: u.username, role: '—', status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'ระบุสถานะระเบียนผู้คุมบัญชีสัญญาระบบสินเชื่อและจำนำทะเบียนหลักทรัพย์', details: { fullName: u.name } })) : [{ system: 'MTC', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบบันทึกประวัติเปิดใช้บริการในระบบจำนำหลักทรัพย์ค้ำประกัน', details: {} }])
        .catch((e) => this.handleSystemError('MTC', e, keyword)),

      preconfirmQuery
        .then((res) => res.length > 0 ? res.map((u) => ({ system: 'PreConfirm', username: u.username, role: u.authoize, status: u.active ? 'ACTIVE' : 'INACTIVE', insight: 'พบข้อมูลระบุความจำนงจับคู่สัญญาก่อนส่งคำสั่งซื้อขายจริงเข้าตลาดหลักทรัพย์', details: { fullName: u.name, user_group: u.user_group } })) : [{ system: 'PreConfirm', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีประวัติสิทธิ์การออกใบยืนยันตั๋วซื้อขายชั่วคราวค้างชำระ', details: {} }])
        .catch((e) => this.handleSystemError('PreConfirm', e, keyword)),

      tfexQuery
        .then((res) => res.length > 0 ? res.map((u) => ({ system: 'TfexMIS', username: u.username, role: u.authorize, status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'พบบัญชีระบบสารสนเทศเพื่อการจัดการตลาดสัญญาซื้อขายล่วงหน้า (TFEX)', details: { fullName: u.name, user_group: u.user_group } })) : [{ system: 'TfexMIS', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบสิทธิ์เปิดใช้ระบบสารสนเทศบริหารงานล่วงหน้าในเครือ', details: {} }])
        .catch((e) => this.handleSystemError('TfexMIS', e, keyword)),
    ]);

    const mergedResults = [
      ...airaResult, ...atsResult, ...forecastResult, ...gtResult,
      ...ipoResult, ...mtcResult, ...preconfirmResult, ...tfexResult,
    ];

    try {
      const adminUser = req.user?.username || req.user?.user || req.user?.userId || 'Unknown Admin';
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
      const browserInfo = req.headers['user-agent'] || 'Unknown Browser';

      this.auditLogService.createLog({
        action_user: String(adminUser),
        search_key: keyword,
        ip_address: Array.isArray(ipAddress) ? ipAddress[0] : String(ipAddress),
        browser_info: String(browserInfo),
      }).catch(err => console.error('Background log error:', err));
    } catch (auditError) {
      console.error('❌ Async logging preparation failed:', auditError);
    }

    return {
      status: 'success',
      count: mergedResults.length,
      data: mergedResults,
    };
  }

  private handleSystemError(systemName: string, error: any, fallbackKeyword: string) {
    console.error(`🔥 [${systemName}] Engine Isolation Caught Error:`, error?.message || error);
    return [
      {
        system: systemName,
        username: fallbackKeyword,
        role: 'N/A',
        status: 'OFFLINE',
        insight: 'ระบายความเสี่ยง: ช่องเชื่อมต่อดาต้าเบสของระบบนี้เกิดข้อขัดข้องชั่วคราว แต่ระบบอื่นยังรันได้ปกติ',
        details: { error: error?.message || 'Connection timeout' },
      },
    ];
  }
}