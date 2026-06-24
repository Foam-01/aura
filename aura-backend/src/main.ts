import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('AURA SYSTEM - Core API Directory')
    .setDescription(
      'คู่มือการใช้งานและ Spec เอกสารชุดคำสั่งระบบสืบค้นพนักงานขนาน 8 ฐานข้อมูลและ Audit Logs',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
  console.log(
    `🚀 เซิร์ฟเวอร์หลักรันสำเร็จแล้วที่ช่องทาง: http://localhost:3000`,
  );
  console.log(
    `📑 แวะชมคู่มือ API Spec (Swagger UI)  ที่: http://localhost:3000/docs`,
  );
}
bootstrap();
