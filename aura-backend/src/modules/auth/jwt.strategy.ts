import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // คีย์ลับสำหรับถอดรหัสของ AURA
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.user,
      level: payload.level,
    };
  }
}