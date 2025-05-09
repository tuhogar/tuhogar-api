# Plano de Desenvolvimento: Histórico de Assinaturas

## Descrição da Funcionalidade

Esta funcionalidade permitirá aos usuários visualizar o histórico completo de suas assinaturas e pagamentos relacionados. O endpoint retornará todas as assinaturas associadas à conta do usuário autenticado, ordenadas por data de criação (mais recentes primeiro), juntamente com os pagamentos relacionados a cada assinatura.

Esta funcionalidade é importante para:
- Permitir que os usuários acompanhem seu histórico de assinaturas
- Fornecer transparência sobre os pagamentos realizados
- Facilitar a resolução de problemas relacionados a cobranças
- Melhorar a experiência do usuário ao fornecer informações detalhadas sobre seu relacionamento com a plataforma

## Arquitetura

Seguindo os princípios de Clean Architecture do projeto, a implementação será organizada nas seguintes camadas:

1. **Domain (Entidades de negócio)**
   - Utilizaremos as entidades existentes: `Subscription`, `SubscriptionPayment` e `Plan`
   - Criaremos uma nova entidade: `SubscriptionWithPayments` para representar a assinatura com seus pagamentos

2. **Application (Casos de uso)**
   - Criaremos um novo caso de uso: `GetSubscriptionHistoryUseCase`

3. **Infrastructure (Implementações concretas)**
   - HTTP: Adicionaremos um novo endpoint no `SubscriptionController`
   - DTOs: Criaremos novos DTOs para a saída da API
   - Repositories: Utilizaremos os repositórios existentes com possíveis extensões

## Tarefas

### 1. Criar Entidade de Domínio

- [x] Criar a entidade `SubscriptionWithPayments` em `src/domain/entities/subscription-with-payments.ts`
  - Estender a entidade `Subscription` existente
  - Adicionar um array de `SubscriptionPayment`

### 2. Atualizar Interface do Repositório

- [x] Adicionar método `findAllByAccountId` na interface `ISubscriptionRepository`
  - O método deve retornar todas as assinaturas de uma conta, ordenadas por data de criação (DESC)
  - Deve incluir o relacionamento com o plano (populate)

- [x] Adicionar método `findAllBySubscriptionId` na interface `ISubscriptionPaymentRepository`
  - O método deve retornar todos os pagamentos relacionados a uma assinatura

### 3. Implementar Repositórios

- [x] Implementar o método `findAllByAccountId` no `MongooseSubscriptionRepository`
  - Utilizar o padrão de consulta existente, adaptando para retornar múltiplos resultados
  - Garantir a ordenação por data de criação (DESC)
  - Incluir o populate do plano

- [x] Implementar o método `findAllBySubscriptionId` no `MongooseSubscriptionPaymentRepository`
  - Criar a consulta para retornar todos os pagamentos de uma assinatura
  - Ordenar por data de pagamento (DESC)

### 4. Criar Caso de Uso

- [x] Criar o caso de uso `GetSubscriptionHistoryUseCase` em `src/application/use-cases/subscription/get-subscription-history.use-case.ts`
  - Injetar os repositórios necessários (`ISubscriptionRepository` e `ISubscriptionPaymentRepository`)
  - Implementar o método `execute` que recebe o ID da conta e retorna o histórico de assinaturas com pagamentos
  - Garantir que todas as assinaturas e pagamentos estejam em UTC

### 5. Criar DTOs de Saída

- [x] Criar o DTO `GetSubscriptionHistoryOutputDto` em `src/infraestructure/http/dtos/subscription/output/get-subscription-history.output.dto.ts`
  - Incluir todas as propriedades necessárias para representar o histórico de assinaturas
  - Documentar com decoradores Swagger

- [x] Criar o mapeador `GetSubscriptionHistoryOutputDtoMapper` em `src/infraestructure/http/dtos/subscription/output/mapper/get-subscription-history.output.dto.mapper.ts`
  - Implementar o método estático `toOutputDto` para converter a entidade de domínio para o DTO de saída
  - Implementar o método estático `toOutputDtoList` para converter uma lista de entidades

### 6. Atualizar o Controller

- [x] Adicionar o caso de uso como dependência no construtor do `SubscriptionController`
- [x] Implementar o endpoint `GET /v1/subscriptions/history`
  - Utilizar os decoradores `@ApiBearerAuth()`, `@Get('history')` e `@Auth('ADMIN', 'USER')`
  - Documentar com decoradores Swagger
  - Extrair o `accountId` do usuário autenticado
  - Chamar o caso de uso e retornar o resultado mapeado para o DTO de saída

### 7. Testes

- [x] Criar testes unitários para o caso de uso
  - [x] Testar o cenário de sucesso
  - [x] Testar o cenário de erro (nenhuma assinatura encontrada)

- [x] Criar testes para o mapeador de DTO
  - [x] Garantir que a conversão de entidade para DTO funcione corretamente

### 8. Documentação

- [x] Atualizar a documentação da API para incluir o novo endpoint
  - Incluir descrição, parâmetros, respostas de sucesso e erro
  - Adicionar exemplos de requisição e resposta

## Progresso do Desenvolvimento

- Tarefas concluídas: 8/8
- Progresso: 100%

```
[■■■■■■■■] 100%
```
