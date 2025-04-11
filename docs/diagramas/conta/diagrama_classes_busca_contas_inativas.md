# Diagrama de Classes - Busca de Contas Inativas

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
        +AccountStatus status
        +Date lastActivityDate
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
        +isAdmin(): boolean
    }
    
    class InactiveAccountsFilter {
        +AccountStatus[] statuses
        +number inactiveDays
        +Date inactiveSince
        +Date inactiveUntil
        +AccountType[] types
        +constructor(props: InactiveAccountsFilter)
    }
    
    class InactiveAccountsResult {
        +Account[] accounts
        +number totalCount
        +number totalPages
        +number currentPage
        +number pageSize
        +constructor(props: InactiveAccountsResult)
    }
    
    class InactiveAccountsReport {
        +number totalInactiveAccounts
        +Map~AccountType, number~ distributionByType
        +Map~string, number~ distributionByInactiveDays
        +Account[] topInactiveAccounts
        +constructor(props: InactiveAccountsReport)
    }
    
    %% Interfaces
    class IAccountRepository {
        <<interface>>
        +findInactiveAccounts(filter: InactiveAccountsFilter, page: number, pageSize: number) Promise~InactiveAccountsResult~
        +countInactiveAccounts(filter: InactiveAccountsFilter) Promise~number~
        +getInactiveAccountsDistribution(filter: InactiveAccountsFilter) Promise~Map~
    }
    
    class IUserRepository {
        <<interface>>
        +findAllByAccountIds(accountIds: string[]) Promise~Map~string, User[]~~
    }
    
    class IReportService {
        <<interface>>
        +generateInactiveAccountsReport(accounts: Account[], users: Map~string, User[]~) Promise~InactiveAccountsReport~
    }
    
    class IExportService {
        <<interface>>
        +exportToCSV(data: any[], fields: string[]) Promise~Buffer~
        +exportToExcel(data: any[], sheets: {name: string, data: any[]}[]) Promise~Buffer~
    }
    
    %% Casos de Uso
    class FindInactiveAccountsUseCase {
        -IAccountRepository accountRepository
        -IUserRepository userRepository
        -IReportService reportService
        -IExportService exportService
        +constructor(dependencies: ...)
        +execute(authenticatedUser: AuthenticatedUser, filter: InactiveAccountsFilter, page: number, pageSize: number) Promise~InactiveAccountsResult~
        +generateReport(authenticatedUser: AuthenticatedUser, filter: InactiveAccountsFilter) Promise~InactiveAccountsReport~
        +exportToCSV(authenticatedUser: AuthenticatedUser, filter: InactiveAccountsFilter) Promise~Buffer~
        +exportToExcel(authenticatedUser: AuthenticatedUser, filter: InactiveAccountsFilter) Promise~Buffer~
    }
    
    %% Implementações
    class MongooseAccountRepository {
        -AccountModel accountModel
        +constructor(accountModel: Model)
        +findInactiveAccounts(filter: InactiveAccountsFilter, page: number, pageSize: number) Promise~InactiveAccountsResult~
        +countInactiveAccounts(filter: InactiveAccountsFilter) Promise~number~
        +getInactiveAccountsDistribution(filter: InactiveAccountsFilter) Promise~Map~
    }
    
    class MongooseUserRepository {
        -UserModel userModel
        +constructor(userModel: Model)
        +findAllByAccountIds(accountIds: string[]) Promise~Map~string, User[]~~
    }
    
    class PDFReportService {
        +constructor()
        +generateInactiveAccountsReport(accounts: Account[], users: Map~string, User[]~) Promise~InactiveAccountsReport~
    }
    
    class CsvExportService {
        +constructor()
        +exportToCSV(data: any[], fields: string[]) Promise~Buffer~
        +exportToExcel(data: any[], sheets: {name: string, data: any[]}[]) Promise~Buffer~
    }
    
    class AccountController {
        -FindInactiveAccountsUseCase findInactiveAccountsUseCase
        +constructor(findInactiveAccountsUseCase: FindInactiveAccountsUseCase)
        +findInactiveAccounts(authenticatedUser: AuthenticatedUser, filter: InactiveAccountsFilter, page: number, pageSize: number) Promise~InactiveAccountsResult~
        +generateReport(authenticatedUser: AuthenticatedUser, filter: InactiveAccountsFilter) Promise~InactiveAccountsReport~
        +exportToCSV(authenticatedUser: AuthenticatedUser, filter: InactiveAccountsFilter) Promise~Buffer~
        +exportToExcel(authenticatedUser: AuthenticatedUser, filter: InactiveAccountsFilter) Promise~Buffer~
    }
    
    %% Relações
    Account "1" -- "1" AccountType : tem >
    Account "1" -- "1" AccountStatus : tem >
    User "*" -- "1" Account : pertence a >
    
    IAccountRepository <|.. MongooseAccountRepository : implementa
    IUserRepository <|.. MongooseUserRepository : implementa
    IReportService <|.. PDFReportService : implementa
    IExportService <|.. CsvExportService : implementa
    
    FindInactiveAccountsUseCase --> IAccountRepository : usa >
    FindInactiveAccountsUseCase --> IUserRepository : usa >
    FindInactiveAccountsUseCase --> IReportService : usa >
    FindInactiveAccountsUseCase --> IExportService : usa >
    
    AccountController --> FindInactiveAccountsUseCase : usa >
    
    FindInactiveAccountsUseCase ..> AuthenticatedUser : usa >
    FindInactiveAccountsUseCase ..> InactiveAccountsFilter : usa >
    FindInactiveAccountsUseCase ..> InactiveAccountsResult : retorna >
    FindInactiveAccountsUseCase ..> InactiveAccountsReport : retorna >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de busca de contas inativas no sistema tuhogar-api, seguindo os princípios de Clean Architecture.

### Entidades de Domínio
- **Account**: Representa uma conta no sistema com seus atributos, incluindo status e data da última atividade
- **AccountType**: Enumeração que define os possíveis tipos de conta
- **AccountStatus**: Enumeração que define os possíveis estados de uma conta
- **User**: Representa um usuário no sistema
- **AuthenticatedUser**: Representa um usuário autenticado com informações reduzidas e método para verificar se é administrador
- **InactiveAccountsFilter**: Objeto que encapsula os critérios de filtragem para busca de contas inativas
- **InactiveAccountsResult**: Objeto que encapsula os resultados da busca de contas inativas, incluindo paginação
- **InactiveAccountsReport**: Objeto que encapsula o relatório detalhado sobre contas inativas

### Interfaces
- **IAccountRepository**: Interface para acesso e manipulação dos dados de contas, incluindo métodos específicos para busca de contas inativas
- **IUserRepository**: Interface para acesso aos dados de usuários vinculados às contas
- **IReportService**: Interface para geração de relatórios sobre contas inativas
- **IExportService**: Interface para exportação de dados em diferentes formatos

### Casos de Uso
- **FindInactiveAccountsUseCase**: Orquestra o processo de busca de contas inativas, geração de relatórios e exportação de dados

### Implementações
- **MongooseAccountRepository**: Implementação do repositório de contas usando MongoDB/Mongoose
- **MongooseUserRepository**: Implementação do repositório de usuários usando MongoDB/Mongoose
- **PDFReportService**: Implementação do serviço de relatórios em formato PDF
- **CsvExportService**: Implementação do serviço de exportação para CSV e Excel
- **AccountController**: Controlador HTTP para endpoints relacionados a contas

### Relações
- Uma Account tem um AccountType e um AccountStatus
- Vários Users podem pertencer a uma Account
- As implementações de repositório e serviço implementam suas respectivas interfaces
- FindInactiveAccountsUseCase depende de IAccountRepository, IUserRepository, IReportService e IExportService
- AccountController depende de FindInactiveAccountsUseCase
- FindInactiveAccountsUseCase usa AuthenticatedUser e InactiveAccountsFilter, e retorna InactiveAccountsResult e InactiveAccountsReport

### Responsabilidades
- O FindInactiveAccountsUseCase coordena todo o processo de busca de contas inativas, incluindo:
  - Verificação de autenticação e permissões
  - Aplicação dos filtros de busca
  - Recuperação das contas inativas
  - Recuperação dos usuários vinculados às contas
  - Geração de relatórios detalhados
  - Exportação dos resultados em diferentes formatos

### Filtros de Busca
- **statuses**: Lista de status a serem incluídos na busca (INACTIVE, SUSPENDED)
- **inactiveDays**: Número mínimo de dias de inatividade
- **inactiveSince**: Data a partir da qual considerar a inatividade
- **inactiveUntil**: Data até a qual considerar a inatividade
- **types**: Lista de tipos de conta a serem incluídos na busca

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações, conforme a estrutura do projeto tuhogar-api.
