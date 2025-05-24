# Arquitetura do Projeto - tuhogar-api

## Visão Geral

O tuhogar-api é implementado seguindo os princípios de Clean Architecture e Domain-Driven Design (DDD), organizando o código em camadas bem definidas que separam as responsabilidades e minimizam o acoplamento entre os componentes.

## Estrutura de Camadas

### 1. Camada de Domínio (`/src/domain`)

Esta camada contém as entidades de negócio e regras de domínio independentes de qualquer framework ou tecnologia externa.

#### Entidades Principais:
- `Account`: Representa uma conta no sistema
- `Advertisement`: Representa um anúncio imobiliário
- `User`: Representa um usuário do sistema
- `Subscription`: Representa uma assinatura de plano
- `Plan`: Representa um plano de assinatura
- `SubscriptionPayment`: Representa um pagamento de assinatura
- `SubscriptionInvoice`: Representa uma fatura de assinatura
- `SubscriptionNotification`: Representa notificações de eventos relacionados a assinaturas

### 2. Camada de Aplicação (`/src/application`)

Esta camada contém os casos de uso da aplicação, que orquestram o fluxo de dados entre as entidades do domínio e a infraestrutura.

#### Casos de Uso:
- Organizados por entidade (account, advertisement, subscription, user, etc.)
- Implementam a lógica de negócio específica da aplicação
- Utilizam interfaces para se comunicar com a infraestrutura

#### Interfaces:
- Repositórios: Definem contratos para persistência de dados
- Serviços: Definem contratos para serviços externos (pagamentos, autenticação, etc.)

### 3. Camada de Infraestrutura (`/src/infraestructure`)

Esta camada contém implementações concretas das interfaces definidas na camada de aplicação, além de adaptadores para frameworks e bibliotecas externas.

#### Componentes:
- **HTTP**: Controladores e DTOs para a API REST
  - Controllers: Implementam os endpoints da API
  - DTOs: Objetos de transferência de dados para validação de entrada/saída
  - Decorators: Implementam aspectos transversais como autenticação

- **Persistence**: Implementações de repositórios
  - Mongoose: Implementações de repositórios usando MongoDB/Mongoose
  - Mappers: Convertem entre entidades de domínio e modelos de persistência

- **Payment Gateway**: Integrações com gateways de pagamento
  - ePayco: Implementação da integração com o gateway ePayco

- **Authentication**: Serviços de autenticação
  - Firebase: Integração com Firebase Authentication

## Funcionalidades Principais

### 1. Gerenciamento de Contas e Usuários
- Criação e gerenciamento de contas
- Registro e autenticação de usuários
- Controle de acesso baseado em papéis (RBAC)
- Recuperação de senha
- Limitação de anúncios por plano ([Documentação detalhada](./funcionalidades/limitacao-anuncios-por-plano.md))

## Padrões Arquiteturais

### 1. Injeção de Dependência
- Utiliza o sistema de injeção de dependência do NestJS
- Componentes são injetados através de construtores
- Facilita testes e substituição de implementações

### 2. Repository Pattern
- Abstrai o acesso a dados através de interfaces
- Implementações concretas na camada de infraestrutura
- Permite trocar a fonte de dados sem afetar a lógica de negócio

### 3. Use Case Pattern
- Cada operação de negócio é encapsulada em um caso de uso
- Casos de uso recebem dependências via injeção
- Facilita a manutenção e testabilidade

### 4. Mapper Pattern
- Conversão entre entidades de domínio e modelos de persistência
- Isola o domínio de detalhes de implementação da persistência

### 5. DTO Pattern
- Validação de dados de entrada/saída na API
- Separação clara entre modelos de API e entidades de domínio

## Tecnologias Utilizadas

### Framework Principal
- NestJS: Framework Node.js para construção de aplicações server-side

### Persistência
- MongoDB: Banco de dados NoSQL
- Mongoose: ODM para MongoDB

### Autenticação
- Firebase Authentication: Serviço de autenticação
- JWT: Tokens para autenticação entre serviços

### Pagamentos
- ePayco: Gateway de pagamento para processamento de assinaturas

### Outros
- Class-validator: Validação de DTOs
- Class-transformer: Transformação entre objetos
- Swagger/OpenAPI: Documentação da API

## Fluxo de Dados

1. As requisições HTTP chegam aos controladores na camada de infraestrutura
2. Os controladores validam os dados de entrada usando DTOs
3. Os controladores chamam os casos de uso apropriados
4. Os casos de uso implementam a lógica de negócio usando entidades do domínio
5. Os casos de uso interagem com repositórios e serviços através de interfaces
6. As implementações concretas dos repositórios e serviços na camada de infraestrutura lidam com detalhes técnicos
7. Os resultados fluem de volta através das camadas até o controlador
8. O controlador transforma os resultados em respostas HTTP

## Considerações de Escalabilidade

- Separação clara de responsabilidades facilita a manutenção
- Desacoplamento entre camadas permite evolução independente
- Uso de interfaces permite substituir implementações sem afetar o restante do sistema
- Arquitetura modular facilita o trabalho em equipe
