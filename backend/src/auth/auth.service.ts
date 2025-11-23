import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';
import { promisify } from 'util';

const pbkdf2 = promisify(crypto.pbkdf2);

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const derivedKey = (await pbkdf2(pass, user.salt, 1000, 64, 'sha512')) as Buffer;
        if (derivedKey.toString('hex') === user.password) {
            const { password, salt, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(userDto: any) {
        const salt = crypto.randomBytes(16).toString('hex');
        const derivedKey = (await pbkdf2(userDto.password, salt, 1000, 64, 'sha512')) as Buffer;
        const hashedPassword = derivedKey.toString('hex');

        const user = await this.prisma.user.create({
            data: {
                email: userDto.email,
                password: hashedPassword,
                salt: salt,
            },
        });
        const { password, salt: userSalt, ...result } = user;
        return result;
    }
}
