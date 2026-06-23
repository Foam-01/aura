import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded; // ยัดก้อนผู้ใช้เข้าไปใน request context เพื่อให้นำไปทำพวก audit-log ส่องต่อได้ครับ
      return true;
    } catch (err) {
      throw new UnauthorizedException('สิทธิ์โทเคนไม่ถูกต้อง หรือหมดอายุแล้ว');
    }
  }
}