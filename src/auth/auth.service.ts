/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logs: LogsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new BadRequestException(
        "Bunday raqam allaqachon ro'yxatdan o'tgan",
      );
    }

    const hashedPassword = await bcrypt.hash(dto.pass, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        password: hashedPassword,
        role: dto.role,
        region: dto.region,
        district: dto.district,
        skills: dto.skills ? JSON.stringify(dto.skills) : null,
        cats: dto.cats ? JSON.stringify(dto.cats) : null,
      },
    });

    await this.logs.create({
      userId: user.id,
      action: 'USER_REGISTER',
      details: { role: dto.role },
    });

    const payload = { sub: user.id, role: user.role };
    const expiresIn = (user.role === 'admin' || user.role === 'superadmin') ? '1h' : '7d';
    
    return {
      access_token: await this.jwtService.signAsync(payload, { expiresIn }),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        skills: user.skills ? JSON.parse(user.skills as string) : [],
        cats: user.cats ? JSON.parse(user.cats as string) : [],
        balance: user.balance,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    // Use explicit cast to avoid IDE cache issues with new schema fields
    const u = user as any;
    if (!u || u.isDeleted) {
      throw new UnauthorizedException("Raqam yoki parol noto'g'ri");
    }

    // Auto-unblock check
    if (u.isBlocked && u.blockedUntil && new Date(u.blockedUntil) < new Date()) {
      await this.prisma.user.update({
        where: { id: u.id },
        data: { isBlocked: false, blockReason: null, blockedUntil: null },
      });
      u.isBlocked = false;
    }

    // We no longer throw an exception here, so blocked users can see their profile
    // The restriction on actions will be handled in the relevant service methods and frontend UI
    /*
    if (u.isBlocked) {
      throw new UnauthorizedException(`Sizning hisobingiz bloklangan. Sabab: ${u.blockReason || 'Qoidabuzarlik'}`);
    }
    */

    const isMatch = await bcrypt.compare(dto.pass, u.password);
    if (!isMatch) {
      throw new UnauthorizedException("Raqam yoki parol noto'g'ri");
    }

    await this.logs.create({
      userId: u.id,
      action: 'USER_LOGIN',
    });

    const payload = { sub: u.id, role: u.role };
    const expiresIn = (u.role === 'admin' || u.role === 'superadmin') ? '1h' : '7d';
    
    return {
      access_token: await this.jwtService.signAsync(payload, { expiresIn }),
      user: {
        id: u.id,
        name: u.name,
        phone: u.phone,
        role: u.role,
        skills: u.skills ? JSON.parse(u.skills as string) : [],
        cats: u.cats ? JSON.parse(u.cats as string) : [],
        balance: u.balance,
        isBlocked: u.isBlocked,
        blockReason: u.blockReason,
        blockedUntil: u.blockedUntil,
      },
    };
  }
}
