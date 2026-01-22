import { Injectable } from '@nestjs/common';
import { Account } from 'src/domain/entities/account';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { ObjectId } from 'mongodb';

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
    //TODO: validar se o id é um ObjectId válido, se não for, buscar pelo domain
    if (!ObjectId.isValid(id)) {
      return this.accountRepository.findOneByDomain(id);
    }
    return this.accountRepository.findOneById(id);
  }
}
