import { Injectable } from '@nestjs/common';
import { Account } from 'src/domain/entities/account';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

interface GetByIdAccountUseCaseCommand {
  id: string;
}

@Injectable()
export class GetByIdAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute({
    id
  }: GetByIdAccountUseCaseCommand): Promise<Account> {
    return this.accountRepository.findOneById(id);
  }
}
