import { Body, Controller, Get, Post } from '@nestjs/common';
import { BlacklistWord } from 'src/domain/entities/blacklist-word';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreateBlacklistWordDto } from 'src/infraestructure/http/dtos/blacklist-word/create-blacklist-word.dto';
import { CreateBlacklistWordUseCase } from 'src/application/use-cases/blacklist-word/create-blacklist-word.use-case';
import { GetAllBlacklistWordUseCase } from 'src/application/use-cases/blacklist-word/get-all-blacklist-word.use-case';
import { GetAllBlacklistWordsOutputDto } from 'src/infraestructure/http/dtos/blacklist-word/output/get-all-blacklist-words.output.dto';
import { GetAllBlacklistWordsOutputDtoMapper } from 'src/infraestructure/http/dtos/blacklist-word/output/mapper/get-all-blacklist-words.output.dto.mapper';

@ApiTags('v1/blacklist-words')
@Controller('v1/blacklist-words')
export class BlacklistWordController {

    constructor(
        private readonly createBlacklistWordUseCase: CreateBlacklistWordUseCase,
        private readonly getAllBlacklistWordUseCase: GetAllBlacklistWordUseCase,
    ) {}

    @ApiBearerAuth()
    @Get()
    @Auth('MASTER')
    @ApiResponse({
        status: 200,
        description: 'Retorna a lista de palavras bloqueadas',
        type: [GetAllBlacklistWordsOutputDto]
    })
    async getAll(): Promise<GetAllBlacklistWordsOutputDto[]> {
        const blacklistWords = await this.getAllBlacklistWordUseCase.execute();
        return GetAllBlacklistWordsOutputDtoMapper.toOutputDtoList(blacklistWords);
    }

    @ApiBearerAuth()
    @Post()
    @Auth('MASTER')
    async create(@Body() createBlacklistWordDto: CreateBlacklistWordDto): Promise<BlacklistWord> {
        const response = await this.createBlacklistWordUseCase.execute(createBlacklistWordDto);
        if (!response) return null;

        return response;
    }
}