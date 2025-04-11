# Diagrama de Classes - Consulta de Dados da Conta

```mermaid
classDiagram
    %% Entidades de Domínio
    class Account {
        +string id
        +string name
        +AccountType type
        +string description
        +string phone
        +string email
        +string website
        +string logoUrl
        +string address
        +AccountStatus status
        +Date createdAt
        +Date updatedAt
        +constructor(props: Account)
    }
    
    class AccountType {
        <<enumeration>>
        REAL_ESTATE
        INDIVIDUAL_OWNER
        DEVELOPER
        OTHER
    }
    
    class AccountStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
        PENDING
        SUSPENDED
    }
    
    class User {
        +string id
        +string email
        +string name
        +string lastName
        +string phone
        +UserRole role
        +UserStatus status
        +string accountId
        +string firebaseId
        +Date createdAt
        +Date updatedAt
    }
    
    class AuthenticatedUser {
        +string id
        +string email
        +string name
        +UserRole role
        +string accountId
    }
    
    class AccountStatistics {
        +number activeAdvertisements
        +number totalAdvertisements
        +number totalViews
        +number totalFavorites
        +number totalUsers
        +Date lastActivityDate
        +constructor(props: AccountStatistics)
    }
    
    class AccountDetailsDto {
        +Account account
        +AccountStatistics statistics
        +User[] users
        +constructor(account: Account, statistics: AccountStatistics, users: User[])
    }
    
    %% Interfaces
    class IAccountRepository {
        <<interface>>
        +findOneById(id: string) Promise~Account~
    }
    
    class IUserRepository {
        <<interface>>
        +findAllByAccountId(accountId: string) Promise~User[]~
    }
    
    class IAdvertisementRepository {
        <<interface>>
        +countByAccountId(accountId: string, filters?: any) Promise~number~
        +getStatisticsByAccountId(accountId: string) Promise~any~
    }
    
    %% Casos de Uso
    class GetAccountDetailsUseCase {
        -IAccountRepository accountRepository
        -IUserRepository userRepository
        -IAdvertisementRepository advertisementRepository
        +constructor(dependencies: ...)
        +execute(authenticatedUser: AuthenticatedUser, accountId: string) Promise~AccountDetailsDto~
    }
    
    %% Implementações
    class MongooseAccountRepository {
        -AccountModel accountModel
        +constructor(accountModel: Model)
        +findOneById(id: string) Promise~Account~
    }
    
    class MongooseUserRepository {
        -UserModel userModel
        +constructor(userModel: Model)
        +findAllByAccountId(accountId: string) Promise~User[]~
    }
    
    class MongooseAdvertisementRepository {
        -AdvertisementModel advertisementModel
        +constructor(advertisementModel: Model)
        +countByAccountId(accountId: string, filters?: any) Promise~number~
        +getStatisticsByAccountId(accountId: string) Promise~any~
    }
    
    class AccountController {
        -GetAccountDetailsUseCase getAccountDetailsUseCase
        +constructor(getAccountDetailsUseCase: GetAccountDetailsUseCase)
        +getDetails(authenticatedUser: AuthenticatedUser, accountId: string) Promise~AccountDetailsDto~
    }
    
    %% Relações
    Account "1" -- "1" AccountType : tem >
    Account "1" -- "1" AccountStatus : tem >
    User "*" -- "1" Account : pertence a >
    
    IAccountRepository <|.. MongooseAccountRepository : implementa
    IUserRepository <|.. MongooseUserRepository : implementa
    IAdvertisementRepository <|.. MongooseAdvertisementRepository : implementa
    
    GetAccountDetailsUseCase --> IAccountRepository : usa >
    GetAccountDetailsUseCase --> IUserRepository : usa >
    GetAccountDetailsUseCase --> IAdvertisementRepository : usa >
    
    AccountController --> GetAccountDetailsUseCase : usa >
    
    GetAccountDetailsUseCase ..> AuthenticatedUser : usa >
    GetAccountDetailsUseCase ..> AccountDetailsDto : retorna >
    AccountDetailsDto o-- Account : contém >
    AccountDetailsDto o-- AccountStatistics : contém >
    AccountDetailsDto o-- User : contém >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de consulta de dados de uma conta no sistema tuhogar-api.

### Entidades de Domínio
- **Account**: Representa uma conta no sistema com seus atributos
- **AccountType**: Enumeração que define os possíveis tipos de conta (REAL_ESTATE, INDIVIDUAL_OWNER, DEVELOPER, OTHER)
- **AccountStatus**: Enumeração que define os possíveis estados de uma conta (ACTIVE, INACTIVE, PENDING, SUSPENDED)
- **User**: Representa um usuário no sistema
- **AuthenticatedUser**: Representa um usuário autenticado com informações reduzidas
- **AccountStatistics**: Contém métricas e estatísticas relacionadas à conta
- **AccountDetailsDto**: Objeto de transferência de dados que agrupa informações da conta, estatísticas e usuários

### Interfaces
- **IAccountRepository**: Interface para acesso aos dados de contas
- **IUserRepository**: Interface para acesso aos dados de usuários
- **IAdvertisementRepository**: Interface para acesso aos dados de anúncios e estatísticas

### Casos de Uso
- **GetAccountDetailsUseCase**: Orquestra o processo de consulta de dados detalhados de uma conta

### Implementações
- **MongooseAccountRepository**: Implementação do repositório de contas usando MongoDB/Mongoose
- **MongooseUserRepository**: Implementação do repositório de usuários usando MongoDB/Mongoose
- **MongooseAdvertisementRepository**: Implementação do repositório de anúncios usando MongoDB/Mongoose
- **AccountController**: Controlador HTTP para endpoints relacionados a contas

### Relações
- Uma Account tem um AccountType e um AccountStatus
- Vários Users podem pertencer a uma Account
- MongooseAccountRepository implementa IAccountRepository
- MongooseUserRepository implementa IUserRepository
- MongooseAdvertisementRepository implementa IAdvertisementRepository
- GetAccountDetailsUseCase depende de IAccountRepository, IUserRepository e IAdvertisementRepository
- AccountController depende de GetAccountDetailsUseCase
- GetAccountDetailsUseCase usa AuthenticatedUser e retorna AccountDetailsDto
- AccountDetailsDto contém Account, AccountStatistics e uma lista de User

### Responsabilidades
- O GetAccountDetailsUseCase coordena todo o processo de consulta de dados da conta, incluindo:
  - Verificação de autenticação e permissões
  - Obtenção dos dados básicos da conta
  - Obtenção das estatísticas relacionadas à conta
  - Obtenção da lista de usuários vinculados à conta
  - Montagem do objeto de resposta com todos os dados

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações.
