# Diagrama de Sequência - Gerenciamento de Usuários Favoritos

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Controller as UserController
    participant CreateUseCase as CreateFavoriteUserUseCase
    participant DeleteUseCase as DeleteFavoriteUserUseCase
    participant GetUseCase as GetFavoritesUserUseCase
    participant UserRepo as UserRepository
    participant FavoriteRepo as UserFavoriteRepository
    participant DB as Banco de Dados
    
    %% Fluxo de adicionar usuário aos favoritos
    User->>Controller: POST /v1/users/favorites/{favoriteUserId}
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>CreateUseCase: execute(authenticatedUser, favoriteUserId)
    
    CreateUseCase->>UserRepo: findOneById(favoriteUserId)
    UserRepo->>DB: Consultar usuário por ID
    DB-->>UserRepo: Usuário (ou null)
    UserRepo-->>CreateUseCase: Usuário (ou null)
    
    alt Usuário favorito não encontrado
        CreateUseCase-->>Controller: Erro: Usuário não encontrado
        Controller-->>User: 404 Not Found (Usuário não encontrado)
    else Usuário favorito encontrado
        CreateUseCase->>FavoriteRepo: findOneByUserIdAndFavoriteUserId(userId, favoriteUserId)
        FavoriteRepo->>DB: Consultar relação de favorito
        DB-->>FavoriteRepo: Relação (ou null)
        FavoriteRepo-->>CreateUseCase: Relação (ou null)
        
        alt Usuário já é favorito
            CreateUseCase-->>Controller: Erro: Usuário já é favorito
            Controller-->>User: 400 Bad Request (Usuário já é favorito)
        else Usuário não é favorito
            CreateUseCase->>CreateUseCase: Criar objeto UserFavorite
            CreateUseCase->>FavoriteRepo: create(userFavorite)
            FavoriteRepo->>DB: Inserir relação de favorito
            DB-->>FavoriteRepo: Relação criada
            FavoriteRepo-->>CreateUseCase: Relação criada
            
            CreateUseCase-->>Controller: Relação criada
            Controller-->>User: 201 Created (Relação criada)
        end
    end
    
    %% Fluxo de remover usuário dos favoritos
    User->>Controller: DELETE /v1/users/favorites/{favoriteUserId}
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>DeleteUseCase: execute(authenticatedUser, favoriteUserId)
    
    DeleteUseCase->>FavoriteRepo: findOneByUserIdAndFavoriteUserId(userId, favoriteUserId)
    FavoriteRepo->>DB: Consultar relação de favorito
    DB-->>FavoriteRepo: Relação (ou null)
    FavoriteRepo-->>DeleteUseCase: Relação (ou null)
    
    alt Usuário não é favorito
        DeleteUseCase-->>Controller: Erro: Usuário não é favorito
        Controller-->>User: 404 Not Found (Usuário não é favorito)
    else Usuário é favorito
        DeleteUseCase->>FavoriteRepo: delete(userId, favoriteUserId)
        FavoriteRepo->>DB: Excluir relação de favorito
        DB-->>FavoriteRepo: Confirmação
        FavoriteRepo-->>DeleteUseCase: Confirmação
        
        DeleteUseCase-->>Controller: Sucesso
        Controller-->>User: 204 No Content (Removido com sucesso)
    end
    
    %% Fluxo de listar usuários favoritos
    User->>Controller: GET /v1/users/favorites
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>GetUseCase: execute(authenticatedUser)
    
    GetUseCase->>FavoriteRepo: findAllByUserId(userId)
    FavoriteRepo->>DB: Consultar relações de favorito
    DB-->>FavoriteRepo: Lista de relações
    FavoriteRepo-->>GetUseCase: Lista de relações
    
    loop Para cada relação de favorito
        GetUseCase->>UserRepo: findOneById(favoriteUserId)
        UserRepo->>DB: Consultar usuário por ID
        DB-->>UserRepo: Usuário
        UserRepo-->>GetUseCase: Usuário
    end
    
    GetUseCase-->>Controller: Lista de usuários favoritos
    Controller-->>User: 200 OK (Lista de usuários favoritos)
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante os processos de gerenciamento de usuários favoritos no sistema tuhogar-api.

### Participantes
- **Usuário**: Pessoa que está utilizando o sistema
- **UserController**: Componente que recebe e processa requisições HTTP
- **CreateFavoriteUserUseCase**: Componente que orquestra a lógica de negócio para adicionar um usuário aos favoritos
- **DeleteFavoriteUserUseCase**: Componente que orquestra a lógica de negócio para remover um usuário dos favoritos
- **GetFavoritesUserUseCase**: Componente que orquestra a lógica de negócio para listar os usuários favoritos
- **UserRepository**: Componente responsável pelo acesso aos dados de usuários
- **UserFavoriteRepository**: Componente responsável pelo acesso aos dados de relações de favoritos
- **Banco de Dados**: Sistema de armazenamento persistente

### Fluxo de Adicionar Usuário aos Favoritos
1. O usuário envia uma requisição POST para `/v1/users/favorites/{favoriteUserId}`
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de criação de favorito
4. O caso de uso verifica se o usuário a ser adicionado existe
5. Se o usuário existir, verifica se já é um favorito
6. Se não for um favorito, cria a relação de favorito
7. O controlador responde à requisição com os dados da relação criada ou uma mensagem de erro

### Fluxo de Remover Usuário dos Favoritos
1. O usuário envia uma requisição DELETE para `/v1/users/favorites/{favoriteUserId}`
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de exclusão de favorito
4. O caso de uso verifica se o usuário é um favorito
5. Se for um favorito, remove a relação
6. O controlador responde à requisição com uma confirmação de sucesso ou uma mensagem de erro

### Fluxo de Listar Usuários Favoritos
1. O usuário envia uma requisição GET para `/v1/users/favorites`
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de listagem de favoritos
4. O caso de uso busca todas as relações de favorito do usuário
5. Para cada relação, busca os dados completos do usuário favorito
6. O controlador responde à requisição com a lista de usuários favoritos

### Considerações
- Todas as operações requerem que o usuário esteja autenticado
- O sistema verifica a existência do usuário a ser adicionado aos favoritos
- O sistema verifica se um usuário já é favorito antes de adicioná-lo
- O sistema verifica se um usuário é favorito antes de removê-lo
- Ao listar os favoritos, o sistema retorna os dados completos dos usuários
