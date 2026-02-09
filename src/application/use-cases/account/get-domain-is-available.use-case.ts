import { Injectable } from '@nestjs/common';
import { Account } from 'src/domain/entities/account';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { ObjectId } from 'mongodb';
import { IBlacklistWordRepository } from 'src/application/interfaces/repositories/blacklist-word.repository.interface';

interface GetDomainIsAvailableUseCaseCommand {
  domain: string;
  accountId?: string;
}

@Injectable()
export class GetDomainIsAvailableUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly blacklistWordRepository: IBlacklistWordRepository,
  ) {}

  async execute({
    domain,
    accountId
  }: GetDomainIsAvailableUseCaseCommand): Promise<boolean> {

    const blacklistWords = await this.blacklistWordRepository.findAll();
    const words = blacklistWords.map(word => word.word);

    if (words.some(word => domain.includes(word))) {
      throw new Error(`invalid.account.domain.is.blacklist.word ${domain}`);
    }

    let account = null;
    //TODO: validar se o id é um ObjectId válido, se não for, buscar pelo domain
    if (!ObjectId.isValid(domain)) {
      account = await this.accountRepository.findOneByDomain(domain);
    } else {
      account = await this.accountRepository.findOneById(domain);
    }

    if (accountId && account.id === accountId) {
      return true;
    }

    return !account;
  }
}
