import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    if (!keyword) return { status: 'success', data: [] };
    
    const searchKey = keyword.toLowerCase().trim();

    // 🚀 ยิง Query ขนานพร้อมกัน 8 ระบบหลัก (Concurrent Fetching) + ทำ Fault Tolerance ดักแยกรายก้อน
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
      `.then(res => res.map(u => ({
        system: 'AIRA',
        username: u.Username,
        role: u.IsAdmin === 1 ? 'Admin' : 'General User',
        status: 'ACTIVE',
        details: {}
      }))).catch(e => this.handleSystemError('AIRA', e)),

      // 2. ATSRequest
      this.atsPrisma.$queryRaw<any[]>`
        SELECT username, authorize, is_active FROM [users] 
        WHERE LOWER(username) = ${searchKey}
      `.then(res => res.map(u => ({
        system: 'ATSRequest',
        username: u.username,
        role: u.authorize === 'H' ? 'Head/Admin' : 'User',
        status: u.is_active ? 'ACTIVE' : 'INACTIVE',
        details: {}
      }))).catch(e => this.handleSystemError('ATSRequest', e)),

      // 4. ForeCast
      this.forecastPrisma.$queryRaw<any[]>`
        SELECT username, authorize, user_group, is_active FROM [tbl_user] 
        WHERE LOWER(username) = ${searchKey}
      `.then(res => res.map(u => ({
        system: 'ForeCast',
        username: u.username,
        role: u.authorize === 'H' ? 'Head' : 'Low/Operator',
        status: u.is_active ? 'ACTIVE' : 'INACTIVE',
        details: { department: u.user_group }
      }))).catch(e => this.handleSystemError('ForeCast', e)),

      // 5. GlobalTrade
      this.gtPrisma.$queryRaw<any[]>`
        SELECT username, authorize, department FROM [users] 
        WHERE LOWER(username) = ${searchKey}
      `.then(res => res.map(u => ({
        system: 'GlobalTrade',
        username: u.username,
        role: u.authorize === 'H' ? 'Admin' : 'Operator',
        status: 'ACTIVE',
        details: { department: u.department }
      }))).catch(e => this.handleSystemError('GlobalTrade', e)),

      // 6. IPO Plus
      this.ipoPrisma.$queryRaw<any[]>`
        SELECT username, authorize, project_access, is_active FROM [users] 
        WHERE LOWER(username) = ${searchKey}
      `.then(res => res.map(u => ({
        system: 'IPO Plus',
        username: u.username,
        role: u.authorize === 'H' ? 'Head' : 'Low/Operator',
        status: u.is_active ? 'ACTIVE' : 'INACTIVE',
        details: { projectGroup: u.project_access }
      }))).catch(e => this.handleSystemError('IPO Plus', e)),

      // 7. MTC
      this.mtcPrisma.$queryRaw<any[]>`
        SELECT username, name, is_active FROM [users] 
        WHERE LOWER(username) = ${searchKey}
      `.then(res => res.map(u => ({
        system: 'MTC',
        username: u.username,
        role: u.username?.toUpperCase() === 'ADMIN' ? 'Admin' : 'General User',
        status: u.is_active ? 'ACTIVE' : 'INACTIVE',
        details: { fullName: u.name }
      }))).catch(e => this.handleSystemError('MTC', e)),

      // 9. PreConfirm
      this.preconfirmPrisma.$queryRaw<any[]>`
        SELECT username, user_group, active FROM [tbl_user] 
        WHERE LOWER(username) = ${searchKey}
      `.then(res => res.map(u => ({
        system: 'PreConfirm',
        username: u.username,
        role: u.user_group === 'IT' ? 'Admin' : 'Marketing / General User',
        status: u.active ? 'ACTIVE' : 'INACTIVE',
        details: { group: u.user_group }
      }))).catch(e => this.handleSystemError('PreConfirm', e)),

      // 10. TfexMIS
      this.tfexPrisma.$queryRaw<any[]>`
        SELECT username, authorize, user_group, is_active FROM [users] 
        WHERE LOWER(username) = ${searchKey}
      `.then(res => res.map(u => ({
        system: 'TfexMIS',
        username: u.username,
        role: u.authorize === 'H' ? 'Admin' : 'Operator',
        status: u.is_active ? 'ACTIVE' : 'INACTIVE',
        details: { group: u.user_group }
      }))).catch(e => this.handleSystemError('TfexMIS', e)),
    ]);

    // มัดรวมผลลัพธ์ของทุกระบบที่หาเจอให้ออกมาเป็นโครงสร้างก้อนเดี่ยว
    const mergedResults = [
      ...airaResult, ...atsResult, ...forecastResult, ...gtResult,
      ...ipoResult, ...mtcResult, ...preconfirmResult, ...tfexResult
    ];

    return {
      status: 'success',
      count: mergedResults.length,
      data: mergedResults
    };
  }

  // 🌟 ฟังก์ชันจัดการเมื่อมีระบบใดระบบหนึ่งล่ม (Fault Tolerance) 
  private handleSystemError(systemName: string, error: any) {
    console.error(`🔥 [${systemName}] System is unreachable or query failed:`, error.message);
    // ส่งสถานะ OFFLINE ออกไปเพื่อให้หน้าบ้านขึ้น Card สีส้ม/แดงเตือน โดยระบบรวมไม่ระเบิดพัง
    return [{
      system: systemName,
      username: 'N/A',
      role: 'N/A',
      status: 'OFFLINE',
      details: { error: 'Connection failed' }
    }];
  }
}