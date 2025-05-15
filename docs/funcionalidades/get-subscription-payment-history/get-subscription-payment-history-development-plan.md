# Plano de Desenvolvimento: Histórico de Pagamentos de Assinaturas

## Descrição da Funcionalidade

Esta funcionalidade permitirá aos usuários visualizar o histórico completo de pagamentos de suas assinaturas, incluindo informações detalhadas sobre cada pagamento e a assinatura associada. O endpoint retornará uma lista paginada de pagamentos com detalhes da assinatura e do plano relacionados a cada pagamento.

## Arquitetura

A implementação seguirá os princípios de Clean Architecture do projeto, com clara separação entre:

1. **Domínio**: Entidades e regras de negócio
2. **Aplicação**: Casos de uso
3. **Infraestrutura**: Implementações concretas (controllers, repositórios, etc.)

### Estrutura de Retorno

O endpoint retornará os dados no seguinte formato:

```json
{
  "data": [
    {
      "id": "6817995af46724d3d574d849",
      "method": "VS",
      "amount": 10000,
      "currency": "COP",
      "status": "APPROVED",
      "paymentDate": "2023-01-01T00:00:00.000Z",
      "subscription": {
        "id": "6817995af46724d3d574d849",
        "status": "ACTIVE",
        "nextPaymentDate": "2023-02-01T00:00:00.000Z",
        "plan": {
          "id": "6817995af46724d3d574d849",
          "name": "Elite",
          "price": 29990
        }
      }
    }
  ],
  "count": 10
}
```

### Paginação

O endpoint implementará paginação através dos parâmetros:
- `page`: Número da página (começando em 1)
- `limit`: Quantidade de itens por página

## Tarefas

### 1. Criação de Entidades de Domínio

#### 1.1. Criar interface SubscriptionPaymentWithSubscription

- [x] 1.1.1. Definir interface que estende SubscriptionPayment e adiciona a propriedade subscription

### 2. Atualização das Interfaces de Repositório

#### 2.1. Atualizar ISubscriptionPaymentRepository

- [x] 2.1.1. Adicionar método findAllByAccountIdPaginated(accountId: string, page: number, limit: number): Promise<{ data: SubscriptionPayment[], count: number }>

### 3. Implementação dos Repositórios

#### 3.1. Atualizar MongooseSubscriptionPaymentRepository

- [x] 3.1.1. Implementar método findAllByAccountIdPaginated
- [x] 3.1.2. Adicionar lógica para calcular skip e limit para paginação
- [x] 3.1.3. Adicionar lógica para contar o total de documentos para a propriedade count
- [x] 3.1.4. Ordenar os pagamentos por createdAt (mais recentes primeiro)

### 4. Criação do Caso de Uso

#### 4.1. Criar GetSubscriptionPaymentHistoryUseCase

- [x] 4.1.1. Criar interface GetSubscriptionPaymentHistoryUseCaseCommand com accountId, page e limit
- [x] 4.1.2. Implementar caso de uso que recebe o comando e retorna Promise<{ data: SubscriptionPaymentWithSubscription[], count: number }>
- [x] 4.1.3. Injetar ISubscriptionPaymentRepository, ISubscriptionRepository e IPlanRepository
- [x] 4.1.4. Implementar lógica para buscar os pagamentos paginados
- [x] 4.1.5. Implementar lógica para buscar as assinaturas associadas a cada pagamento
- [x] 4.1.6. Implementar lógica para buscar os planos associados a cada assinatura
- [x] 4.1.7. Combinar os dados em objetos SubscriptionPaymentWithSubscription
- [x] 4.1.8. Implementar tratamento de erros adequado

### 5. Criação dos DTOs

#### 5.1. Criar GetSubscriptionPaymentHistoryDto

- [x] 5.1.1. Criar DTO para receber os parâmetros page e limit
- [x] 5.1.2. Adicionar validações usando class-validator
- [x] 5.1.3. Documentar com decoradores Swagger

#### 5.2. Criar DTO de Saída

- [x] 5.2.1. Criar GetSubscriptionPaymentHistoryOutputDto para representar cada registro de pagamento
- [x] 5.2.2. Definir todas as propriedades no mesmo DTO, incluindo objetos aninhados (subscription e plan)
- [x] 5.2.3. Documentar o DTO com decoradores Swagger

#### 5.3. Criar Mapeador para DTO

- [x] 5.3.1. Criar GetSubscriptionPaymentHistoryOutputDtoMapper para converter entidades para DTO
- [x] 5.3.2. Implementar método toOutputDto para mapear um único pagamento
- [x] 5.3.3. Implementar método toOutputDtoList para mapear uma lista de pagamentos

### 6. Implementação do Endpoint

#### 6.1. Atualizar SubscriptionController

- [x] 6.1.1. Injetar GetSubscriptionPaymentHistoryUseCase no construtor
- [x] 6.1.2. Criar método getSubscriptionPaymentHistory
- [x] 6.1.3. Adicionar decoradores para rota, autenticação e documentação
- [x] 6.1.4. Implementar lógica para extrair accountId do usuário autenticado
- [x] 6.1.5. Implementar lógica para extrair page e limit do DTO
- [x] 6.1.6. Chamar o caso de uso e retornar o resultado no formato { data: GetSubscriptionPaymentHistoryOutputDto[], count: number }

### 7. Atualização do Módulo HTTP

- [x] 7.1. Adicionar GetSubscriptionPaymentHistoryUseCase aos providers do módulo HTTP

### 8. Testes

#### 8.1. Testes Unitários

- [x] 8.1.1. Criar testes para GetSubscriptionPaymentHistoryUseCase
- [x] 8.1.2. Criar testes para GetSubscriptionPaymentHistoryOutputDtoMapper



## Progresso

- Total de tarefas: 23
- Tarefas concluídas: 23
- Progresso: 100%

## Considerações Adicionais

1. A paginação seguirá o mesmo padrão implementado no endpoint GET /v1/advertisements/actives
2. Os pagamentos serão ordenados por createdAt, com os mais recentes primeiro
3. O endpoint estará disponível apenas para usuários autenticados com perfil ADMIN ou USER
4. A resposta incluirá apenas as propriedades necessárias de cada entidade, seguindo o princípio de exposição mínima de dados
