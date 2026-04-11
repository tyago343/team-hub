import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpaqueTokenHasher } from '../domain/opaque-token-hasher.port';
import { RefreshTokenRepository } from '../domain/refresh-token.repository';
import { TokenService } from '../domain/token.port';
import {
  JWT_ACCESS_SERVICE,
  JWT_REFRESH_SERVICE,
  JwtTokenService,
} from './jwt-token.service';
import { Sha256OpaqueTokenHasher } from './sha256-opaque-token-hasher';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenEntity } from './typeorm/refresh-token.entity';
import { RefreshTokenRepositoryImpl } from './typeorm/refresh-token.repository-impl';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [
    {
      provide: JWT_ACCESS_SERVICE,
      useFactory: (config: ConfigService) =>
        new JwtService({
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.getOrThrow<string>(
              'JWT_ACCESS_EXPIRATION',
            ) as SignOptions['expiresIn'],
          },
        }),
      inject: [ConfigService],
    },
    {
      provide: JWT_REFRESH_SERVICE,
      useFactory: (config: ConfigService) =>
        new JwtService({
          secret: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          signOptions: {
            expiresIn: config.getOrThrow<string>(
              'JWT_REFRESH_EXPIRATION',
            ) as SignOptions['expiresIn'],
          },
        }),
      inject: [ConfigService],
    },
    JwtTokenService,
    { provide: TokenService, useExisting: JwtTokenService },
    { provide: OpaqueTokenHasher, useClass: Sha256OpaqueTokenHasher },
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokenRepositoryImpl,
    },
    JwtStrategy,
  ],
  exports: [
    TokenService,
    OpaqueTokenHasher,
    RefreshTokenRepository,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthInfrastructureModule {}
