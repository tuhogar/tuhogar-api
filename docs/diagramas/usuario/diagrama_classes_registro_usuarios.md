# Diagrama de Classes - Registro de Novos Usuários

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
    
    %% Interfaces
    class IUserRepository {
        <<interface>>
        +create(user: User) Promise~User~
        +findOneByEmail(email: string) Promise~User~
        +findOneById(id: string) Promise~User~
        +findOneByFirebaseId(firebaseId: string) Promise~User~
    }
    
    class IFirebaseService {
        <<interface>>
        +createUser(email: string, password: string) Promise~{uid: string}~
        +sendEmailVerification(uid: string) Promise~void~
    }
    
    %% Casos de Uso
    class CreateUserUseCase {
        -IUserRepository userRepository
        -IFirebaseService firebaseService
        +constructor(userRepository: IUserRepository, firebaseService: IFirebaseService)
        +execute(createUserDto: CreateUserDto) Promise~User~
    }
    
    %% DTOs
    class CreateUserDto {
        +string email
        +string password
        +string name
        +string lastName
        +string phone
        +UserRole role
    }
    
    %% Implementações
    class MongooseUserRepository {
        -UserModel userModel
        +constructor(userModel: Model)
        +create(user: User) Promise~User~
        +findOneByEmail(email: string) Promise~User~
        +findOneById(id: string) Promise~User~
        +findOneByFirebaseId(firebaseId: string) Promise~User~
    }
    
    class FirebaseService {
        -FirebaseApp app
        +constructor(app: FirebaseApp)
        +createUser(email: string, password: string) Promise~{uid: string}~
        +sendEmailVerification(uid: string) Promise~void~
    }
    
    class UserController {
        -CreateUserUseCase createUserUseCase
        +constructor(createUserUseCase: CreateUserUseCase)
        +create(createUserDto: CreateUserDto) Promise~User~
    }
    
    %% Relações
    User "1" -- "1" UserRole : tem >
    User "1" -- "1" UserStatus : tem >
    
    IUserRepository <|.. MongooseUserRepository : implementa
    IFirebaseService <|.. FirebaseService : implementa
    
    CreateUserUseCase --> IUserRepository : usa >
    CreateUserUseCase --> IFirebaseService : usa >
    
    UserController --> CreateUserUseCase : usa >
    
    CreateUserUseCase ..> CreateUserDto : usa >
    CreateUserUseCase ..> User : cria >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de registro de novos usuários no sistema tuhogar-api.

### Entidades de Domínio
- **User**: Representa um usuário no sistema com seus atributos
- **UserRole**: Enumeração que define os possíveis papéis de um usuário (ADMIN, USER)
- **UserStatus**: Enumeração que define os possíveis estados de um usuário (ACTIVE, INACTIVE)

### Interfaces
- **IUserRepository**: Interface para persistência de usuários
- **IFirebaseService**: Interface para interação com o serviço Firebase

### Casos de Uso
- **CreateUserUseCase**: Orquestra o processo de criação de um novo usuário

### DTOs (Data Transfer Objects)
- **CreateUserDto**: Objeto para transferência de dados durante a criação de usuário

### Implementações
- **MongooseUserRepository**: Implementação do repositório de usuários usando MongoDB/Mongoose
- **FirebaseService**: Implementação do serviço de interação com Firebase
- **UserController**: Controlador HTTP para endpoints relacionados a usuários

### Relações
- Um User tem um UserRole e um UserStatus
- MongooseUserRepository implementa IUserRepository
- FirebaseService implementa IFirebaseService
- CreateUserUseCase depende de IUserRepository e IFirebaseService
- UserController depende de CreateUserUseCase
- CreateUserUseCase usa CreateUserDto e cria User

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações.
