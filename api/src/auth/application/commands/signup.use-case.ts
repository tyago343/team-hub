import { Injectable } from '@nestjs/common';
import { Member } from '../../../organization/domain/Member';
import { Organization } from '../../../organization/domain/Organization';
import { OrganizationRepository } from '../../../organization/domain/organization.repository';
import { Role } from '../../../organization/domain/role';
import { Slug } from '../../../organization/domain/slug.vo';
import { User } from '../../../user/domain/User';
import { Email } from '../../../user/domain/email.vo';
import { UserAlreadyExistsError } from '../../../user/domain/user.errors';
import { PasswordHasher } from '../../../user/domain/password-hasher.port';
import { UnitOfWork } from '../../../shared/ports/unit-of-work';

export interface SignupCommand {
  fullname: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface SignupResult {
  user: {
    id: string;
    email: string;
    fullname: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  };
  member: {
    id: string;
    userId: string;
    organizationId: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: SignupCommand): Promise<SignupResult> {
    const email = Email.create(command.email);
    const hashedPassword = await this.passwordHasher.hash(command.password);

    return this.unitOfWork.execute(
      async ({ users, organizations, members }) => {
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

        return {
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
    throw new Error('Could not allocate a unique organization slug');
  }
}
