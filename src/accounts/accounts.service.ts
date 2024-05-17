import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AddAccountDto } from './dtos/add-account.dto';
import { Account } from './interfaces/account.interface';

export enum AccountStatus {
    ACTIVE = "ACTIVE",
}

@Injectable()
export class AccountsService {

    private accounts: Account[] = [];

    async getAccounts(): Promise<Account[]> {
        return this.accounts;
    }

    async addAccount(addAccountDto: AddAccountDto): Promise<void> {
        const account: Account = {
            _id: uuidv4(),
            planId: addAccountDto.planId,
            status: AccountStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            finishedAt: new Date(),
        }
        this.accounts.push(account);
    }
}
