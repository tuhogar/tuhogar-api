import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAdvertisementEventDto } from 'src/infraestructure/http/dtos/advertisement-event/create-advertisement-event.dto';
import { AdvertisementEvent } from 'src/domain/entities/advertisement-event';
import { CreateAdvertisementEventUseCase } from 'src/application/use-cases/advertisement-event/create-advertisement-event.use-case';

@ApiTags('v1/advertisement-events')
@Controller('v1/advertisement-events')
export class AdvertisementEventController {
    constructor(
        private readonly createAdvertisementEventUseCase: CreateAdvertisementEventUseCase,
    ) {}

    @Post()
    async create(@Body() createAdvertisementEventDto: CreateAdvertisementEventDto): Promise<AdvertisementEvent> {
        const response = await this.createAdvertisementEventUseCase.execute(createAdvertisementEventDto);
        if (!response) return null;

        return response;
    }
}