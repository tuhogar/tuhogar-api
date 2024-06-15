import { Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from './dtos/create-account.dto';
import { AccountsService } from './accounts.service';
import { Account } from './interfaces/account.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { UpdateStatusAccountDto } from './dtos/update-status-account.dto';
import { User } from 'src/users/interfaces/user.interface';
import { Advertisement } from 'src/advertisements/interfaces/advertisement.interface';

@ApiTags('v1/accounts')
@Controller('v1/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiBearerAuth()
  @Post()
  @Auth()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<void> {
    return this.accountsService.create(authenticatedUser, createAccountDto);
  }

  @ApiBearerAuth()
  @Get()
  @Auth('MASTER')
  async getAll(): Promise<Account[]> {
    return this.accountsService.getAll();
  }

  @ApiBearerAuth()
  @Put(':accountid/status')
  @Auth('MASTER')
  async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('accountid') accountId: string, @Body() updateStatusAccountDto: UpdateStatusAccountDto): Promise<void> {
      await this.accountsService.updateStatus(authenticatedUser, accountId, updateStatusAccountDto);
  }

  @ApiBearerAuth()
  @Get(':accountid/users')
  @Auth('MASTER')
  async getUsers(@Param('accountid') accountId: string): Promise<User[]> {
      return this.accountsService.getUsers(accountId);
  }

  @ApiBearerAuth()
  @Get(':accountid/advertisements')
  @Auth('MASTER')
  async getAdvertisements(@Param('accountid') accountId: string): Promise<Advertisement[]> {
      return this.accountsService.getAdvertisements(accountId);
  }
}
