import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
     //origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

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

  const requestedPort = Number(process.env.PORT || 3000);
  const port =
    Number.isNaN(requestedPort) || requestedPort <= 0 ? 3000 : requestedPort;

  const listenWithFallback = async (startPort: number, attempts = 5) => {
    let currentPort = startPort;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        await app.listen(currentPort);
        return currentPort;
      } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === 'EADDRINUSE' && attempt < attempts - 1) {
          currentPort += 1;
          console.warn(
            `⚠️ Port ${startPort + attempt} is busy, retrying on ${currentPort}...`,
          );
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Unable to start server after ${attempts} attempts`);
  };

  const actualPort = await listenWithFallback(port);
  console.log(
    `🚀 เซิร์ฟเวอร์หลักรันสำเร็จแล้วที่ช่องทาง: http://localhost:${actualPort}`,
  );
  console.log(
    `📑 แวะชมคู่มือ API Spec (Swagger UI)  ที่: http://localhost:${actualPort}/docs`,
  );
}
bootstrap();
