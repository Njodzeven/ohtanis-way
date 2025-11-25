import { NestFactory } from '@nestjs/core';
// Trigger restart
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // CORS configuration for production and development
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:4173'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
bootstrap();
