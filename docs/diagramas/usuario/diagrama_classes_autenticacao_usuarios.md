# Diagrama de Classes - Autenticação de Usuários (Login)

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
        +findOneByEmail(email: string) Promise~User~
        +findOneByFirebaseId(firebaseId: string) Promise~User~
    }
    
    class IFirebaseService {
        <<interface>>
        +signInWithEmailAndPassword(email: string, password: string) Promise~{uid: string, token: string}~
        +verifyIdToken(token: string) Promise~{uid: string, email: string}~
    }
    
    class IJwtService {
        <<interface>>
        +sign(payload: any) string
        +verify(token: string) any
    }
    
    %% Casos de Uso
    class LoginUserUseCase {
        -IUserRepository userRepository
        -IFirebaseService firebaseService
        -IJwtService jwtService
        +constructor(dependencies: ...)
        +execute(loginUserDto: LoginUserDto) Promise~{user: AuthenticatedUser, token: string}~
    }
    
    %% DTOs
    class LoginUserDto {
        +string email
        +string password
    }
    
    class LoginUserResponseDto {
        +AuthenticatedUser user
        +string token
    }
    
    %% Implementações
    class MongooseUserRepository {
        -UserModel userModel
        +constructor(userModel: Model)
        +findOneByEmail(email: string) Promise~User~
        +findOneByFirebaseId(firebaseId: string) Promise~User~
    }
    
    class FirebaseService {
        -FirebaseApp app
        +constructor(app: FirebaseApp)
        +signInWithEmailAndPassword(email: string, password: string) Promise~{uid: string, token: string}~
        +verifyIdToken(token: string) Promise~{uid: string, email: string}~
    }
    
    class JwtService {
        -string secret
        -object options
        +constructor(secret: string, options: object)
        +sign(payload: any) string
        +verify(token: string) any
    }
    
    class UserController {
        -LoginUserUseCase loginUserUseCase
        +constructor(loginUserUseCase: LoginUserUseCase)
        +login(loginUserDto: LoginUserDto) Promise~LoginUserResponseDto~
    }
    
    %% Relações
    User "1" -- "1" UserRole : tem >
    User "1" -- "1" UserStatus : tem >
    
    IUserRepository <|.. MongooseUserRepository : implementa
    IFirebaseService <|.. FirebaseService : implementa
    IJwtService <|.. JwtService : implementa
    
    LoginUserUseCase --> IUserRepository : usa >
    LoginUserUseCase --> IFirebaseService : usa >
    LoginUserUseCase --> IJwtService : usa >
    
    UserController --> LoginUserUseCase : usa >
    
    LoginUserUseCase ..> LoginUserDto : usa >
    LoginUserUseCase ..> AuthenticatedUser : cria >
    LoginUserUseCase ..> LoginUserResponseDto : retorna >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de autenticação de usuários (login) no sistema tuhogar-api.

### Entidades de Domínio
- **User**: Representa um usuário no sistema com seus atributos
- **UserRole**: Enumeração que define os possíveis papéis de um usuário (ADMIN, USER)
- **UserStatus**: Enumeração que define os possíveis estados de um usuário (ACTIVE, INACTIVE)
- **AuthenticatedUser**: Representa um usuário autenticado com informações reduzidas

### Interfaces
- **IUserRepository**: Interface para acesso aos dados de usuários
- **IFirebaseService**: Interface para interação com o serviço Firebase
- **IJwtService**: Interface para geração e validação de tokens JWT

### Casos de Uso
- **LoginUserUseCase**: Orquestra o processo de autenticação de um usuário

### DTOs (Data Transfer Objects)
- **LoginUserDto**: Objeto para transferência de dados durante o login
- **LoginUserResponseDto**: Objeto para retorno dos dados de autenticação

### Implementações
- **MongooseUserRepository**: Implementação do repositório de usuários usando MongoDB/Mongoose
- **FirebaseService**: Implementação do serviço de interação com Firebase
- **JwtService**: Implementação do serviço de tokens JWT
- **UserController**: Controlador HTTP para endpoints relacionados a usuários

### Relações
- Um User tem um UserRole e um UserStatus
- MongooseUserRepository implementa IUserRepository
- FirebaseService implementa IFirebaseService
- JwtService implementa IJwtService
- LoginUserUseCase depende de IUserRepository, IFirebaseService e IJwtService
- UserController depende de LoginUserUseCase
- LoginUserUseCase usa LoginUserDto, cria AuthenticatedUser e retorna LoginUserResponseDto

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações.
