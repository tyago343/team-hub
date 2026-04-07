import { Module } from '@nestjs/common';
import { OrganizationPresenters } from './presenters/organization.presenters';

@Module({
  imports: [OrganizationPresenters],
  exports: [OrganizationPresenters],
})
export class OrganizationModule {}
