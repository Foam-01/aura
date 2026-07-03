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
import { IconixPrismaService } from '../../prisma/iconix-prisma.service';
import { SbaPrismaService } from '../../prisma/sba-prisma.service'; 
import { AuditLogService } from '../audit-log/audit-log.service';
import { Prisma } from '@prisma/client';

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
    private readonly iconixPrisma: IconixPrismaService,
    private readonly sbaPrisma: SbaPrismaService, 
    private readonly auditLogService: AuditLogService,
  ) {}

  async searchUserAcrossSystems(keyword: string, req: any) {
    if (!keyword) return { status: 'success', count: 0, data: [] };

    const searchKey = keyword.toLowerCase().trim();
    if (searchKey === '%' || searchKey === '%%') {
      return { status: 'success', count: 0, data: [] };
    }

    const isValidEmployeeId = /^[a-zA-Z0-9_-]+$/.test(searchKey);
    if (!isValidEmployeeId) {
      return { status: 'success', count: 0, data: [] };
    }

    // 🎯 1. แตกกิ่งร่างคีย์เวิร์ดเพื่อส่งกระจายกำลังยิง SQL
    const numericKey = searchKey.replace(/\D/g, ''); 
    const staffKeyWithS = searchKey.startsWith('s') ? searchKey : `s${searchKey}`;
    const defaultKey = searchKey;

    // 🎯 2. ปรับปรุง SQL คิวรีขนานระบบ 1-8 ให้เช็กควบทุกร่าง (ถ้าเจอ 2 บัญชีในตู้เดียว มันจะสอยออกมาครบทุกบรรทัด!)
    const airaQuery = this.airaPrisma.$queryRaw<any[]>`
      SELECT Username, IsAdmin FROM [Admin] 
      WHERE CAST(ID AS VARCHAR) = ${defaultKey} 
         OR CAST(ID AS VARCHAR) = ${numericKey}
         OR LOWER(Username) = ${defaultKey} 
         OR LOWER(Username) = ${staffKeyWithS}
         OR LOWER(Username) = ${numericKey}
    `;

    const atsQuery = this.atsPrisma.$queryRaw<any[]>`
      SELECT username, name, authorize, is_active FROM [users] 
      WHERE LOWER(username) = ${defaultKey} OR LOWER(username) = ${staffKeyWithS} OR LOWER(username) = ${numericKey}
    `;

    const forecastQuery = this.forecastPrisma.$queryRaw<any[]>`
      SELECT username, name, authorize, user_group, is_active FROM [tbl_user] 
      WHERE LOWER(username) = ${defaultKey} OR LOWER(username) = ${staffKeyWithS} OR LOWER(username) = ${numericKey}
    `;

    const gtQuery = this.gtPrisma.$queryRaw<any[]>`
      SELECT username, name, authorize, depart_id, is_active FROM [users] 
      WHERE LOWER(username) = ${defaultKey} OR LOWER(username) = ${staffKeyWithS} OR LOWER(username) = ${numericKey}
    `;

    const ipoQuery = this.ipoPrisma.$queryRaw<any[]>`
      SELECT username, name, authorize, project_access, is_active FROM [dbo].[users] 
      WHERE LOWER(username) = ${defaultKey} OR LOWER(username) = ${staffKeyWithS} OR LOWER(username) = ${numericKey}
    `;

    const mtcQuery = this.mtcPrisma.$queryRaw<any[]>`
      SELECT username, name, is_active FROM [users] 
      WHERE LOWER(username) = ${defaultKey} OR LOWER(username) = ${staffKeyWithS} OR LOWER(username) = ${numericKey}
    `;

    const preconfirmQuery = this.preconfirmPrisma.$queryRaw<any[]>`
      SELECT username, name, authoize, user_group, active FROM [tbl_user] 
      WHERE LOWER(username) = ${defaultKey} OR LOWER(username) = ${staffKeyWithS} OR LOWER(username) = ${numericKey}
    `;

    const tfexQuery = this.tfexPrisma.$queryRaw<any[]>`
      SELECT username, name, authorize, user_group, is_active FROM TfexMIS.dbo.users 
      WHERE LOWER(username) = ${defaultKey} OR LOWER(username) = ${staffKeyWithS} OR LOWER(username) = ${numericKey}
    `;
    
    // 🟢 9. คิวรีระบบ ICONIX (ปรับให้กวาด OR ทุกร่าง)
    const iconixQuery = this.iconixPrisma.$queryRawUnsafe<any[]>(
      `SELECT USER_ID, TNAME, ADMINISTRATOR_FLAG, ROLE_ID, HIERARCHY_ID, DELETE_FLAG 
       FROM ICONIX.dbo.USERS 
       WHERE RTRIM(USER_ID) = '${defaultKey}' OR USER_ID = '${staffKeyWithS}' OR USER_ID = '${numericKey}'`
    ).catch(() => []);

    // 🟢 10. ระบบสืบค้น SBA Informix: ยิงส่งคีย์เวิร์ดดิบให้สะพานนำไปวนลูป while ดึงทุกไอดี
    const sbaQuery = new Promise<any[]>(async (resolve) => {
      try {
        const axios = require('axios');
        const response = await axios.get(`http://127.0.0.1:3005/api/sba?keyword=${searchKey}`);
        resolve(response.data || []);
      } catch (error) {
        console.warn('⚠️ [SBA Main Service Hub] Bridge service unavailable.');
        resolve([]);
      }
    });

    // 🟢 รันคิวรีขนานพร้อมกัน 10 แชนเนล
    const [
      airaRaw,
      atsRaw,
      forecastRaw,
      gtRaw,
      ipoRaw,
      mtcRaw,
      preconfirmRaw,
      tfexRaw,
      iconixRaw,
      sbaRaw,
    ] = await Promise.all([
      airaQuery.catch((e) => this.handleSystemError('AIRA', e, keyword)),
      atsQuery.catch((e) => this.handleSystemError('ATSRequest', e, keyword)),
      forecastQuery.catch((e) => this.handleSystemError('ForeCast', e, keyword)),
      gtQuery.catch((e) => this.handleSystemError('GlobalTrade', e, keyword)),
      ipoQuery.catch((e) => this.handleSystemError('IPO Plus', e, keyword)),
      mtcQuery.catch((e) => this.handleSystemError('MTC', e, keyword)),
      preconfirmQuery.catch((e) => this.handleSystemError('PreConfirm', e, keyword)),
      tfexQuery.catch((e) => this.handleSystemError('TfexMIS', e, keyword)),
      iconixQuery.catch((e) => this.handleSystemError('ICONIX', e, keyword)),
      sbaQuery.catch((e) => this.handleSystemError('SBA', e, keyword)),
    ]);

    // 🎯 3. โค้ดชุดประวัติศาสตร์: แมปข้อมูลแบบปล่อยให้งอกหลายแถวอิสระตามจำนวนที่คิวรีเจอจริง!
    
    const airaResult = airaRaw.length > 0 ? airaRaw.map((u) => ({ system: 'AIRA', username: u.Username, role: u.IsAdmin === 1 ? 'ADMIN' : 'USER', status: 'ACTIVE', insight: 'พบชื่อผู้ใช้งานในบัญชีควบคุมระบบหลักสิทธิ์ผู้ดูแลกลาง', details: {} })) : [{ system: 'AIRA', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบประวัติผูกบัญชีในระบบแกนกลางหลัก', details: {} }];
    
    const atsResult = atsRaw.length > 0 ? atsRaw.map((u) => ({ system: 'ATSRequest', username: u.username, role: u.authorize, status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'พบโครงสร้างสิทธิ์เข้าทำงานระเบียนขอสิทธิ์คำสั่งโอนย้ายระบบส่งกำลัง', details: { fullName: u.name } })) : [{ system: 'ATSRequest', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีรายชื่อขอยื่นสิทธิ์ผ่านระบบ ATS ค้างสารบบ', details: {} }];
    
    const forecastResult = forecastRaw.length > 0 ? forecastRaw.map((u) => ({ system: 'ForeCast', username: u.username, role: u.authorize, status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'พบบัญชีเข้าใช้งานระบบวิเคราะห์และพยากรณ์ส่วนแบ่งการตลาด', details: { fullName: u.name, user_group: u.user_group } })) : [{ system: 'ForeCast', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'พนักงานไม่มีส่วนเกี่ยวข้องกับสายงานการวิเคราะห์พยากรณ์ข้อมูล', details: {} }];
    
    const gtResult = gtRaw.length > 0 ? gtRaw.map((u) => ({ system: 'GlobalTrade', username: u.username, role: u.authorize, status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'พบบัญชีปฏิบัติการระบบธุรกรรมซื้อขายตราสารทุนต่างประเทศ', details: { fullName: u.name, user_group: u.depart_id } })) : [{ system: 'GlobalTrade', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีบัญชีอนุมัติสำหรับเปิดพอร์ตธุรกรรมระหว่างประเทศ', details: {} }];
    
    const ipoResult = ipoRaw.length > 0 ? ipoRaw.map((u) => ({ system: 'IPO Plus', username: u.username, role: u.authorize, status: (u.is_active === 1 || u.is_active === true) ? 'ACTIVE' : 'INACTIVE', insight: 'พบบัญชีสิทธิ์จัดสรรหุ้นไอพีโอออกใหม่รายระบบแยกตามรายชื่อควบคุม', details: { fullName: u.name, projectGroup: u.project_access } })) : [{ system: 'IPO Plus', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบบัญชีสิทธิ์เข้าใช้งานระบบจองซื้อหุ้นกู้หรือ IPO', details: {} }];
    
    const mtcResult = mtcRaw.length > 0 ? mtcRaw.map((u) => ({ system: 'MTC', username: u.username, role: '—', status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'ระบุสถานะระเบียนผู้คุมบัญชีสัญญาระบบสินเชื่อและจำนำทะเบียนหลักทรัพย์', details: { fullName: u.name } })) : [{ system: 'MTC', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบบันทึกประวัติเปิดใช้บริการในระบบจำนำหลักทรัพย์ค้ำประกัน', details: {} }];
    
    const preconfirmResult = preconfirmRaw.length > 0 ? preconfirmRaw.map((u) => ({ system: 'PreConfirm', username: u.username, role: u.authoize, status: u.active ? 'ACTIVE' : 'INACTIVE', insight: 'พบข้อมูลระบุความจำนงจับคู่สัญญาก่อนส่งคำสั่งซื้อขายจริงเข้าตลาดหลักทรัพย์', details: { fullName: u.name, user_group: u.user_group } })) : [{ system: 'PreConfirm', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่มีประวัติสิทธิ์การออกใบยืนยันตั๋วซื้อขายชั่วคราวค้างชำระ', details: {} }];
    
    const tfexResult = tfexRaw.length > 0 ? tfexRaw.map((u) => ({ system: 'TfexMIS', username: u.username, role: u.authorize, status: u.is_active ? 'ACTIVE' : 'INACTIVE', insight: 'พบบัญชีระบบสารสนเทศเพื่อการจัดการตลาดสัญญาซื้อขายล่วงหน้า (TFEX)', details: { fullName: u.name, user_group: u.user_group } })) : [{ system: 'TfexMIS', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบสิทธิ์เปิดใช้ระบบสารสนเทศบริหารงานล่วงหน้าในเครือ', details: {} }];
    
    const iconixResult = iconixRaw.length > 0 ? iconixRaw.map((u) => ({
      system: 'ICONIX',
      username: String(u.USER_ID).trim(),
      role: u.ADMINISTRATOR_FLAG == 1 || String(u.ADMINISTRATOR_FLAG).trim() === '1' ? 'ADMIN' : (String(u.ROLE_ID).trim() || 'USER'),
      status: (u.DELETE_FLAG == 0 || String(u.DELETE_FLAG).trim() === '0') ? 'ACTIVE' : 'INACTIVE',
      insight: 'ระเบียนสิทธิ์พนักงานตรวจสอบฐานควบคุมโครงสร้างพอร์ตจองซื้อ ICONIX',
      details: { fullName: u.TNAME, user_group: u.HIERARCHY_ID, actualRole: String(u.ROLE_ID).trim() }
    })) : [{ system: 'ICONIX', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: 'ไม่พบบัญชีพนักงานคีย์นี้ผูกระเบียนในระบบพอร์ต ICONIX', details: {} }];

    // ระบบที่ 10 SBA จัดการผลลัพธ์แบบ Array Loop จากตัวสะพานตรง ๆ
    let sbaResult: any[] = []; // 🎯 เติม : any[] กำหนด Type ให้ชัดเจนเพื่อปลดล็อกคอมไพเลอร์
    if (!sbaRaw || !Array.isArray(sbaRaw) || sbaRaw.length === 0 || sbaRaw[0]?.error) {
      sbaResult = [{ system: 'SBA', username: keyword, role: 'N/A', status: 'NOT_FOUND', insight: sbaRaw[0]?.error ? `ระบบ SBA ขัดข้อง: ${sbaRaw[0].error}` : 'ไม่พบระเบียนผูกสิทธิ์บัญชีใช้งานของระบบบริหารส่วนงานลูกค้า SBA', details: {} }];
    } else {
      sbaResult = sbaRaw.map((rawItem: any) => {
        const divCode = rawItem.divcode || '';
        const deptCode = rawItem.deptcode || '';
        const cleanGroup = String(divCode).trim();
        const targetGroup = (cleanGroup === '0' || cleanGroup === '00' || !cleanGroup) ? String(deptCode).trim() : cleanGroup;

        return {
          system: 'SBA',
          username: rawItem.userid || keyword, // โชว์ไอดีจริงตัวที่เจอในเบสของบรรทัดนั้น ๆ (มี s หรือไม่มี s แยกกันชัดเจน!)
          role: String(rawItem.adminflag).trim() === '1' || String(rawItem.adminflag).trim() === 'Y' ? 'ADMIN' : (rawItem.position || 'USER'),
          status: 'ACTIVE',
          insight: 'พบข้อมูลระเบียนรายชื่อพนักงานสายงานบริการในระบบบริหารผู้ถือหุ้น Smart Customer',
          details: { 
            fullName: `${String(rawItem.usertname).trim()} ${String(rawItem.usertsurname).trim()}`.trim(), 
            user_group: targetGroup || 'N/A'
          }
        };
      });
    }

    // มัดรวมผลลัพธ์ทั้งหมดทะยานสู่หน้าบ้าน
    const mergedResults = [
      ...airaResult, ...atsResult, ...forecastResult, ...gtResult,
      ...ipoResult, ...mtcResult, ...preconfirmResult, ...tfexResult, ...iconixResult, ...sbaResult,
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
    return [];
  }
}