import { Injectable } from '@nestjs/common';
import { Account } from 'src/domain/entities/account.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

@Injectable()
export class GetAllAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(): Promise<Account[]> {
    return this.accountRepository.find();
  }
}
