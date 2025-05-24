# Diagrama de Classes - Atualização de Dados de Usuários

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
    
    %% Interfaces
    class IUserRepository {
        <<interface>>
        +findOneById(id: string) Promise~User~
        +update(id: string, userData: Partial~User~) Promise~User~
    }
    
    class IFirebaseService {
        <<interface>>
        +updateUser(uid: string, userData: any) Promise~void~
    }
    
    %% Casos de Uso
    class PathUserUseCase {
        -IUserRepository userRepository
        -IFirebaseService firebaseService
        +constructor(dependencies: ...)
        +execute(authenticatedUser: AuthenticatedUser, userId: string, pathUserDto: PathUserDto) Promise~User~
    }
    
    %% DTOs
    class PathUserDto {
        +string name
        +string lastName
        +string phone
        +string photoUrl
        +UserRole role
        +UserStatus status
    }
    
    %% Implementações
    class MongooseUserRepository {
        -UserModel userModel
        +constructor(userModel: Model)
        +findOneById(id: string) Promise~User~
        +update(id: string, userData: Partial~User~) Promise~User~
    }
    
    class FirebaseService {
        -FirebaseApp app
        +constructor(app: FirebaseApp)
        +updateUser(uid: string, userData: any) Promise~void~
    }
    
    class UserController {
        -PathUserUseCase pathUserUseCase
        +constructor(pathUserUseCase: PathUserUseCase)
        +patch(authenticatedUser: AuthenticatedUser, userId: string, pathUserDto: PathUserDto) Promise~User~
    }
    
    %% Relações
    User "1" -- "1" UserRole : tem >
    User "1" -- "1" UserStatus : tem >
    
    IUserRepository <|.. MongooseUserRepository : implementa
    IFirebaseService <|.. FirebaseService : implementa
    
    PathUserUseCase --> IUserRepository : usa >
    PathUserUseCase --> IFirebaseService : usa >
    
    UserController --> PathUserUseCase : usa >
    
    PathUserUseCase ..> PathUserDto : usa >
    PathUserUseCase ..> AuthenticatedUser : usa >
    PathUserUseCase ..> User : atualiza >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de atualização de dados de usuários no sistema tuhogar-api.

### Entidades de Domínio
- **User**: Representa um usuário no sistema com seus atributos
- **UserRole**: Enumeração que define os possíveis papéis de um usuário (ADMIN, USER)
- **UserStatus**: Enumeração que define os possíveis estados de um usuário (ACTIVE, INACTIVE)
- **AuthenticatedUser**: Representa um usuário autenticado com informações reduzidas

### Interfaces
- **IUserRepository**: Interface para acesso e manipulação dos dados de usuários
- **IFirebaseService**: Interface para interação com o serviço Firebase

### Casos de Uso
- **PathUserUseCase**: Orquestra o processo de atualização parcial (patch) de um usuário

### DTOs (Data Transfer Objects)
- **PathUserDto**: Objeto para transferência de dados durante a atualização de usuário

### Implementações
- **MongooseUserRepository**: Implementação do repositório de usuários usando MongoDB/Mongoose
- **FirebaseService**: Implementação do serviço de interação com Firebase
- **UserController**: Controlador HTTP para endpoints relacionados a usuários

### Relações
- Um User tem um UserRole e um UserStatus
- MongooseUserRepository implementa IUserRepository
- FirebaseService implementa IFirebaseService
- PathUserUseCase depende de IUserRepository e IFirebaseService
- UserController depende de PathUserUseCase
- PathUserUseCase usa PathUserDto e AuthenticatedUser, e atualiza User

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações.
