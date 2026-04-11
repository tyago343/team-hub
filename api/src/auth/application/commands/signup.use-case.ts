import { Injectable } from '@nestjs/common';
import { Member } from '../../../organization/domain/Member';
import { Organization } from '../../../organization/domain/Organization';
import { SlugAllocationError } from '../../../organization/domain/organization.errors';
import { OrganizationRepository } from '../../../organization/domain/organization.repository';
import { Role } from '../../../organization/domain/role';
import { Slug } from '../../../organization/domain/slug.vo';
import { User } from '../../../user/domain/User';
import { Email } from '../../../user/domain/email.vo';
import { UserAlreadyExistsError } from '../../../user/domain/user.errors';
import { PasswordHasher } from '../../../user/domain/password-hasher.port';
import { UnitOfWork } from '../../../shared/ports/unit-of-work';
import { OpaqueTokenHasher } from '../../domain/opaque-token-hasher.port';
import { RefreshToken } from '../../domain/refresh-token';
import { TokenService } from '../../domain/token.port';
import type { TokenPayload } from '../../domain/token-payload';
import type { AuthResult } from '../auth-result';

export interface SignupCommand {
  fullname: string;
  email: string;
  password: string;
  organizationName: string;
}

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly opaqueTokenHasher: OpaqueTokenHasher,
  ) {}

  async execute(command: SignupCommand): Promise<AuthResult> {
    const email = Email.create(command.email);
    const hashedPassword = await this.passwordHasher.hash(command.password);

    return this.unitOfWork.execute(
      async ({ users, organizations, members, refreshTokens }) => {
        const existing = await users.findByEmail(email);
        if (existing) {
          throw new UserAlreadyExistsError(command.email);
        }

        const user = User.create({
          email,
          password: hashedPassword,
          fullname: command.fullname,
        });

        await users.save(user);

        const slug = await this.resolveUniqueSlug(
          organizations,
          command.organizationName,
        );

        const organization = Organization.create({
          name: command.organizationName,
          slug,
        });

        await organizations.save(organization);

        const member = Member.create({
          userId: user.id,
          organizationId: organization.id,
          role: Role.OWNER,
        });

        await members.save(member);

        const userP = user.toPrimitives();
        const orgP = organization.toPrimitives();
        const memP = member.toPrimitives();

        const payload: TokenPayload = {
          sub: userP.id,
          email: userP.email,
          organizationId: orgP.id,
          memberId: memP.id,
          role: memP.role,
        };

        const accessToken =
          await this.tokenService.generateAccessToken(payload);
        const { token: refreshToken, expiresAt } =
          await this.tokenService.generateRefreshToken(payload);
        const tokenHash = this.opaqueTokenHasher.hash(refreshToken);
        const refreshEntity = RefreshToken.create({
          userId: user.id,
          tokenHash,
          expiresAt,
        });
        await refreshTokens.save(refreshEntity);

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
      },
    );
  }

  private async resolveUniqueSlug(
    organizations: OrganizationRepository,
    organizationName: string,
  ): Promise<Slug> {
    const baseSlug = Slug.fromOrganizationName(organizationName);
    for (let n = 0; n < 1000; n += 1) {
      const candidate =
        n === 0 ? baseSlug : Slug.create(`${baseSlug.value}-${n}`);
      const taken = await organizations.findBySlug(candidate);
      if (!taken) {
        return candidate;
      }
    }
    throw new SlugAllocationError();
  }
}
