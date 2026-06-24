import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CentralPrismaService } from '../../prisma/central-prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    
    private readonly prisma: CentralPrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const searchKey = dto.usr.toLowerCase().trim();

    
    const users = await this.prisma.$queryRaw<any[]>`
      SELECT id, [user], [pwd], [name], [level] FROM [AuraUser]
      WHERE LOWER([user]) = ${searchKey} AND [pwd] = ${dto.pwd}
    `;

    if (!users || users.length === 0) {
      throw new UnauthorizedException('ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง');
    }

    const user = users[0];
    
    
    const payload = { 
      sub: user.id, 
      user: user.user, 
      name: user.name, 
      level: user.level 
    };

    return { token: this.jwtService.sign(payload) };
  }

  async getInfo(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('ไม่พบรหัสโทเคนความปลอดภัย');
    }
    try {
      const jwt = authHeader.replace('Bearer ', '');
      const payload = this.jwtService.verify(jwt);
      return { payload };
    } catch (e) {
      throw new UnauthorizedException('โทเคนไม่มีสิทธิ์เข้าถึง หรือหมดอายุการใช้งานแล้ว');
    }
  }
}