# Diagrama de Sequência - Controle de Níveis de Acesso por Perfis

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador
    actor User as Usuário Comum
    participant API as API Gateway
    participant Auth as AuthMiddleware
    participant AuthGuard as AuthGuard
    participant RolesGuard as RolesGuard
    participant AuthService as AuthService
    participant JwtService as JwtService
    participant UserController as UserController
    participant AdvController as AdvertisementController
    
    %% Fluxo de acesso do Administrador
    Admin->>API: Requisição com token JWT
    API->>Auth: Intercepta requisição
    Auth->>JwtService: verify(token)
    JwtService-->>Auth: Payload decodificado
    Auth->>AuthService: validateUser(payload)
    AuthService-->>Auth: AuthenticatedUser (role: ADMIN)
    Auth->>API: Adiciona usuário ao contexto da requisição
    
    API->>AuthGuard: canActivate(context)
    AuthGuard->>AuthGuard: Verifica se usuário está autenticado
    AuthGuard-->>API: true (usuário autenticado)
    
    API->>RolesGuard: canActivate(context)
    RolesGuard->>RolesGuard: Verifica se usuário tem role ADMIN
    RolesGuard-->>API: true (usuário tem permissão)
    
    API->>AdvController: getAllToApprove()
    AdvController-->>Admin: Lista de anúncios para aprovação
    
    %% Fluxo de acesso do Usuário Comum
    User->>API: Requisição com token JWT
    API->>Auth: Intercepta requisição
    Auth->>JwtService: verify(token)
    JwtService-->>Auth: Payload decodificado
    Auth->>AuthService: validateUser(payload)
    AuthService-->>Auth: AuthenticatedUser (role: USER)
    Auth->>API: Adiciona usuário ao contexto da requisição
    
    API->>AuthGuard: canActivate(context)
    AuthGuard->>AuthGuard: Verifica se usuário está autenticado
    AuthGuard-->>API: true (usuário autenticado)
    
    API->>RolesGuard: canActivate(context)
    RolesGuard->>RolesGuard: Verifica se usuário tem role ADMIN
    RolesGuard-->>API: false (usuário não tem permissão)
    
    API-->>User: 403 Forbidden (Acesso negado)
    
    %% Fluxo de atribuição de perfil
    Admin->>API: PATCH /v1/users/{userId} (role: ADMIN)
    API->>Auth: Intercepta requisição
    Auth->>JwtService: verify(token)
    JwtService-->>Auth: Payload decodificado
    Auth->>AuthService: validateUser(payload)
    AuthService-->>Auth: AuthenticatedUser (role: ADMIN)
    Auth->>API: Adiciona usuário ao contexto da requisição
    
    API->>AuthGuard: canActivate(context)
    AuthGuard-->>API: true (usuário autenticado)
    
    API->>RolesGuard: canActivate(context)
    RolesGuard-->>API: true (usuário tem permissão)
    
    API->>UserController: update(userId, {role: ADMIN})
    UserController->>UserController: Atualiza role do usuário
    UserController-->>Admin: Usuário atualizado
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de controle de níveis de acesso por perfis no sistema tuhogar-api.

### Participantes
- **Administrador**: Usuário com papel ADMIN no sistema
- **Usuário Comum**: Usuário com papel USER no sistema
- **API Gateway**: Ponto de entrada para as requisições HTTP
- **AuthMiddleware**: Middleware que intercepta requisições para verificar autenticação
- **AuthGuard**: Guarda que verifica se o usuário está autenticado
- **RolesGuard**: Guarda que verifica se o usuário tem os papéis necessários
- **AuthService**: Serviço que gerencia a autenticação e autorização de usuários
- **JwtService**: Serviço para validação de tokens JWT
- **UserController**: Controlador para operações relacionadas a usuários
- **AdvertisementController**: Controlador para operações relacionadas a anúncios

### Fluxo de Acesso do Administrador
1. O administrador envia uma requisição com um token JWT
2. O AuthMiddleware intercepta a requisição e valida o token
3. O JwtService decodifica o payload do token
4. O AuthService valida o usuário e identifica que ele tem papel ADMIN
5. O usuário autenticado é adicionado ao contexto da requisição
6. O AuthGuard verifica que o usuário está autenticado
7. O RolesGuard verifica que o usuário tem o papel ADMIN
8. A requisição é encaminhada para o controlador apropriado
9. O controlador processa a requisição e retorna a resposta

### Fluxo de Acesso do Usuário Comum
1. O usuário comum envia uma requisição com um token JWT
2. O AuthMiddleware intercepta a requisição e valida o token
3. O JwtService decodifica o payload do token
4. O AuthService valida o usuário e identifica que ele tem papel USER
5. O usuário autenticado é adicionado ao contexto da requisição
6. O AuthGuard verifica que o usuário está autenticado
7. O RolesGuard verifica que o usuário NÃO tem o papel ADMIN
8. A requisição é rejeitada com código 403 Forbidden

### Fluxo de Atribuição de Perfil
1. O administrador envia uma requisição para atualizar o papel de um usuário
2. Após passar pelas verificações de autenticação e autorização
3. O UserController atualiza o papel do usuário no sistema
4. A resposta é retornada ao administrador

### Considerações de Segurança
- Todas as requisições são validadas em múltiplas camadas
- O sistema verifica tanto a autenticação quanto a autorização
- Apenas usuários com o papel ADMIN podem acessar funcionalidades restritas
- A atribuição de papéis só pode ser realizada por administradores
