import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from '../dtos/account/create-account.dto';
import { AccountService } from 'src/application/use-cases/account/account.service';
import { Account } from 'src/domain/entities/account.interface';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from '../../decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { UpdateStatusAccountDto } from '../dtos/account/update-status-account.dto';
import { User } from 'src/domain/entities/user.interface';
import { Advertisement } from 'src/domain/entities/advertisement.interface';
import { UploadImageAccountDto } from '../dtos/account/upload-image-account.dto';
import { PatchAccountDto } from '../dtos/account/patch-account.dto';

@ApiTags('v1/accounts')
@Controller('v1/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiBearerAuth()
  @Get()
  @Auth('MASTER')
  async getAll(): Promise<Account[]> {
    return this.accountService.getAll();
  }

  @ApiBearerAuth()
  @Get('inactives')
  @Auth('MASTER')
  async getInactiveAccounts(): Promise<Account[]> {
    return this.accountService.findInactiveAccounts();
  }

  @ApiBearerAuth()
  @Get('registrations')
  @Auth('MASTER')
  async getAccountRegistrations(@Query('period') period: 'week' | 'month'): Promise<any[]> {
    return this.accountService.getAccountRegistrations(period);
  }

  @ApiBearerAuth()
  @Get(':accountid')
  async get(@Param('accountid') accountId: string): Promise<Account> {
      return this.accountService.getById(accountId);
  }

  @ApiBearerAuth()
  @Patch(':accountid')
  @Auth('MASTER', 'ADMIN', 'USER')
  async patch(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('accountid') accountId: string, @Body() patchAccountDto: PatchAccountDto): Promise<void> {
      await this.accountService.patch(authenticatedUser, accountId, patchAccountDto);
  }

  @ApiBearerAuth()
  @Put(':accountid/status')
  @Auth('MASTER')
  async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('accountid') accountId: string, @Body() updateStatusAccountDto: UpdateStatusAccountDto): Promise<{ id: string }> {
      return await this.accountService.updateStatus(authenticatedUser, accountId, updateStatusAccountDto);
  }

  @ApiBearerAuth()
  @Get(':accountid/users')
  @Auth('MASTER')
  async getUsers(@Param('accountid') accountId: string): Promise<User[]> {
      return this.accountService.getUsers(accountId);
  }

  @ApiBearerAuth()
  @Get(':accountid/advertisements')
  @Auth('MASTER')
  async getAdvertisements(@Param('accountid') accountId: string): Promise<Advertisement[]> {
      return this.accountService.getAdvertisements(accountId);
  }

  @ApiBearerAuth()
  @Delete(':accountid/users/:userid')
  @Auth('MASTER')
  async deleteUser(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string): Promise<void> {
      await this.accountService.deleteUser(authenticatedUser, userId);
  }

  @ApiBearerAuth()
  @Post('me/images')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe({transform: true}))
  async uploadImage(
      @Authenticated() authenticatedUser: AuthenticatedUser, @Body() uploadImageAccountDto: UploadImageAccountDto): Promise<void> {
      await this.accountService.processImage(authenticatedUser, uploadImageAccountDto);
  }

  @ApiBearerAuth()
  @Delete('me/images')
  @Auth('ADMIN', 'USER')
  async deleteImage(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<void> {
      await this.accountService.deleteImage(authenticatedUser);
  }
}
