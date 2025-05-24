# Diagrama de Classes - Controle de Níveis de Acesso por Perfis

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
    
    %% Decoradores e Guardas
    class Authenticated {
        <<decorator>>
        +apply() MethodDecorator
    }
    
    class AuthGuard {
        +canActivate(context: ExecutionContext) boolean
    }
    
    class RolesGuard {
        +canActivate(context: ExecutionContext) boolean
    }
    
    class Roles {
        <<decorator>>
        +apply(roles: UserRole[]) MethodDecorator
    }
    
    %% Serviços
    class JwtService {
        -string secret
        -object options
        +constructor(secret: string, options: object)
        +sign(payload: any) string
        +verify(token: string) any
    }
    
    class AuthService {
        -JwtService jwtService
        -IUserRepository userRepository
        +constructor(jwtService: JwtService, userRepository: IUserRepository)
        +validateUser(token: string) Promise~AuthenticatedUser~
        +hasRole(user: AuthenticatedUser, roles: UserRole[]) boolean
    }
    
    %% Controladores
    class UserController {
        -UserService userService
        +constructor(userService: UserService)
        +getAll() Promise~User[]~
        +getById(id: string) Promise~User~
        +update(id: string, userData: Partial~User~) Promise~User~
        +delete(id: string) Promise~void~
    }
    
    class AdvertisementController {
        -AdvertisementService advertisementService
        +constructor(advertisementService: AdvertisementService)
        +getAllToApprove() Promise~Advertisement[]~
        +approveAdvertisement(id: string) Promise~void~
    }
    
    %% Middleware
    class AuthMiddleware {
        -AuthService authService
        +constructor(authService: AuthService)
        +use(req: Request, res: Response, next: NextFunction) void
    }
    
    %% Relações
    User "1" -- "1" UserRole : tem >
    User "1" -- "1" UserStatus : tem >
    
    AuthGuard --> AuthService : usa >
    RolesGuard --> AuthService : usa >
    
    AuthService --> JwtService : usa >
    AuthService --> IUserRepository : usa >
    
    AuthMiddleware --> AuthService : usa >
    
    Authenticated ..> AuthGuard : ativa >
    Roles ..> RolesGuard : ativa >
    
    UserController ..> Authenticated : usa >
    UserController ..> Roles : usa >
    
    AdvertisementController ..> Authenticated : usa >
    AdvertisementController ..> Roles : usa >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no sistema de controle de níveis de acesso por perfis no tuhogar-api.

### Entidades de Domínio
- **User**: Representa um usuário no sistema com seus atributos, incluindo o papel (role)
- **UserRole**: Enumeração que define os possíveis papéis de um usuário (ADMIN, USER)
- **UserStatus**: Enumeração que define os possíveis estados de um usuário (ACTIVE, INACTIVE)
- **AuthenticatedUser**: Representa um usuário autenticado com informações reduzidas

### Interfaces
- **IUserRepository**: Interface para acesso e manipulação dos dados de usuários

### Decoradores e Guardas
- **Authenticated**: Decorador que indica que um endpoint requer autenticação
- **AuthGuard**: Guarda que verifica se o usuário está autenticado
- **RolesGuard**: Guarda que verifica se o usuário tem os papéis necessários
- **Roles**: Decorador que especifica quais papéis são necessários para acessar um endpoint

### Serviços
- **JwtService**: Serviço para geração e validação de tokens JWT
- **AuthService**: Serviço que gerencia a autenticação e autorização de usuários

### Controladores
- **UserController**: Controlador para operações relacionadas a usuários
- **AdvertisementController**: Controlador para operações relacionadas a anúncios

### Middleware
- **AuthMiddleware**: Middleware que intercepta requisições para verificar autenticação

### Relações
- Um User tem um UserRole e um UserStatus
- AuthGuard e RolesGuard dependem de AuthService
- AuthService depende de JwtService e IUserRepository
- AuthMiddleware depende de AuthService
- Os decoradores Authenticated e Roles ativam os guardas AuthGuard e RolesGuard
- Os controladores usam os decoradores para proteger seus endpoints

### Funcionamento do Sistema de Controle de Acesso
1. Cada requisição passa pelo AuthMiddleware, que extrai e valida o token JWT
2. Os endpoints protegidos são decorados com @Authenticated() e @Roles([UserRole.ADMIN])
3. O AuthGuard verifica se o usuário está autenticado
4. O RolesGuard verifica se o usuário tem os papéis necessários
5. Apenas usuários com os papéis adequados podem acessar funcionalidades restritas

Este diagrama segue os princípios de segurança por design, com múltiplas camadas de verificação de permissões.
