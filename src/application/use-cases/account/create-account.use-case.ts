import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { CreateAccountDto } from 'src/infraestructure/http/dtos/account/create-account.dto';
import { CreateUserDto } from 'src/infraestructure/http/dtos/user/create-user.dto';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { CreateUserUseCase } from '../user/create-user.use-case';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { CreateInternalSubscriptionUseCase } from '../subscription/create-internal-subscription.use-case';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createInternalSubscriptionUseCase: CreateInternalSubscriptionUseCase,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
  ) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    createAccountDto: CreateAccountDto,
  ): Promise<{ id: string }> {
    const accountCreated = await this.accountRepository.create(
      authenticatedUser.email,
      createAccountDto.planId,
      createAccountDto.name,
      createAccountDto.phone,
      createAccountDto.documentType,
      createAccountDto.documentNumber,
    );
    const subscriptionCreated = await this.createInternalSubscriptionUseCase.execute({ accountId: accountCreated.id, planId: createAccountDto.planId });
    await this.createUserUseCase.execute(authenticatedUser, { name: createAccountDto.name, userRole: UserRole.ADMIN }, accountCreated );
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
