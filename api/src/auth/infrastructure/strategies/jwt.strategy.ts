import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { isRole } from '../../../organization/domain/role';
import type { TokenPayload } from '../../domain/token-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: {
    sub: string;
    email: string;
    organizationId: string;
    memberId: string;
    role: string;
  }): TokenPayload {
    if (!isRole(payload.role)) {
      throw new UnauthorizedException('Invalid role in JWT');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      memberId: payload.memberId,
      role: payload.role,
    };
  }
}
