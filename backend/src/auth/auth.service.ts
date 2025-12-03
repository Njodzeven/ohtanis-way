import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { promisify } from 'util';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const pbkdf2 = promisify(crypto.pbkdf2);
const BCRYPT_ROUNDS = 12; // Industry standard for bcrypt

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    /**
     * Validate user credentials with support for both bcrypt and legacy PBKDF2
     * Automatically migrates PBKDF2 passwords to bcrypt on successful login
     */
    async validateUser(email: string, pass: string): Promise<any> {
        // Sanitize email input
        if (!email || typeof email !== 'string') {
            return null;
        }

        const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user) return null;

        let isValid = false;
        let needsMigration = false;

        // Check if this is a legacy PBKDF2 password (has salt field)
        if (user.salt) {
            // Validate using legacy PBKDF2 method
            const derivedKey = (await pbkdf2(pass, user.salt, 1000, 64, 'sha512')) as Buffer;
            isValid = derivedKey.toString('hex') === user.password;
            needsMigration = isValid; // Migrate to bcrypt if valid
        } else {
            // Validate using bcrypt
            isValid = await bcrypt.compare(pass, user.password);
        }

        if (!isValid) {
            return null;
        }

        // Migrate legacy password to bcrypt
        if (needsMigration) {
            const bcryptHash = await bcrypt.hash(pass, BCRYPT_ROUNDS);
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    password: bcryptHash,
                    salt: null, // Remove salt field to indicate bcrypt
                },
            });
        }

        const { password, salt, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }

    async register(userDto: RegisterDto) {
        // Sanitize and validate email
        const email = userDto.email.toLowerCase().trim();

        // Check if user already exists (prevent user enumeration)
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Use generic error message to prevent user enumeration
            throw new ConflictException('Unable to create account. Please try a different email.');
        }

        // Hash password with bcrypt (automatically handles salting)
        const hashedPassword = await bcrypt.hash(userDto.password, BCRYPT_ROUNDS);

        try {
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    salt: null, // bcrypt doesn't need separate salt storage
                },
            });

            const { password, salt, ...result } = user;
            return result;
        } catch (error) {
            // Handle any database errors
            throw new BadRequestException('Unable to create account. Please try again.');
        }
    }
}
