# Funcionalidade: Estatísticas de Anúncios Imobiliários

## Visão Geral

A funcionalidade de Estatísticas de Anúncios Imobiliários permite a geração automática de relatórios estatísticos mensais sobre o desempenho dos anúncios de cada conta no sistema. Estes relatórios fornecem insights valiosos sobre visualizações, interações e eficácia dos anúncios, segmentados por diferentes critérios como tipo de transação e tipo de propriedade.

## Componentes Principais

### 1. Entidades de Domínio

#### `AccountAdvertisementStatistics`
Entidade principal que representa um relatório estatístico mensal para uma conta específica.

**Atributos principais:**
- `accountId`: ID da conta à qual o relatório pertence
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

#### `GenerateMonthlyStatisticsUseCase`
Responsável pela geração automática dos relatórios estatísticos mensais.

**Funcionalidades:**
- Agendamento automático para execução no primeiro dia de cada mês
- Coleta de eventos de anúncios do mês anterior
- Agregação de dados por conta
- Cálculo de métricas segmentadas
- Identificação dos anúncios mais relevantes
- Persistência dos relatórios gerados

**Método principal:**
```typescript
@Cron('0 0 1 * *', {
  name: 'generate-monthly-statistics',
  timeZone: 'America/Sao_Paulo',
})
async handleCron() {
  // Implementação da geração automática de estatísticas
}
```

#### `GetAccountAdvertisementStatisticsUseCase`
Responsável pela consulta dos relatórios estatísticos.

**Métodos principais:**
- `getAllByAccount(accountId: string)`: Retorna todos os relatórios de uma conta
- `getByMonth(accountId: string, month: string)`: Retorna o relatório de um mês específico

### 3. Interfaces de Repositório

#### `IAccountAdvertisementStatisticsRepository`
Interface que define os métodos para persistência e recuperação dos relatórios estatísticos.

**Métodos principais:**
- `create(statistics: AccountAdvertisementStatistics)`: Cria um novo relatório
- `findByAccountIdAndMonth(accountId: string, month: string)`: Busca um relatório específico
- `findAllByAccountId(accountId: string)`: Busca todos os relatórios de uma conta

### 4. Implementação de Repositório

#### `MongooseAccountAdvertisementStatisticsRepository`
Implementação concreta do repositório usando MongoDB/Mongoose.

**Componentes:**
- Schema Mongoose para a collection `account-advertisements-statistics`
- Mapper para conversão entre entidade de domínio e modelo de persistência

### 5. Controller e DTOs

#### `AdvertisementStatisticsController`
Controller que expõe os endpoints para consulta de estatísticas.

**Endpoints:**
- `GET /v1/advertisements-statistics`: Lista todos os relatórios de estatísticas
  - Suporta parâmetro de query `accountId` (obrigatório para usuários MASTER)
  - Retorna um array de `AccountAdvertisementStatistics`

- `GET /v1/advertisements-statistics/:month`: Obtém estatísticas de um mês específico
  - Parâmetro de rota `month` no formato YYYY-MM
  - Suporta parâmetro de query `accountId` (obrigatório para usuários MASTER)
  - Retorna um objeto `AccountAdvertisementStatistics`

- `POST /v1/advertisements-statistics/generate`: Endpoint administrativo para geração manual de estatísticas
  - Restrito a usuários MASTER
  - Aceita parâmetros de mês e accountId opcional

**DTOs:**
- `GetAllAdvertisementStatisticsDto`: DTO para parâmetros de consulta geral
- `GetAdvertisementStatisticsByMonthDto`: DTO para validação do formato do mês
- `GenerateAdvertisementStatisticsDto`: DTO para parâmetros de geração manual

## Fluxo de Funcionamento

### Geração Automática de Estatísticas
1. O agendador (`@Cron`) dispara o método `handleCron()` no primeiro dia de cada mês
2. O sistema obtém todas as contas ativas
3. Para cada conta, o sistema:
   - Coleta todos os eventos de anúncios do mês anterior
   - Agrega os dados por tipo de evento
   - Calcula métricas segmentadas por tipo de transação e propriedade
   - Identifica os 5 anúncios mais visualizados e os 5 com maior interação
   - Cria ou atualiza o relatório estatístico na collection
4. O processo é resiliente a falhas, continuando para a próxima conta em caso de erro

### Consulta de Estatísticas
1. O usuário acessa um dos endpoints de consulta
2. O sistema valida a autenticação e autorização do usuário
3. Para usuários MASTER, valida a presença do parâmetro `accountId`
4. O sistema recupera os relatórios solicitados do repositório
5. Os relatórios são retornados ao usuário no formato JSON

## Controle de Acesso

- Usuários com perfil USER ou ADMIN podem acessar apenas os relatórios de sua própria conta
- Usuários com perfil MASTER podem acessar relatórios de qualquer conta, desde que forneçam o `accountId`
- A geração manual de estatísticas é restrita a usuários MASTER

## Considerações Técnicas

### Persistência
- Os relatórios são armazenados na collection `account-advertisements-statistics`
- Cada documento representa um relatório mensal para uma conta específica
- A chave composta `{accountId, month}` garante unicidade dos relatórios

### Performance
- Índices são criados para otimizar consultas por `accountId` e `month`
- A geração de estatísticas é um processo assíncrono que não impacta a experiência do usuário
- Os relatórios são pré-calculados, permitindo consultas rápidas

### Extensibilidade
- A estrutura modular permite adicionar facilmente novas métricas ou segmentações
- Novos tipos de eventos podem ser incorporados ao sistema de estatísticas
- A arquitetura permite a implementação futura de exportação de relatórios em diferentes formatos

## Exemplos de Uso

### Consulta de Todos os Relatórios
```
GET /v1/advertisements-statistics
```

### Consulta de Relatório Específico
```
GET /v1/advertisements-statistics/2025-03
```

### Geração Manual de Estatísticas (apenas MASTER)
```
POST /v1/advertisements-statistics/generate
{
  "month": "2025-03",
  "accountId": "6073a75d56a1f3001f9d5a2b" // Opcional
}
```
