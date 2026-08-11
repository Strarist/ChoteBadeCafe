import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { parseCorsOrigins } from './cors.util';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(helmet());

  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);
  if (process.env.NODE_ENV === 'production' && corsOrigins.every((o) => /localhost|127\.0\.0\.1/.test(o))) {
    throw new Error(
      'CORS_ORIGINS is still localhost-only. Set the three static-site https origins before production.',
    );
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  if (process.env.TRUST_PROXY !== '0') {
    app.set('trust proxy', 1);
  }

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend listening on http://0.0.0.0:${port}`);
}

void bootstrap();
