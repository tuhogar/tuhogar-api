import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from './dtos/create-account.dto';
import { AccountsService } from './accounts.service';
import { Account } from './interfaces/account.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';

@ApiTags('v1/accounts')
@Controller('v1/accounts')
export class AccountsController {

    constructor(
        private readonly accountsService: AccountsService,
    ) {}

    @ApiBearerAuth()
    @Post()
    @Auth()
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createAccountDto: CreateAccountDto): Promise<void> {
        return this.accountsService.create(
            createAccountDto.planId,
            createAccountDto.name,
            authenticatedUser.email,
            authenticatedUser.uid,
            //createAccountDto.address,
            createAccountDto.phone,
            //createAccountDto.whatsApp,
            createAccountDto.documentType,
            createAccountDto.documentNumber,
            //createAccountDto.webSite,
            //createAccountDto.socialMedia,
        );
    }

    @ApiBearerAuth()
    @Get()
    @Auth('MASTER')
    async getAll(): Promise<Account[]> {
        return this.accountsService.getAll();
    }
}
