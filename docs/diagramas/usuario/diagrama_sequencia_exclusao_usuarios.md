# Diagrama de Sequência - Exclusão de Usuários

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário/Administrador
    participant Controller as UserController
    participant UseCase as DeleteUserUseCase
    participant UserRepo as UserRepository
    participant FavoriteRepo as UserFavoriteRepository
    participant AdvRepo as AdvertisementRepository
    participant Firebase as FirebaseService
    participant DB as Banco de Dados
    
    User->>Controller: DELETE /v1/users/{userId}
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>UseCase: execute(authenticatedUser, userId)
    
    UseCase->>UserRepo: findOneById(userId)
    UserRepo->>DB: Consultar usuário por ID
    DB-->>UserRepo: Usuário (ou null)
    UserRepo-->>UseCase: Usuário (ou null)
    
    alt Usuário não encontrado
        UseCase-->>Controller: Erro: Usuário não encontrado
        Controller-->>User: 404 Not Found (Usuário não encontrado)
    else Sem permissão para excluir
        UseCase-->>Controller: Erro: Sem permissão
        Controller-->>User: 403 Forbidden (Sem permissão)
    else Usuário encontrado e com permissão
        %% Verificar dependências
        UseCase->>AdvRepo: findAllByCreatedUserId(userId)
        AdvRepo->>DB: Consultar anúncios criados pelo usuário
        DB-->>AdvRepo: Lista de anúncios
        AdvRepo-->>UseCase: Lista de anúncios
        
        alt Existem dependências críticas
            UseCase-->>Controller: Erro: Existem dependências
            Controller-->>User: 400 Bad Request (Não é possível excluir)
        else Sem dependências críticas ou dependências tratáveis
            %% Excluir no Firebase
            UseCase->>Firebase: deleteUser(firebaseId)
            Firebase-->>UseCase: Confirmação
            
            %% Excluir dados relacionados
            UseCase->>FavoriteRepo: deleteAllByUserId(userId)
            FavoriteRepo->>DB: Excluir relações de favorito do usuário
            DB-->>FavoriteRepo: Confirmação
            FavoriteRepo-->>UseCase: Confirmação
            
            UseCase->>FavoriteRepo: deleteAllByFavoriteUserId(userId)
            FavoriteRepo->>DB: Excluir relações onde o usuário é favorito
            DB-->>FavoriteRepo: Confirmação
            FavoriteRepo-->>UseCase: Confirmação
            
            alt Existem anúncios que precisam ser tratados
                UseCase->>AdvRepo: updateCreatedUserId(userId, adminUserId)
                AdvRepo->>DB: Atualizar criador dos anúncios
                DB-->>AdvRepo: Confirmação
                AdvRepo-->>UseCase: Confirmação
            end
            
            %% Excluir usuário no sistema
            UseCase->>UserRepo: delete(userId)
            UserRepo->>DB: Excluir usuário
            DB-->>UserRepo: Confirmação
            UserRepo-->>UseCase: Confirmação
            
            UseCase-->>Controller: Sucesso
            Controller-->>User: 204 No Content (Excluído com sucesso)
        end
    end
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de exclusão de um usuário no sistema tuhogar-api.

### Participantes
- **Usuário/Administrador**: Pessoa que está solicitando a exclusão
- **UserController**: Componente que recebe e processa requisições HTTP
- **DeleteUserUseCase**: Componente que orquestra a lógica de negócio para exclusão de usuários
- **UserRepository**: Componente responsável pelo acesso e manipulação dos dados de usuários
- **UserFavoriteRepository**: Componente responsável pelo acesso e manipulação dos dados de usuários favoritos
- **AdvertisementRepository**: Componente responsável pelo acesso e manipulação dos dados de anúncios
- **FirebaseService**: Serviço que interage com o Firebase para autenticação
- **Banco de Dados**: Sistema de armazenamento persistente

### Fluxo Principal
1. O usuário ou administrador envia uma requisição DELETE para `/v1/users/{userId}`
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de exclusão de usuário
4. O caso de uso busca o usuário a ser excluído
5. Se o usuário for encontrado e o solicitante tiver permissão:
   - Verifica se existem dependências (como anúncios criados pelo usuário)
   - Se não houver dependências críticas:
     - Exclui o usuário no Firebase
     - Exclui dados relacionados (relações de favorito)
     - Trata anúncios criados pelo usuário (transferindo para um administrador)
     - Exclui o usuário no sistema
   - Retorna uma mensagem de sucesso
6. O controlador responde à requisição com uma confirmação de sucesso ou uma mensagem de erro

### Cenários Alternativos
- **Usuário não encontrado**: O sistema retorna um erro 404 Not Found
- **Sem permissão para excluir**: O sistema retorna um erro 403 Forbidden
- **Existem dependências críticas**: O sistema retorna um erro 400 Bad Request

### Regras de Permissão
- Um usuário comum só pode excluir sua própria conta
- Um administrador pode excluir qualquer conta de usuário

### Tratamento de Dependências
- Relações de favorito são excluídas
- Anúncios criados pelo usuário são transferidos para um administrador
- Outras dependências podem impedir a exclusão do usuário
