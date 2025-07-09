import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { GetAdvertisementStatisticsUseCase } from 'src/application/use-cases/advertisement-statistics/get-advertisement-statistics.use-case';
import { AdvertisementStatistics } from 'src/domain/entities/advertisement-statistics';
import { GenerateAdvertisementMonthlyStatisticsUseCase } from 'src/application/use-cases/advertisement-statistics/generate-advertisement-monthly-statistics.use-case';
import { GenerateAdvertisementMonthlyStatisticsDto } from '../dtos/advertisement-statistics/generate-advertisement-monthly-statistics.dto';
import { GetAdvertisementStatisticsByMonthDto } from '../dtos/advertisement-statistics/get-advertisement-statistics-by-month.dto';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { GetAllAccountAdvertisementStatisticsDto } from '../dtos/account-advertisement-statistics/get-all-account-advertisement-statistics.dto';
import { UserRole } from 'src/domain/entities/user';
import { GetAccountAdvertisementStatisticsUseCase } from 'src/application/use-cases/account-advertisement-statistic/get-account-advertisement-statistics.use-case';
import { GenerateAccountAdvertisementMonthlyStatisticsUseCase } from 'src/application/use-cases/account-advertisement-statistic/generate-account-advertisement-monthly-statistics.use-case';
import { GetAccountAdvertisementStatisticsByMonthDto } from '../dtos/account-advertisement-statistics/get-account-advertisement-statistics-by-month.dto';
import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { GenerateAccountAdvertisementMonthlyStatisticsDto } from '../dtos/account-advertisement-statistics/generate-account-advertisement-monthly-statistics.dto';

@ApiTags('v1/advertisements-statistics')
@Controller('v1/advertisements-statistics')
export class AdvertisementStatisticsController {
  constructor(
    private readonly getAdvertisementStatisticsUseCase: GetAdvertisementStatisticsUseCase,
    private readonly generateAdvertisementMonthlyStatisticsUseCase: GenerateAdvertisementMonthlyStatisticsUseCase,
    private readonly getAccountAdvertisementStatisticsUseCase: GetAccountAdvertisementStatisticsUseCase,
    private readonly generateAccountAdvertisementMonthlyStatisticsUseCase: GenerateAccountAdvertisementMonthlyStatisticsUseCase,
  ) {}

  @ApiBearerAuth()
  @Get('accounts')
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
    @Query() query: GetAllAccountAdvertisementStatisticsDto,
  ): Promise<string[]> {
    // Validação específica para usuários MASTER
    if (authenticatedUser.userRole === UserRole.MASTER && !query.accountId) {
      throw new Error('invalid.accountId.should.not.be.empty');
    }
    
    const accountId = authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : query.accountId;
    
    return this.getAccountAdvertisementStatisticsUseCase.getAllMonthsByAccount(accountId);
  }

  @ApiBearerAuth()
  @Get('accounts/:month')
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
  async getByMonthByAccount(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Param() params: GetAccountAdvertisementStatisticsByMonthDto,
    @Query() query: GetAllAccountAdvertisementStatisticsDto,
  ): Promise<AccountAdvertisementStatistics> {
    // Validação específica para usuários MASTER
    if (authenticatedUser.userRole === UserRole.MASTER && !query.accountId) {
      throw new Error('invalid.accountId.should.not.be.empty');
    }
    
    const accountId = authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : query.accountId;
    
    return this.getAccountAdvertisementStatisticsUseCase.getByMonth(accountId, params.month);
  }

  @ApiBearerAuth()
  @Post('accounts')
  @Auth('MASTER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Gerar estatísticas de anúncios para todas as contas ativas' })
  @ApiResponse({ status: 200, description: 'Estatísticas geradas com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  async generateByAccount(
    @Body() generateAccountAdvertisementMonthlyStatisticsDto: GenerateAccountAdvertisementMonthlyStatisticsDto,
  ): Promise<void> {
    await this.generateAccountAdvertisementMonthlyStatisticsUseCase.execute({
      month: generateAccountAdvertisementMonthlyStatisticsDto.month,
      accountId: generateAccountAdvertisementMonthlyStatisticsDto.accountId,
    });
  }

  @ApiBearerAuth()
  @Get()
  @Auth('MASTER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Listar todos os meses de estatísticas consolidadas de anúncios (apenas MASTER)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de meses de estatísticas de anúncios encontrados com sucesso',
    type: String,
    isArray: true
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 404, description: 'Estatísticas não encontradas' })
  async getAllMonths(): Promise<string[]> {
    return this.getAdvertisementStatisticsUseCase.getAllMonths();
  }

  @ApiBearerAuth()
  @Get(':month')
  @Auth('MASTER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Obter estatísticas consolidadas de anúncios para o mês especificado (apenas MASTER)' })
  @ApiParam({ 
    name: 'month', 
    description: 'Mês para o qual as estatísticas serão consultadas (formato: YYYY-MM)',
    example: '2025-04'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatísticas de anúncios encontradas com sucesso',
    type: AdvertisementStatistics
  })
  @ApiResponse({ status: 400, description: 'Formato de mês inválido ou parâmetros inválidos' })
  @ApiResponse({ status: 404, description: 'Estatísticas não encontradas' })
  async getByMonth(
    @Param() params: GetAdvertisementStatisticsByMonthDto,
  ): Promise<AdvertisementStatistics> {
    return this.getAdvertisementStatisticsUseCase.getByMonth(params.month);
  }

  @ApiBearerAuth()
  @Post()
  @Auth('MASTER')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Gerar estatísticas consolidadas de anúncios para todos os anúncios ativos (apenas MASTER)' })
  @ApiResponse({ status: 200, description: 'Estatísticas consolidadas geradas com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  async generate(
    @Body() generateAdvertisementMonthlyStatisticsDto: GenerateAdvertisementMonthlyStatisticsDto,
  ): Promise<void> {
    await this.generateAdvertisementMonthlyStatisticsUseCase.execute({
      month: generateAdvertisementMonthlyStatisticsDto.month,
    });
  }
}
