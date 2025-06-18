import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { GetAccountAdvertisementStatisticsUseCase } from 'src/application/use-cases/account-advertisement-statistic/get-account-advertisement-statistics.use-case';
import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { GenerateMonthlyStatisticsUseCase } from 'src/application/use-cases/account-advertisement-statistic/generate-monthly-statistics.use-case';
import { GenerateAdvertisementStatisticsDto } from '../dtos/advertisement-statistics/generate-advertisement-statistics.dto';
import { GetAdvertisementStatisticsByMonthDto } from '../dtos/advertisement-statistics/get-advertisement-statistics-by-month.dto';
import { GetAllAdvertisementStatisticsDto } from '../dtos/advertisement-statistics/get-all-advertisement-statistics.dto';
import { UserRole } from 'src/domain/entities/user';

@ApiTags('v1/advertisements-statistics')
@Controller('v1/advertisements-statistics')
export class AdvertisementStatisticsController {
  constructor(
    private readonly getAccountAdvertisementStatisticsUseCase: GetAccountAdvertisementStatisticsUseCase,
    private readonly generateMonthlyStatisticsUseCase: GenerateMonthlyStatisticsUseCase,
  ) {}

  @ApiBearerAuth()
  @Get()
  @Auth('ADMIN', 'USER', 'MASTER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Listar todos os meses de estatísticas da conta do usuário logado ou de uma conta específica (MASTER)' })
  @ApiQuery({
    name: 'accountId',
    description: 'ID da conta para filtrar estatísticas (obrigatório para MASTER, ignorado para outros perfis)',
    required: false,
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de meses de estatísticas de anúncios encontrados com sucesso',
    type: String,
    isArray: true
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 404, description: 'Estatísticas não encontradas' })
  async getAllMonthsByAccount(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Query() query: GetAllAdvertisementStatisticsDto,
  ): Promise<string[]> {
    // Validação específica para usuários MASTER
    if (authenticatedUser.userRole === UserRole.MASTER && !query.accountId) {
      throw new Error('invalid.accountId.should.not.be.empty');
    }
    
    const accountId = authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : query.accountId;
    
    return this.getAccountAdvertisementStatisticsUseCase.getAllMonthsByAccount(accountId);
  }

  @ApiBearerAuth()
  @Get(':month')
  @Auth('ADMIN', 'USER', 'MASTER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Obter estatísticas de anúncios para o mês especificado' })
  @ApiParam({ 
    name: 'month', 
    description: 'Mês para o qual as estatísticas serão consultadas (formato: YYYY-MM)',
    example: '2025-04'
  })
  @ApiQuery({
    name: 'accountId',
    description: 'ID da conta para filtrar estatísticas (obrigatório para MASTER, ignorado para outros perfis)',
    required: false,
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatísticas de anúncios encontradas com sucesso',
    type: AccountAdvertisementStatistics
  })
  @ApiResponse({ status: 400, description: 'Formato de mês inválido ou parâmetros inválidos' })
  @ApiResponse({ status: 404, description: 'Estatísticas não encontradas' })
  async getByMonth(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Param() params: GetAdvertisementStatisticsByMonthDto,
    @Query() query: GetAllAdvertisementStatisticsDto,
  ): Promise<AccountAdvertisementStatistics> {
    // Validação específica para usuários MASTER
    if (authenticatedUser.userRole === UserRole.MASTER && !query.accountId) {
      throw new Error('invalid.accountId.should.not.be.empty');
    }
    
    const accountId = authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : query.accountId;
    
    return this.getAccountAdvertisementStatisticsUseCase.getByMonth(accountId, params.month);
  }

  @ApiBearerAuth()
  @Post('generate')
  @Auth('MASTER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Gerar estatísticas de anúncios para todas as contas ativas' })
  @ApiResponse({ status: 200, description: 'Estatísticas geradas com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  async generates(
    @Body() generateAdvertisementStatisticsDto: GenerateAdvertisementStatisticsDto,
  ): Promise<void> {
    await this.generateMonthlyStatisticsUseCase.execute({
      month: generateAdvertisementStatisticsDto.month,
      accountId: generateAdvertisementStatisticsDto.accountId,
    });
  }
}
