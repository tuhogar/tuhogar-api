import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { PatchAccountDto } from 'src/infraestructure/http/dtos/account/patch-account.dto';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

@Injectable()
export class PathAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(authenticatedUser: AuthenticatedUser, accountId: string, patchAccountDto: PatchAccountDto): Promise<void> {
    const filter = {
        _id: accountId,
        ...(authenticatedUser.userRole !== UserRole.MASTER && { _id: authenticatedUser.accountId })
    };

    const updatedAccount = await this.accountRepository.findOneAndUpdate(filter, patchAccountDto, true);

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');
  }
}
