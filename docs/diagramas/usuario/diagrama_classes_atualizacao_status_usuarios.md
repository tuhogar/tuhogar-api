# Diagrama de Classes - Atualização de Status de Usuários

```mermaid
classDiagram
    %% Entidades de Domínio
    class User {
        +string id
        +string email
        +string name
        +string lastName
        +string phone
        +string photoUrl
        +UserRole role
        +UserStatus status
        +string accountId
        +string firebaseId
        +Date createdAt
        +Date updatedAt
        +constructor(props: User)
    }
    
    class UserRole {
        <<enumeration>>
        ADMIN
        USER
    }
    
    class UserStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
    }
    
    class AuthenticatedUser {
        +string id
        +string email
        +string name
        +UserRole role
        +string accountId
        +constructor(props: AuthenticatedUser)
    }
    
    class UpdateUserStatusDto {
        +UserStatus status
        +constructor(status: UserStatus)
    }
    
    %% Interfaces
    class IUserRepository {
        <<interface>>
        +findOneById(id: string) Promise~User~
        +update(id: string, userData: Partial~User~) Promise~User~
    }
    
    class INotificationService {
        <<interface>>
        +sendStatusChangeNotification(user: User, newStatus: UserStatus) Promise~void~
    }
    
    %% Casos de Uso
    class UpdateUserStatusUseCase {
        -IUserRepository userRepository
        -INotificationService notificationService
        +constructor(dependencies: ...)
        +execute(authenticatedUser: AuthenticatedUser, userId: string, updateUserStatusDto: UpdateUserStatusDto) Promise~User~
    }
    
    %% Implementações
    class MongooseUserRepository {
        -UserModel userModel
        +constructor(userModel: Model)
        +findOneById(id: string) Promise~User~
        +update(id: string, userData: Partial~User~) Promise~User~
    }
    
    class EmailNotificationService {
        -EmailService emailService
        +constructor(emailService: EmailService)
        +sendStatusChangeNotification(user: User, newStatus: UserStatus) Promise~void~
    }
    
    class UserController {
        -UpdateUserStatusUseCase updateUserStatusUseCase
        +constructor(updateUserStatusUseCase: UpdateUserStatusUseCase)
        +updateStatus(authenticatedUser: AuthenticatedUser, userId: string, updateUserStatusDto: UpdateUserStatusDto) Promise~User~
    }
    
    %% Relações
    User "1" -- "1" UserRole : tem >
    User "1" -- "1" UserStatus : tem >
    
    IUserRepository <|.. MongooseUserRepository : implementa
    INotificationService <|.. EmailNotificationService : implementa
    
    UpdateUserStatusUseCase --> IUserRepository : usa >
    UpdateUserStatusUseCase --> INotificationService : usa >
    
    UserController --> UpdateUserStatusUseCase : usa >
    
    UpdateUserStatusUseCase ..> AuthenticatedUser : usa >
    UpdateUserStatusUseCase ..> UpdateUserStatusDto : usa >
    UpdateUserStatusUseCase ..> User : retorna >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de atualização de status de usuários no sistema tuhogar-api.

### Entidades de Domínio
- **User**: Representa um usuário no sistema com seus atributos
- **UserRole**: Enumeração que define os possíveis papéis de um usuário (ADMIN, USER)
- **UserStatus**: Enumeração que define os possíveis estados de um usuário (ACTIVE, INACTIVE)
- **AuthenticatedUser**: Representa um usuário autenticado com informações reduzidas
- **UpdateUserStatusDto**: Objeto de transferência de dados que contém o novo status do usuário

### Interfaces
- **IUserRepository**: Interface para acesso e manipulação dos dados de usuários
- **INotificationService**: Interface para envio de notificações

### Casos de Uso
- **UpdateUserStatusUseCase**: Orquestra o processo de atualização de status de um usuário

### Implementações
- **MongooseUserRepository**: Implementação do repositório de usuários usando MongoDB/Mongoose
- **EmailNotificationService**: Implementação do serviço de notificação por email
- **UserController**: Controlador HTTP para endpoints relacionados a usuários

### Relações
- Um User tem um UserRole e um UserStatus
- MongooseUserRepository implementa IUserRepository
- EmailNotificationService implementa INotificationService
- UpdateUserStatusUseCase depende de IUserRepository e INotificationService
- UserController depende de UpdateUserStatusUseCase
- UpdateUserStatusUseCase usa AuthenticatedUser e UpdateUserStatusDto, e retorna User

### Responsabilidades
- O UpdateUserStatusUseCase coordena todo o processo de atualização de status, incluindo:
  - Verificação de permissões
  - Verificação de existência do usuário
  - Validação do novo status
  - Atualização do status no banco de dados
  - Notificação do usuário sobre a mudança

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações.
