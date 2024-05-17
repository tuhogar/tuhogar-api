import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddAccountDto } from './dtos/add-account.dto';
import { AccountsService } from './accounts.service';
import { Account } from './interfaces/account.interface';

@Controller('v1/accounts')
export class AccountsController {

    constructor(
        private readonly accountsService: AccountsService,
    ) {}

    @Post()
    async addAccount(@Body() addAccountDto: AddAccountDto): Promise<void> {
        return this.accountsService.addAccount(addAccountDto);
    }

    @Get()
    async getAccounts(): Promise<Account[]> {
        return this.accountsService.getAccounts();
    }
}
