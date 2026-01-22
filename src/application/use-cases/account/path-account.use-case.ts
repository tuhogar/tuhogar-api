import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { AccountDocumentType, AccountType } from 'src/domain/entities/account';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { BulkAdvertisementUseCase } from '../advertisement/bulk-advertisement.use-case';
import { AddressDto } from 'src/infraestructure/http/dtos/address/address.dto';
import { SocialMediaDto } from 'src/infraestructure/http/dtos/social-media/create-social-media.dto';

interface PathAccountUseCaseCommand {
  userRole: UserRole;
  accountId: string;
  targetAccountId: string;
  documentType?: AccountDocumentType;
  documentNumber?: string;
  name?: string;
  address?: AddressDto;
  phone?: string;
  whatsApp?: string;
  phone2?: string;
  whatsApp2?: string;
  webSite?: string;
  socialMedia?: SocialMediaDto;
  description?: string;
  contractTypes?: string[];
  accountType?: AccountType;
  primaryColor?: string;
  domain?: string;
}

@Injectable()
export class PathAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly bulkAdvertisementUseCase: BulkAdvertisementUseCase,
  ) {}

  async execute({
    userRole,
    accountId,
    targetAccountId,
    documentType,
    documentNumber,
    name,
    address,
    phone,
    whatsApp,
    phone2,
    whatsApp2,
    webSite,
    socialMedia,
    description,
    contractTypes,
    accountType,
    primaryColor,
    domain
  }: PathAccountUseCaseCommand): Promise<void> {
    const updatedAccount = await this.accountRepository.update(
      userRole === UserRole.MASTER ? targetAccountId : accountId,
      documentType,
      documentNumber,
      name,
      address,
      phone,
      whatsApp,
      phone2,
      whatsApp2,
      webSite,
      socialMedia,
      description,
      contractTypes,
      accountType,
      primaryColor,
      domain
    );

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');

    if (contractTypes && contractTypes.length > 0) {
      await this.bulkAdvertisementUseCase.execute({ accountId: targetAccountId });
    }
  }
}
