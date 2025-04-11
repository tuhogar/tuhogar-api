import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { GetAccountAdvertisementStatisticsUseCase } from 'src/application/use-cases/account-advertisement-statistic/get-account-advertisement-statistics.use-case';
import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { GetAdvertisementStatisticsDto } from '../dtos/advertisement-statistics/get-advertisement-statistics.dto';
import { GenerateMonthlyStatisticsUseCase } from 'src/application/use-cases/account-advertisement-statistic/generate-monthly-statistics.use-case';
import { GenerateAdvertisementStatisticsDto } from '../dtos/advertisement-statistics/generate-advertisement-statistics.dto';

@ApiTags('v1/advertisements-statistics')
@Controller('v1/advertisements-statistics')
export class AdvertisementStatisticsController {
  constructor(
    private readonly getAccountAdvertisementStatisticsUseCase: GetAccountAdvertisementStatisticsUseCase,
    private readonly generateMonthlyStatisticsUseCase: GenerateMonthlyStatisticsUseCase,
  ) {}

  @ApiBearerAuth()
  @Get()
  @Auth('ADMIN', 'USER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Obter estatísticas de anúncios para o mês especificado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatísticas de anúncios encontradas com sucesso',
    type: AccountAdvertisementStatistics
  })
  @ApiResponse({ status: 400, description: 'Formato de mês inválido' })
  @ApiResponse({ status: 404, description: 'Estatísticas não encontradas' })
  async getStatistics(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Query() getAdvertisementStatisticsDto: GetAdvertisementStatisticsDto,
  ): Promise<AccountAdvertisementStatistics> {
    return this.getAccountAdvertisementStatisticsUseCase.execute({
      authenticatedUser,
      month: getAdvertisementStatisticsDto.month,
    });
  }

  @ApiBearerAuth()
  @Post('generate')
  @Auth('MASTER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Gerar estatísticas de anúncios para todas as contas ativas' })
  @ApiResponse({ status: 200, description: 'Estatísticas geradas com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  async generateStatistics(
    @Body() generateAdvertisementStatisticsDto: GenerateAdvertisementStatisticsDto,
  ): Promise<void> {
    await this.generateMonthlyStatisticsUseCase.execute({
      month: generateAdvertisementStatisticsDto.month,
      accountId: generateAdvertisementStatisticsDto.accountId,
    });
  }
}
