import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function validateEnv() {
  const criticalVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = criticalVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`[BOOT WARNING] Missing critical environment variables: ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.pages.dev')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/preview
      }
    },
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Kitna Kharcha 2.0 backend running on port ${port}`);
}
bootstrap();
