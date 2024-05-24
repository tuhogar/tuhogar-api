import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateAccountDto } from './dtos/create-account.dto';
import { AccountsService } from './accounts.service';
import { Account } from './interfaces/account.interface';

@Controller('v1/accounts')
export class AccountsController {

    constructor(
        private readonly accountsService: AccountsService,
    ) {}

    @Post()
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Body() createAccountDto: CreateAccountDto): Promise<void> {
        return this.accountsService.create(createAccountDto);
    }

    @Get()
    async getAll(): Promise<Account[]> {
        return this.accountsService.getAll();
    }
}
