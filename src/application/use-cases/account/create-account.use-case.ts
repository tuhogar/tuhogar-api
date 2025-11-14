import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { CreateUserUseCase } from '../user/create-user.use-case';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { CreateInternalSubscriptionUseCase } from '../subscription/create-internal-subscription.use-case';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { Account, AccountDocumentType, AccountStatus } from 'src/domain/entities/account';
import { CreateBillingUseCase } from '../billing/create-billing.use-case';

interface CreateAccountUseCaseCommand {
  email: string;
  uid: string;
  planId: string;
  name: string;
  phone?: string;
  documentType?: AccountDocumentType;
  documentNumber?: string;
}

@Injectable()
export class CreateAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createInternalSubscriptionUseCase: CreateInternalSubscriptionUseCase,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly createBillingUseCase: CreateBillingUseCase
  ) {}

  async execute({
    email,
    uid,
    planId,
    name,
    phone,
    documentType,
    documentNumber
  }: CreateAccountUseCaseCommand): Promise<{ id: string }> {
    const account = new Account({
      planId,
      name,
      email,
      phone,
      documentType,
      documentNumber,
      status: AccountStatus.ACTIVE,
    });
    const accountCreated = await this.accountRepository.create(account);
    const subscriptionCreated = await this.createInternalSubscriptionUseCase.execute({ accountId: accountCreated.id, planId });
    await this.subscriptionRepository.active(subscriptionCreated.id);
    await this.createUserUseCase.execute({
      email,
      uid,
      name,
      userRole: UserRole.ADMIN,
      accountId: accountCreated.id
    });
    await this.createBillingUseCase.execute({
        accountId: accountCreated.id,
        name,
        email,
        phone,
        documentType,
        documentNumber,
      });
    try {
      await this.updateFirebaseUsersDataUseCase.execute({ accountId: accountCreated.id });
    } catch (error) {
      if (subscriptionCreated) await this.subscriptionRepository.delete(subscriptionCreated.id);
      await this.accountRepository.delete(accountCreated.id);
      throw error;
    }

    return { id: accountCreated.id };
  }
}
