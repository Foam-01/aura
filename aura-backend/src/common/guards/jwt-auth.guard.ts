import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    }

    const normalizedHeader = authHeader.trim();
    const [scheme, ...tokenParts] = normalizedHeader.split(' ');
    if (
      !scheme ||
      scheme.toLowerCase() !== 'bearer' ||
      tokenParts.length === 0
    ) {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    }

    const token = tokenParts.join(' ').trim();
    if (!token) {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    }

    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') || 'dev-secret-key';
      const decoded = this.jwtService.verify(token, { secret });
      if (!decoded || typeof decoded !== 'object') {
        throw new UnauthorizedException(
          'สิทธิ์โทเคนไม่ถูกต้อง หรือหมดอายุแล้ว',
        );
      }

      request.user = {
        userId: decoded.sub,
        username: decoded.user,
        level: decoded.level,
        ...decoded,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('สิทธิ์โทเคนไม่ถูกต้อง หรือหมดอายุแล้ว');
    }
  }
}
