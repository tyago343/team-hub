import { Module } from '@nestjs/common';
import { OrganizationApplication } from '../application/organization.application';
import { OrganizationInfrastructure } from '../infrastructure/organization.infrastructure';
import { OrganizationController } from './http/organization.controller';

@Module({
  imports: [
    OrganizationApplication.withInfrastructure(OrganizationInfrastructure),
  ],
  controllers: [OrganizationController],
  exports: [OrganizationApplication],
})
export class OrganizationPresenters {}
