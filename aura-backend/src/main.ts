import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🌟 จัดชุดใหญ่ไฟกระพริบ ปลดล็อก CORS ระดับเนี๊ยบ
  app.enableCors({
    origin: true, // อนุญาตให้จับคู่ตาม Origin ที่ยิงมาเลย
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // 👈 เพิ่ม OPTIONS เข้าไปด้วยเพื่อให้ Preflight ผ่านฉลุย
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
