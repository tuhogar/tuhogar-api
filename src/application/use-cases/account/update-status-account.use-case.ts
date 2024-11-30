import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusAccountDto } from 'src/infraestructure/http/dtos/account/update-status-account.dto';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { UpdateAllUserStatusUseCase } from '../user/update-all-user-status.use-case';

@Injectable()
export class UpdateStatusAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly updateAllUserStatusUseCase: UpdateAllUserStatusUseCase,
  ) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    accountId: string,
    updateStatusAccountDto: UpdateStatusAccountDto,
  ): Promise<{ id: string }> {
    const updatingAccount = await this.accountRepository.updateStatus(accountId, updateStatusAccountDto.status);
    
    if (!updatingAccount) throw new Error('notfound.account.do.not.exists');

    try {
        await this.updateAllUserStatusUseCase.execute(authenticatedUser, accountId,  updateStatusAccountDto.status);
    } catch(error) {
        await this.accountRepository.updateStatus(accountId, updatingAccount.status);

        throw error;
    }

    return { id: updatingAccount.id };
  }
}
