import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { UploadImageAccountDto } from './dtos/upload-image-account.dto';
import { PatchAccountDto } from './dtos/patch-account.dto';

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
  ): Promise<{ id: string }> {
    return this.accountsService.create(authenticatedUser, createAccountDto);
  }

  @ApiBearerAuth()
  @Get()
  @Auth('MASTER')
  async getAll(): Promise<Account[]> {
    return this.accountsService.getAll();
  }

  @ApiBearerAuth()
  @Get('inactives')
  @Auth('MASTER')
  async getInactiveAccounts(): Promise<Account[]> {
    return this.accountsService.findInactiveAccounts();
  }

  @ApiBearerAuth()
  @Get('registrations')
  @Auth('MASTER')
  async getAccountRegistrations(@Query('period') period: 'week' | 'month'): Promise<any[]> {
    return this.accountsService.getAccountRegistrations(period);
  }

  @ApiBearerAuth()
  @Get(':accountid')
  async get(@Param('accountid') accountId: string): Promise<Account> {
      return this.accountsService.getById(accountId);
  }

  @ApiBearerAuth()
  @Patch(':accountid')
  @Auth('MASTER', 'ADMIN', 'USER')
  async patch(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('accountid') accountId: string, @Body() patchAccountDto: PatchAccountDto): Promise<void> {
      await this.accountsService.patch(authenticatedUser, accountId, patchAccountDto);
  }

  @ApiBearerAuth()
  @Put(':accountid/status')
  @Auth('MASTER')
  async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('accountid') accountId: string, @Body() updateStatusAccountDto: UpdateStatusAccountDto): Promise<{ id: string }> {
      return await this.accountsService.updateStatus(authenticatedUser, accountId, updateStatusAccountDto);
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

  @ApiBearerAuth()
  @Delete(':accountid/users/:userid')
  @Auth('MASTER')
  async deleteUser(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string): Promise<void> {
      await this.accountsService.deleteUser(authenticatedUser, userId);
  }

  @ApiBearerAuth()
  @Post('me/images')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe({transform: true}))
  async uploadImage(
      @Authenticated() authenticatedUser: AuthenticatedUser, @Body() uploadImageAccountDto: UploadImageAccountDto): Promise<void> {
      await this.accountsService.processImage(authenticatedUser, uploadImageAccountDto);
  }

  @ApiBearerAuth()
  @Delete('me/images')
  @Auth('ADMIN', 'USER')
  async deleteImage(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<void> {
      await this.accountsService.deleteImage(authenticatedUser);
  }
}
