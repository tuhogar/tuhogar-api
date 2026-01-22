import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAccountEventDto } from 'src/infraestructure/http/dtos/account-event/create-account-event.dto';
import { AccountEvent } from 'src/domain/entities/account-event';
import { CreateAccountEventUseCase } from 'src/application/use-cases/account-event/create-account-event.use-case';

@ApiTags('v1/account-events')
@Controller('v1/account-events')
export class AccountEventController {
    constructor(
        private readonly createAccountEventUseCase: CreateAccountEventUseCase,
    ) {}

    @Post()
    async create(@Body() createAccountEventDto: CreateAccountEventDto): Promise<AccountEvent> {
        const response = await this.createAccountEventUseCase.execute(createAccountEventDto);
        if (!response) return null;

        return response;
    }
}