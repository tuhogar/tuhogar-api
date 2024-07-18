import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdvertisementReasonsService } from './advertisement-reasons.service';
import { AdvertisementReason } from './interfaces/advertisement-reasons.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { CreateUpdateAdvertisementReasonDto } from './dtos/create-update-advertisement-reason.dto';

@ApiTags('v1/advertisement-reasons')
@Controller('v1/advertisement-reasons')
export class AdvertisementReasonsController {
    constructor(
        private readonly advertisementReasonsService: AdvertisementReasonsService,
    ) {}

    @Get()
    async getAll(): Promise<AdvertisementReason[]> {
        return this.advertisementReasonsService.getAll();
    }

    @Post()
    @Auth('MASTER')
    async create(@Body() createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<void> {
        await this.advertisementReasonsService.create(createUpdateAdvertisementReasonDto);
    }

    @ApiBearerAuth()
    @Delete(':advertisementreasonid')
    @Auth('MASTER')
    async delete(@Param('advertisementreasonid') advertisementReasonId: string): Promise<void> {
        await this.advertisementReasonsService.delete(advertisementReasonId);
    }

    @ApiBearerAuth()
    @Put(':advertisementreasonid')
    @Auth('MASTER')
    async update(@Param('advertisementreasonid') advertisementReasonId: string, @Body() createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<{ id: string }> {
        return await this.advertisementReasonsService.update(
            advertisementReasonId,
            createUpdateAdvertisementReasonDto,
        );
    }
}
