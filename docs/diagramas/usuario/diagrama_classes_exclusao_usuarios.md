# Diagrama de Classes - Exclusão de Usuários

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
        +delete(id: string) Promise~void~
    }
    
    class IFirebaseService {
        <<interface>>
        +deleteUser(uid: string) Promise~void~
    }
    
    class IUserFavoriteRepository {
        <<interface>>
        +deleteAllByUserId(userId: string) Promise~void~
        +deleteAllByFavoriteUserId(favoriteUserId: string) Promise~void~
    }
    
    class IAdvertisementRepository {
        <<interface>>
        +findAllByCreatedUserId(userId: string) Promise~Advertisement[]~
        +updateCreatedUserId(oldUserId: string, newUserId: string) Promise~void~
    }
    
    %% Casos de Uso
    class DeleteUserUseCase {
        -IUserRepository userRepository
        -IFirebaseService firebaseService
        -IUserFavoriteRepository userFavoriteRepository
        -IAdvertisementRepository advertisementRepository
        +constructor(dependencies: ...)
        +execute(authenticatedUser: AuthenticatedUser, userId: string) Promise~void~
    }
    
    %% Implementações
    class MongooseUserRepository {
        -UserModel userModel
        +constructor(userModel: Model)
        +findOneById(id: string) Promise~User~
        +delete(id: string) Promise~void~
    }
    
    class FirebaseService {
        -FirebaseApp app
        +constructor(app: FirebaseApp)
        +deleteUser(uid: string) Promise~void~
    }
    
    class MongooseUserFavoriteRepository {
        -UserFavoriteModel userFavoriteModel
        +constructor(userFavoriteModel: Model)
        +deleteAllByUserId(userId: string) Promise~void~
        +deleteAllByFavoriteUserId(favoriteUserId: string) Promise~void~
    }
    
    class MongooseAdvertisementRepository {
        -AdvertisementModel advertisementModel
        +constructor(advertisementModel: Model)
        +findAllByCreatedUserId(userId: string) Promise~Advertisement[]~
        +updateCreatedUserId(oldUserId: string, newUserId: string) Promise~void~
    }
    
    class UserController {
        -DeleteUserUseCase deleteUserUseCase
        +constructor(deleteUserUseCase: DeleteUserUseCase)
        +delete(authenticatedUser: AuthenticatedUser, userId: string) Promise~void~
    }
    
    %% Relações
    User "1" -- "1" UserRole : tem >
    User "1" -- "1" UserStatus : tem >
    
    IUserRepository <|.. MongooseUserRepository : implementa
    IFirebaseService <|.. FirebaseService : implementa
    IUserFavoriteRepository <|.. MongooseUserFavoriteRepository : implementa
    IAdvertisementRepository <|.. MongooseAdvertisementRepository : implementa
    
    DeleteUserUseCase --> IUserRepository : usa >
    DeleteUserUseCase --> IFirebaseService : usa >
    DeleteUserUseCase --> IUserFavoriteRepository : usa >
    DeleteUserUseCase --> IAdvertisementRepository : usa >
    
    UserController --> DeleteUserUseCase : usa >
    
    DeleteUserUseCase ..> AuthenticatedUser : usa >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de exclusão de usuários no sistema tuhogar-api.

### Entidades de Domínio
- **User**: Representa um usuário no sistema com seus atributos
- **UserRole**: Enumeração que define os possíveis papéis de um usuário (ADMIN, USER)
- **UserStatus**: Enumeração que define os possíveis estados de um usuário (ACTIVE, INACTIVE)
- **AuthenticatedUser**: Representa um usuário autenticado com informações reduzidas

### Interfaces
- **IUserRepository**: Interface para acesso e manipulação dos dados de usuários
- **IFirebaseService**: Interface para interação com o serviço Firebase
- **IUserFavoriteRepository**: Interface para acesso e manipulação dos dados de usuários favoritos
- **IAdvertisementRepository**: Interface para acesso e manipulação dos dados de anúncios

### Casos de Uso
- **DeleteUserUseCase**: Orquestra o processo de exclusão de um usuário

### Implementações
- **MongooseUserRepository**: Implementação do repositório de usuários usando MongoDB/Mongoose
- **FirebaseService**: Implementação do serviço de interação com Firebase
- **MongooseUserFavoriteRepository**: Implementação do repositório de usuários favoritos
- **MongooseAdvertisementRepository**: Implementação do repositório de anúncios
- **UserController**: Controlador HTTP para endpoints relacionados a usuários

### Relações
- Um User tem um UserRole e um UserStatus
- MongooseUserRepository implementa IUserRepository
- FirebaseService implementa IFirebaseService
- MongooseUserFavoriteRepository implementa IUserFavoriteRepository
- MongooseAdvertisementRepository implementa IAdvertisementRepository
- DeleteUserUseCase depende de IUserRepository, IFirebaseService, IUserFavoriteRepository e IAdvertisementRepository
- UserController depende de DeleteUserUseCase
- DeleteUserUseCase usa AuthenticatedUser

### Responsabilidades
- O DeleteUserUseCase coordena todo o processo de exclusão, incluindo:
  - Verificação de permissões
  - Verificação de dependências
  - Exclusão no Firebase
  - Exclusão no sistema
  - Tratamento de dados relacionados (favoritos, anúncios, etc.)

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações.
