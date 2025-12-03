import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { OptionalAuthGuard } from './optional-auth.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [
        DatabaseModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');

                // Never use a fallback secret - fail fast if not configured
                if (!secret) {
                    throw new Error(
                        'JWT_SECRET is not configured. Please set JWT_SECRET environment variable.'
                    );
                }

                return {
                    secret,
                    signOptions: { expiresIn: '15m' }, // Reduced from 60m for better security
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy, OptionalAuthGuard],
    controllers: [AuthController],
    exports: [AuthService, OptionalAuthGuard], // Export OptionalAuthGuard for use in other modules
})
export class AuthModule { }
