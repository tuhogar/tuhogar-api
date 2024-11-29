import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusAccountDto } from 'src/infraestructure/http/dtos/account/update-status-account.dto';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { UpdateAllStatusUserUseCase } from '../user/update-all-status-user.use-case';

@Injectable()
export class UpdateStatusAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly updateAllStatusUserUseCase: UpdateAllStatusUserUseCase,
  ) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    accountId: string,
    updateStatusAccountDto: UpdateStatusAccountDto,
  ): Promise<{ id: string }> {
    const updatingAccount = await this.accountRepository.updateStatus(accountId, updateStatusAccountDto.status);
    
    if (!updatingAccount) throw new Error('notfound.account.do.not.exists');

    try {
        await this.updateAllStatusUserUseCase.execute(authenticatedUser, accountId,  updateStatusAccountDto.status);
    } catch(error) {
        await this.accountRepository.updateStatus(accountId, updatingAccount.status);

        throw error;
    }

    return { id: updatingAccount.id };
  }
}
