import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAccountEventDto } from 'src/infraestructure/http/dtos/account-event/create-account-event.dto';
import { GetAccountEventDto } from 'src/infraestructure/http/dtos/account-event/get-account-event.dto';
import { AccountEvent } from 'src/domain/entities/account-event';
import { CreateAccountEventUseCase } from 'src/application/use-cases/account-event/create-account-event.use-case';
import { GetAccountEventsUseCase } from 'src/application/use-cases/account-event/get-account-events.use-case';
import { Authenticated } from '../../decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { UserRole } from 'src/domain/entities/user';

@ApiTags('v1/account-events')
@Controller('v1/account-events')
export class AccountEventController {
  constructor(
    private readonly createAccountEventUseCase: CreateAccountEventUseCase,
    private readonly getAccountEventsUseCase: GetAccountEventsUseCase,
  ) {}

  @ApiBearerAuth()
  @Get()
  @Auth('MASTER', 'ADMIN', 'USER')
  async getAll(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Query() getAccountEventDto: GetAccountEventDto,
  ): Promise<AccountEvent[]> {
    if (
      !authenticatedUser.accountId &&
      authenticatedUser.userRole !== UserRole.MASTER
    )
      throw new Error('Unauthorized');

    let accountId: string | undefined;

    if (authenticatedUser.userRole === UserRole.MASTER) {
      accountId = getAccountEventDto.accountId || undefined;
    } else {
      accountId = authenticatedUser.accountId;
    }

    return this.getAccountEventsUseCase.execute({ accountId });
  }

  @Post()
  async create(
    @Body() createAccountEventDto: CreateAccountEventDto,
  ): Promise<AccountEvent> {
    const response = await this.createAccountEventUseCase.execute(
      createAccountEventDto,
    );
    if (!response) return null;

    return response;
  }
}
