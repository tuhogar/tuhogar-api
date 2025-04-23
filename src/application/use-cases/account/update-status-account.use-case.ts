import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { AccountStatus } from 'src/domain/entities/account';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { UpdateAllUserStatusUseCase } from '../user/update-all-user-status.use-case';

interface UpdateStatusAccountUseCaseCommand {
  userRole: UserRole;
  accountId: string;
  status: AccountStatus;
}

@Injectable()
export class UpdateStatusAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly updateAllUserStatusUseCase: UpdateAllUserStatusUseCase,
  ) {}

  async execute({
    userRole,
    accountId,
    status
  }: UpdateStatusAccountUseCaseCommand): Promise<{ id: string }> {
    const updatingAccount = await this.accountRepository.updateStatus(accountId, status);
    
    if (!updatingAccount) throw new Error('notfound.account.do.not.exists');

    try {
        await this.updateAllUserStatusUseCase.execute({
            userRole,
            accountId,
            status
        });
    } catch(error) {
        await this.accountRepository.updateStatus(accountId, updatingAccount.status);

        throw error;
    }

    return { id: updatingAccount.id };
  }
}
