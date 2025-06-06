import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from '../dtos/account/create-account.dto';
import { Account } from 'src/domain/entities/account';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from '../../decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusAccountDto } from '../dtos/account/update-status-account.dto';
import { User } from 'src/domain/entities/user';
import { Advertisement } from 'src/domain/entities/advertisement';
import { UploadImageAccountDto } from '../dtos/account/upload-image-account.dto';
import { PatchAccountDto } from '../dtos/account/patch-account.dto';
import { CreateAccountUseCase } from 'src/application/use-cases/account/create-account.use-case';
import { DeleteImageAccountUseCase } from 'src/application/use-cases/account/delete-image-account.use-case';
import { DeleteUserAccountUseCase } from 'src/application/use-cases/account/delete-user-account.use-case';
import { FindInactivesAccountUseCase } from 'src/application/use-cases/account/find-inactives-account.use-case';
import { GetAllAccountUseCase } from 'src/application/use-cases/account/get-all-account.use-case';
import { GetByIdAccountUseCase } from 'src/application/use-cases/account/get-by-id-account.use-case';
import { GetRegisteredAccountsUseCase } from 'src/application/use-cases/account/get-registered-accounts.use-case';
import { PathAccountUseCase } from 'src/application/use-cases/account/path-account.use-case';
import { ProcessImageAccountUseCase } from 'src/application/use-cases/account/process-image-account.use-case';
import { UpdateStatusAccountUseCase } from 'src/application/use-cases/account/update-status-account.use-case';
import { GetAllUserByAccountIdUseCase } from 'src/application/use-cases/user/get-all-user-by-account-id.use-case';
import { GetAdvertisementDto } from '../dtos/advertisement/get-advertisement.dto';
import { GetAllByAccountIdAdvertisementUseCase } from 'src/application/use-cases/advertisement/get-all-by-account-id-advertisement.use-case';

@ApiTags('v1/accounts')
@Controller('v1/accounts')
export class AccountController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly deleteImageAccountUseCase: DeleteImageAccountUseCase,
    private readonly deleteUserAccountUseCase: DeleteUserAccountUseCase,
    private readonly findInactivesAccountUseCase: FindInactivesAccountUseCase,
    private readonly getAllByAccountIdAdvertisementUseCase: GetAllByAccountIdAdvertisementUseCase,
    private readonly getAllAccountUseCase: GetAllAccountUseCase,
    private readonly getByIdAccountUseCase: GetByIdAccountUseCase,
    private readonly getRegisteredAccountsUseCase: GetRegisteredAccountsUseCase,
    private readonly getAllUserByAccountIdUseCase: GetAllUserByAccountIdUseCase,
    private readonly pathAccountUseCase: PathAccountUseCase,
    private readonly processImageAccountUseCase: ProcessImageAccountUseCase,
    private readonly updateStatusAccountUseCase: UpdateStatusAccountUseCase,
  ) {}

  @ApiBearerAuth()
  @Post()
  @Auth()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ id: string }> {
    return this.createAccountUseCase.execute({
      email: authenticatedUser.email,
      uid: authenticatedUser.uid,
      planId: createAccountDto.planId,
      name: createAccountDto.name,
      phone: createAccountDto.phone,
      documentType: createAccountDto.documentType,
      documentNumber: createAccountDto.documentNumber
    });
  }

  @ApiBearerAuth()
  @Get()
  @Auth('MASTER')
  async getAll(): Promise<Account[]> {
    return this.getAllAccountUseCase.execute();
  }

  @ApiBearerAuth()
  @Get('inactives')
  @Auth('MASTER')
  async getInactiveAccounts(): Promise<Account[]> {
    return this.findInactivesAccountUseCase.execute();
  }

  @ApiBearerAuth()
  @Get('registrations')
  @Auth('MASTER')
  async getAccountRegistrations(@Query('period') period: 'week' | 'month'): Promise<any[]> {
    return this.getRegisteredAccountsUseCase.execute({
      period
    });
  }

  @ApiBearerAuth()
  @Get(':accountid')
  async get(@Param('accountid') accountId: string): Promise<Account> {
      return this.getByIdAccountUseCase.execute({
        id: accountId
      });
  }

  @ApiBearerAuth()
  @Patch(':accountid')
  @Auth('MASTER', 'ADMIN', 'USER')
  async patch(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('accountid') accountId: string, @Body() patchAccountDto: PatchAccountDto): Promise<void> {
      await this.pathAccountUseCase.execute({
        userRole: authenticatedUser.userRole,
        accountId: authenticatedUser.accountId,
        targetAccountId: accountId,
        documentType: patchAccountDto.documentType,
        documentNumber: patchAccountDto.documentNumber,
        name: patchAccountDto.name,
        address: patchAccountDto.address,
        phone: patchAccountDto.phone,
        whatsApp: patchAccountDto.whatsApp,
        phone2: patchAccountDto.phone2,
        whatsApp2: patchAccountDto.whatsApp2,
        webSite: patchAccountDto.webSite,
        socialMedia: patchAccountDto.socialMedia,
        description: patchAccountDto.description,
        contractTypes: patchAccountDto.contractTypes
      });
  }

  @ApiBearerAuth()
  @Put(':accountid/status')
  @Auth('MASTER')
  async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('accountid') accountId: string, @Body() updateStatusAccountDto: UpdateStatusAccountDto): Promise<{ id: string }> {
      return await this.updateStatusAccountUseCase.execute({
        userRole: authenticatedUser.userRole,
        accountId,
        status: updateStatusAccountDto.status
      });
  }

  @ApiBearerAuth()
  @Get(':accountid/users')
  @Auth('MASTER')
  async getUsers(@Param('accountid') accountId: string): Promise<User[]> {
      return this.getAllUserByAccountIdUseCase.execute({
          accountId
      });
  }

  @ApiBearerAuth()
  @Get(':accountid/advertisements')
  @Auth('MASTER')
  async getAdvertisements(@Param('accountid') accountId: string, @Query() getAdvertisementDto: GetAdvertisementDto): Promise<{ data: Advertisement[]; count: number }> {
    return this.getAllByAccountIdAdvertisementUseCase.execute({ accountId, page: getAdvertisementDto.page, limit: getAdvertisementDto.limit, code: getAdvertisementDto.code , transactionType: getAdvertisementDto.transactionType, type: getAdvertisementDto.type, externalId: getAdvertisementDto.externalId });
  }

  @ApiBearerAuth()
  @Delete(':accountid/users/:userid')
  @Auth('MASTER')
  async deleteUser(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string): Promise<void> {
      await this.deleteUserAccountUseCase.execute({
        userRole: authenticatedUser.userRole,
        accountId: authenticatedUser.accountId,
        userId
      });
  }

  @ApiBearerAuth()
  @Post('me/images')
  @Auth('ADMIN')
  @UsePipes(new ValidationPipe({transform: true}))
  async uploadImage(
      @Authenticated() authenticatedUser: AuthenticatedUser, @Body() uploadImageAccountDto: UploadImageAccountDto): Promise<void> {
      await this.processImageAccountUseCase.execute({
        accountId: authenticatedUser.accountId,
        content: uploadImageAccountDto.content,
        contentType: uploadImageAccountDto.contentType
      });
  }

  @ApiBearerAuth()
  @Delete('me/images')
  @Auth('ADMIN', 'USER')
  async deleteImage(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<void> {
      await this.deleteImageAccountUseCase.execute({
        accountId: authenticatedUser.accountId
      });
  }
}
