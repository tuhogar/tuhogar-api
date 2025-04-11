# Diagrama de Classes - Recuperação de Senha

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
        +findOneByEmail(email: string) Promise~User~
    }
    
    class IFirebaseService {
        <<interface>>
        +sendPasswordResetEmail(email: string) Promise~void~
        +confirmPasswordReset(code: string, newPassword: string) Promise~void~
    }
    
    class IEmailService {
        <<interface>>
        +sendPasswordRecoveryEmail(email: string, link: string) Promise~void~
    }
    
    %% Casos de Uso
    class RequestPasswordRecoveryUseCase {
        -IUserRepository userRepository
        -IFirebaseService firebaseService
        -IEmailService emailService
        +constructor(dependencies: ...)
        +execute(email: string) Promise~void~
    }
    
    class ResetPasswordUseCase {
        -IFirebaseService firebaseService
        +constructor(firebaseService: IFirebaseService)
        +execute(code: string, newPassword: string) Promise~void~
    }
    
    %% DTOs
    class RequestPasswordRecoveryDto {
        +string email
    }
    
    class ResetPasswordDto {
        +string code
        +string newPassword
        +string confirmPassword
    }
    
    %% Implementações
    class MongooseUserRepository {
        -UserModel userModel
        +constructor(userModel: Model)
        +findOneByEmail(email: string) Promise~User~
    }
    
    class FirebaseService {
        -FirebaseApp app
        +constructor(app: FirebaseApp)
        +sendPasswordResetEmail(email: string) Promise~void~
        +confirmPasswordReset(code: string, newPassword: string) Promise~void~
    }
    
    class EmailService {
        -EmailClient client
        +constructor(client: EmailClient)
        +sendPasswordRecoveryEmail(email: string, link: string) Promise~void~
    }
    
    class AuthController {
        -RequestPasswordRecoveryUseCase requestPasswordRecoveryUseCase
        -ResetPasswordUseCase resetPasswordUseCase
        +constructor(dependencies: ...)
        +requestPasswordRecovery(requestPasswordRecoveryDto: RequestPasswordRecoveryDto) Promise~void~
        +resetPassword(resetPasswordDto: ResetPasswordDto) Promise~void~
    }
    
    %% Relações
    User "1" -- "1" UserRole : tem >
    User "1" -- "1" UserStatus : tem >
    
    IUserRepository <|.. MongooseUserRepository : implementa
    IFirebaseService <|.. FirebaseService : implementa
    IEmailService <|.. EmailService : implementa
    
    RequestPasswordRecoveryUseCase --> IUserRepository : usa >
    RequestPasswordRecoveryUseCase --> IFirebaseService : usa >
    RequestPasswordRecoveryUseCase --> IEmailService : usa >
    
    ResetPasswordUseCase --> IFirebaseService : usa >
    
    AuthController --> RequestPasswordRecoveryUseCase : usa >
    AuthController --> ResetPasswordUseCase : usa >
    
    RequestPasswordRecoveryUseCase ..> RequestPasswordRecoveryDto : usa >
    ResetPasswordUseCase ..> ResetPasswordDto : usa >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de recuperação de senha no sistema tuhogar-api.

### Entidades de Domínio
- **User**: Representa um usuário no sistema com seus atributos
- **UserRole**: Enumeração que define os possíveis papéis de um usuário (ADMIN, USER)
- **UserStatus**: Enumeração que define os possíveis estados de um usuário (ACTIVE, INACTIVE)

### Interfaces
- **IUserRepository**: Interface para acesso aos dados de usuários
- **IFirebaseService**: Interface para interação com o serviço Firebase
- **IEmailService**: Interface para envio de emails

### Casos de Uso
- **RequestPasswordRecoveryUseCase**: Orquestra o processo de solicitação de recuperação de senha
- **ResetPasswordUseCase**: Orquestra o processo de redefinição de senha

### DTOs (Data Transfer Objects)
- **RequestPasswordRecoveryDto**: Objeto para transferência de dados durante a solicitação de recuperação
- **ResetPasswordDto**: Objeto para transferência de dados durante a redefinição de senha

### Implementações
- **MongooseUserRepository**: Implementação do repositório de usuários usando MongoDB/Mongoose
- **FirebaseService**: Implementação do serviço de interação com Firebase
- **EmailService**: Implementação do serviço de envio de emails
- **AuthController**: Controlador HTTP para endpoints relacionados à autenticação

### Relações
- Um User tem um UserRole e um UserStatus
- MongooseUserRepository implementa IUserRepository
- FirebaseService implementa IFirebaseService
- EmailService implementa IEmailService
- RequestPasswordRecoveryUseCase depende de IUserRepository, IFirebaseService e IEmailService
- ResetPasswordUseCase depende de IFirebaseService
- AuthController depende de RequestPasswordRecoveryUseCase e ResetPasswordUseCase
- Os casos de uso utilizam os respectivos DTOs

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações.
