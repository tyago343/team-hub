import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../../organization/domain/organization.repository';
import { MemberRepository } from '../../../organization/domain/member.repository';
import { UserRepository } from '../../../user/domain/user.repository';
import { Email } from '../../../user/domain/email.vo';
import { PasswordHasher } from '../../../user/domain/password-hasher.port';
import { InvalidCredentialsError } from '../../domain/auth.errors';
import { OpaqueTokenHasher } from '../../domain/opaque-token-hasher.port';
import { RefreshToken } from '../../domain/refresh-token';
import { RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { TokenService } from '../../domain/token.port';
import type { TokenPayload } from '../../domain/token-payload';
import type { AuthResult } from '../auth-result';

export interface LoginCommand {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly members: MemberRepository,
    private readonly organizations: OrganizationRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly opaqueTokenHasher: OpaqueTokenHasher,
    private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResult> {
    const email = Email.create(command.email);
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordOk = await this.passwordHasher.compare(
      command.password,
      user.password,
    );
    if (!passwordOk) {
      throw new InvalidCredentialsError();
    }

    const member = await this.members.findByUserId(user.id);
    if (!member) {
      throw new InvalidCredentialsError();
    }

    const organization = await this.organizations.findById(
      member.organizationId,
    );
    if (!organization) {
      throw new InvalidCredentialsError();
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email.value,
      organizationId: member.organizationId,
      memberId: member.id,
      role: member.role,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const { token: refreshToken, expiresAt } =
      await this.tokenService.generateRefreshToken(payload);
    const tokenHash = this.opaqueTokenHasher.hash(refreshToken);
    const refreshEntity = RefreshToken.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.refreshTokens.save(refreshEntity);

    const userP = user.toPrimitives();
    const orgP = organization.toPrimitives();
    const memP = member.toPrimitives();

    return {
      accessToken,
      refreshToken,
      user: {
        id: userP.id,
        email: userP.email,
        fullname: userP.fullname,
        emailVerifiedAt: userP.emailVerifiedAt,
        createdAt: userP.createdAt,
        updatedAt: userP.updatedAt,
      },
      organization: {
        id: orgP.id,
        name: orgP.name,
        slug: orgP.slug,
        createdAt: orgP.createdAt,
        updatedAt: orgP.updatedAt,
      },
      member: {
        id: memP.id,
        userId: memP.userId,
        organizationId: memP.organizationId,
        role: memP.role,
        createdAt: memP.createdAt,
        updatedAt: memP.updatedAt,
      },
    };
  }
}
