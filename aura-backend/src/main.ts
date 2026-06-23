import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 🌟 1. ดึงตัวจัดการคู่มือเอกสารเข้ามาใช้งาน
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔌 เปิดสิทธิ์ดึงข้ามโดเมน (CORS) ให้หน้าบ้านเข้าถึงได้สะดวก
  app.enableCors();

  // 📝 2. ตั้งค่าข้อมูลหน้าปกคู่มือระบบ AURA ของเรา
  const config = new DocumentBuilder()
    .setTitle('AURA SYSTEM - Core API Directory')
    .setDescription('คู่มือการใช้งานและ Spec เอกสารชุดคำสั่งระบบสืบค้นพนักงานขนาน 8 ฐานข้อมูลและ Audit Logs')
    .setVersion('1.0')
    .addBearerAuth() // 🛡️ พ่วงปุ่มกุญแจสำหรับให้แอดมินวางตั๋ว Token ทดสอบระบบ Guard 401
    .build();

  // 📑 3. สั่งรวบรวมประกอบร่างโค้ด Controller ทั้งหมด
  const document = SwaggerModule.createDocument(app, config);
  
  // 🚀 4. สถาปนาเปิดเส้นทางหน้าเว็บคู่มือไว้ที่คำว่า /docs
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
  console.log(`🚀 เซิร์ฟเวอร์หลักรันสำเร็จแล้วที่ช่องทาง: http://localhost:3000`);
  console.log(`📑 แวะชมคู่มือ API Spec (Swagger UI)  ที่: http://localhost:3000/docs`);
}
bootstrap();