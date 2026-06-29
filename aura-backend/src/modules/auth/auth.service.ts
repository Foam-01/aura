import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CentralPrismaService } from '../../prisma/central-prisma.service';
import {
  InvalidCredentialsException,
  InvalidTokenException,
} from '../../common/exceptions/auth.exceptions';
import { LoginDto } from './dto/login.dto';

export function verifyPassword(inputPassword: string, storedPassword: string) {
  return inputPassword === storedPassword;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: CentralPrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const searchKey = dto.usr.toLowerCase().trim();

    const users = await this.prisma.user.findMany({
      where: {
        user: dto.usr,
      },
      select: {
        id: true,
        user: true,
        pwd: true,
        name: true,
        level: true,
      },
    });

    if (!users || users.length === 0) {
      throw new UnauthorizedException(
        new InvalidCredentialsException().message,
      );
    }

    const user = users[0];
    const passwordMatches = verifyPassword(dto.pwd, user.pwd);

    if (!passwordMatches) {
      throw new UnauthorizedException(
        new InvalidCredentialsException().message,
      );
    }

    const payload = {
      sub: user.id,
      user: user.user,
      name: user.name,
      level: user.level,
    };

    const secret =
      this.configService.get<string>('JWT_SECRET') || 'dev-secret-key';
    const token = this.jwtService.sign(payload, { secret });

    return { token, access_token: token };
  }

  async getInfo(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('ไม่พบรหัสโทเคนความปลอดภัย');
    }
    try {
      const jwt = authHeader.replace('Bearer ', '').trim();
      const secret =
        this.configService.get<string>('JWT_SECRET') || 'dev-secret-key';
      const payload = this.jwtService.verify(jwt, { secret });
      return { payload };
    } catch (e) {
      throw new UnauthorizedException(new InvalidTokenException().message);
    }
  }
}
