import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'TEZUSTA_SUPER_SECRET_KEY_123!',
    });
  }

  async validate(payload: { sub: number; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("Foydalanuvchi topilmadi");
    }

    // Auto-unblock check
    if (user.isBlocked && user.blockedUntil && new Date(user.blockedUntil) < new Date()) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isBlocked: false, blockReason: null, blockedUntil: null },
      });
      user.isBlocked = false;
    }

    // Check if user exists and is not deleted
    const u = user as any;
    if (u.isDeleted) {
      throw new UnauthorizedException(
        "Foydalanuvchi o'chirilgan",
      );
    }
    // We no longer block access at the strategy level, 
    // so users can see their profile. Restrictions are handled per-route.
    /*
    if (u.isBlocked) {
      throw new UnauthorizedException(
        "Sizning hisobingiz bloklangan. Iltimos adminga murojaat qiling.",
      );
    }
    */
    return { id: payload.sub, role: payload.role };
  }
}
