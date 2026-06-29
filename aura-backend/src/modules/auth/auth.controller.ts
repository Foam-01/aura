import { Body, Controller, Get, Headers, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('info')
  async info(@Headers('Authorization') auth: string) {
    return this.authService.getInfo(auth);
  }
}