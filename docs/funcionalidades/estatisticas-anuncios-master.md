# Funcionalidade: Estatísticas de Anúncios Imobiliários (Master)

## Visão Geral

A funcionalidade de Estatísticas de Anúncios Imobiliários permite a geração automática de relatórios estatísticos mensais sobre o desempenho dos anúncios em toda a plataforma, sem segmentação por conta. Estes relatórios fornecem insights valiosos sobre visualizações, interações e eficácia dos anúncios, segmentados por diferentes critérios como tipo de transação e tipo de propriedade. Esta funcionalidade é exclusiva para usuários com perfil MASTER.

## Componentes Principais

### 1. Entidades de Domínio

#### `AdvertisementStatistics`
Entidade principal que representa um relatório estatístico mensal consolidado para todos os anúncios da plataforma, sem segmentação por conta.

**Atributos principais:**
- `month`: Mês de referência do relatório (formato: YYYY-MM)
- `totalAdvertisements`: Métricas sobre o total de anúncios
- `totalVisits`: Métricas sobre o total de visitas aos anúncios
- `phoneClicks`: Métricas sobre cliques no telefone de contato
- `digitalCatalogViews`: Total de visualizações de catálogos digitais
- `contactInfoClicks`: Métricas sobre cliques em informações de contato
- `topViewedAdvertisements`: Top 5 anúncios mais visualizados
- `topInteractedAdvertisements`: Top 5 anúncios com maior interação

#### Entidades de Métricas
- `TotalAdvertisements`: Métricas sobre anúncios
- `TotalVisits`: Métricas sobre visitas
- `PhoneClicks`: Métricas sobre cliques em telefone
- `ContactInfoClicks`: Métricas sobre cliques em informações de contato

#### Entidades de Segmentação
- `TransactionTypeMetrics`: Métricas segmentadas por tipo de transação (venda/aluguel)
- `PropertyTypeAndTransactionMetrics`: Métricas segmentadas por tipo de propriedade e transação

#### Entidades de Ranking
- `TopAdvertisements`: Ranking dos anúncios mais relevantes
- `AdvertisementMetric`: Métrica individual de um anúncio no ranking

### 2. Casos de Uso

#### `GenerateAdvertisementMonthlyStatisticsUseCase`
Responsável pela geração automática e manual de estatísticas mensais consolidadas para todos os anúncios.

**Funcionalidades:**
- Agendamento automático para execução no primeiro dia de cada mês (após a geração das estatísticas por conta)
- Coleta de eventos de todos os anúncios do mês anterior
- Agregação de dados para todos os anúncios
- Cálculo de métricas segmentadas
- Identificação dos anúncios mais relevantes
- Persistência dos relatórios gerados

**Método principal:**
```typescript
@Cron('0 30 1 * *', {
  name: 'generate-advertisement-monthly-statistics',
  timeZone: 'America/Sao_Paulo',
})
async executeScheduled() {
  // Implementação da geração automática de estatísticas
}
```

#### `GetAdvertisementStatisticsUseCase`
Responsável pela consulta dos relatórios estatísticos.

**Métodos principais:**
- `getAllMonths()`: Retorna todos os meses com relatórios disponíveis
- `getByMonth(month: string)`: Retorna o relatório de um mês específico

### 3. Interfaces de Repositório

#### `IAdvertisementStatisticsRepository`
Interface que define os métodos para persistência e recuperação dos relatórios estatísticos.

**Métodos principais:**
- `create(statistics: AdvertisementStatistics)`: Cria um novo relatório
- `findByMonth(month: string)`: Busca um relatório específico por mês
- `findAllMonths()`: Busca todos os meses com relatórios disponíveis
- `update(id: string, statistics: Partial<AdvertisementStatistics>)`: Atualiza um relatório existente

### 4. Implementação de Repositório

#### `MongooseAdvertisementStatisticsRepository`
Implementação concreta do repositório usando MongoDB/Mongoose.

**Componentes:**
- Schema Mongoose para a collection `advertisement-statistics`
- Mapper para conversão entre entidade de domínio e modelo de persistência

### 5. Controller e DTOs

#### `MasterAdvertisementStatisticsController`
Controller que expõe os endpoints para consulta de estatísticas consolidadas de anúncios, exclusivo para usuários MASTER.

**Endpoints:**
- `GET /v1/advertisements-statistics/all`: Lista todos os meses com relatórios de estatísticas consolidadas
  - Restrito a usuários MASTER
  - Retorna um array de strings no formato YYYY-MM

- `GET /v1/advertisements-statistics/all/:month`: Obtém estatísticas consolidadas de um mês específico
  - Parâmetro de rota `month` no formato YYYY-MM
  - Restrito a usuários MASTER
  - Retorna o objeto completo de estatísticas consolidadas

- `POST /v1/advertisements-statistics/all/generate`: Gera manualmente estatísticas consolidadas
  - Restrito a usuários MASTER
  - Aceita um parâmetro opcional `month` no formato YYYY-MM
  - Se não for fornecido o mês, gera estatísticas para o mês anterior

#### DTOs

##### `GetAdvertisementStatisticsByMonthDto`
DTO para validação do parâmetro de mês na consulta de estatísticas.

```typescript
export class GetAdvertisementStatisticsByMonthDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'O mês deve estar no formato YYYY-MM',
  })
  month: string;
}
```

##### `GenerateAdvertisementMonthlyStatisticsDto`
DTO para geração manual de estatísticas com mês opcional.

```typescript
export class GenerateAdvertisementMonthlyStatisticsDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'O mês deve estar no formato YYYY-MM',
  })
  month?: string;
}
```

## Fluxo de Funcionamento

### Geração Automática de Estatísticas
1. O agendador (`@Cron` com nome `generate-advertisement-monthly-statistics`) dispara o método `executeScheduled()` no primeiro dia de cada mês às 00:30 (após a geração das estatísticas por conta)
2. O sistema:
   - Coleta todos os eventos de anúncios do mês anterior para todos os anúncios na plataforma
   - Agrega os dados para todos os anúncios
   - Calcula métricas segmentadas por tipo de transação e propriedade
   - Identifica os 5 anúncios mais visualizados e os 5 com maior interação
   - Cria ou atualiza o relatório estatístico na collection `advertisement-statistics`

### Consulta de Estatísticas
1. O usuário MASTER acessa um dos endpoints de consulta
2. O sistema valida a autenticação e autorização do usuário
3. O sistema recupera os relatórios solicitados do repositório
4. Os relatórios são retornados ao usuário no formato JSON

## Controle de Acesso

- Apenas usuários com perfil MASTER podem acessar os relatórios de estatísticas
- Tanto a consulta quanto a geração manual de estatísticas são restritas a usuários MASTER

## Considerações Técnicas

### Persistência
- Os relatórios são armazenados na collection `advertisement-statistics`
- Cada documento representa um relatório mensal
- A chave `month` garante unicidade dos relatórios

### Performance
- Índices são criados para otimizar consultas por `month`
- A geração de estatísticas é um processo assíncrono que não impacta a experiência do usuário
- Os relatórios são pré-calculados, permitindo consultas rápidas

### Extensibilidade
- A estrutura modular permite adicionar facilmente novas métricas ou segmentações
- Novos tipos de eventos podem ser incorporados ao sistema de estatísticas
- A arquitetura permite a implementação futura de exportação de relatórios em diferentes formatos

## Exemplos de Uso

### Consulta de Todos os Meses com Relatórios
```
GET /v1/advertisements-statistics/all
```

### Consulta de Relatório Específico
```
GET /v1/advertisements-statistics/all/2025-03
```

### Geração Manual de Estatísticas
```
POST /v1/advertisements-statistics/all/generate
{
  "month": "2025-03" // Opcional
}
```

## Plano de Implementação

### Fase 1: Estrutura Base
1. Criar entidade de domínio `AdvertisementStatistics` com as mesmas propriedades da entidade `AccountAdvertisementStatistics` existente, exceto o campo `accountId`
2. Definir interface `IAdvertisementStatisticsRepository` com os mesmos métodos da interface `IAccountAdvertisementStatisticsRepository`, adaptados para não usar accountId
3. Implementar repositório `MongooseAdvertisementStatisticsRepository` com os mesmos métodos do repositório existente
4. Configurar schema Mongoose para a nova collection `advertisement-statistics`

### Fase 2: Casos de Uso
1. Implementar `GenerateAdvertisementMonthlyStatisticsUseCase`
   - Reutilizar a lógica do caso de uso existente, mas processando todos os anúncios sem filtrar por conta
   - Configurar agendamento para execução após a geração das estatísticas por conta
2. Implementar `GetAdvertisementStatisticsUseCase`
   - Implementar métodos com os mesmos nomes do caso de uso existente, mas sem parâmetro accountId

### Fase 3: API e Controle de Acesso
1. Criar DTOs necessários com os mesmos nomes e estruturas dos DTOs existentes
2. Implementar `MasterAdvertisementStatisticsController` com endpoints em rotas diferentes
3. Configurar rotas com prefixo `/v1/master` e decoradores de autorização restritos a usuários MASTER
4. Adaptar validações existentes para o novo contexto sem accountId

### Fase 4: Testes e Documentação
1. Implementar testes unitários para os casos de uso
2. Implementar testes de integração para o controller e repositório
3. Atualizar a documentação da API (Swagger)
4. Validar controle de acesso e segurança

## Impacto no Sistema Existente

A nova funcionalidade será implementada como um complemento à funcionalidade existente de estatísticas por conta, minimizando o impacto no sistema atual. As principais considerações são:

1. O agendamento da geração de estatísticas consolidadas será configurado para ocorrer após a geração das estatísticas por conta
2. A nova collection `advertisement-statistics` será criada separadamente da collection existente `account-advertisements-statistics`
3. Os endpoints terão um prefixo diferente (`/v1/advertisements-statistics/all`) para evitar conflitos com os endpoints existentes
4. Os métodos internos e propriedades seguirão o mesmo padrão da funcionalidade existente
5. O controle de acesso será rigoroso, garantindo que apenas usuários MASTER possam acessar as estatísticas consolidadas
