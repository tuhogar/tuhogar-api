# Diagrama de Sequência - Atualização de Status de Usuários

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador
    participant Controller as UserController
    participant UseCase as UpdateUserStatusUseCase
    participant UserRepo as UserRepository
    participant NotifService as NotificationService
    participant DB as Banco de Dados
    
    Admin->>Controller: PATCH /v1/users/{userId}/status
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>UseCase: execute(authenticatedUser, userId, updateUserStatusDto)
    
    %% Verificar permissões
    alt Usuário não é administrador
        UseCase-->>Controller: Erro: Sem permissão
        Controller-->>Admin: 403 Forbidden (Sem permissão)
    else Usuário é administrador
        %% Verificar existência do usuário
        UseCase->>UserRepo: findOneById(userId)
        UserRepo->>DB: Consultar usuário por ID
        DB-->>UserRepo: Usuário (ou null)
        UserRepo-->>UseCase: Usuário (ou null)
        
        alt Usuário não encontrado
            UseCase-->>Controller: Erro: Usuário não encontrado
            Controller-->>Admin: 404 Not Found (Usuário não encontrado)
        else Usuário encontrado
            %% Validar status
            alt Status inválido
                UseCase-->>Controller: Erro: Status inválido
                Controller-->>Admin: 400 Bad Request (Status inválido)
            else Status válido
                %% Atualizar status
                UseCase->>UserRepo: update(userId, { status: newStatus })
                UserRepo->>DB: Atualizar status do usuário
                DB-->>UserRepo: Usuário atualizado
                UserRepo-->>UseCase: Usuário atualizado
                
                %% Notificar usuário
                UseCase->>NotifService: sendStatusChangeNotification(user, newStatus)
                NotifService-->>UseCase: Confirmação
                
                UseCase-->>Controller: Usuário atualizado
                Controller-->>Admin: 200 OK (Usuário atualizado)
            end
        end
    end
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de atualização de status de um usuário no sistema tuhogar-api.

### Participantes
- **Administrador**: Pessoa com privilégios elevados que está solicitando a atualização de status
- **UserController**: Componente que recebe e processa requisições HTTP
- **UpdateUserStatusUseCase**: Componente que orquestra a lógica de negócio para atualização de status
- **UserRepository**: Componente responsável pelo acesso e manipulação dos dados de usuários
- **NotificationService**: Componente responsável pelo envio de notificações
- **Banco de Dados**: Sistema de armazenamento persistente

### Fluxo Principal
1. O administrador envia uma requisição PATCH para `/v1/users/{userId}/status`
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de atualização de status
4. O caso de uso verifica se o usuário autenticado é um administrador
5. Se for um administrador:
   - Verifica se o usuário a ter o status atualizado existe
   - Se o usuário existir:
     - Valida se o novo status é válido
     - Se o status for válido:
       - Atualiza o status do usuário no banco de dados
       - Notifica o usuário sobre a mudança de status
       - Retorna o usuário atualizado
6. O controlador responde à requisição com o usuário atualizado ou uma mensagem de erro

### Cenários Alternativos
- **Usuário não é administrador**: O sistema retorna um erro 403 Forbidden
- **Usuário não encontrado**: O sistema retorna um erro 404 Not Found
- **Status inválido**: O sistema retorna um erro 400 Bad Request

### Regras de Permissão
- Apenas administradores podem atualizar o status de usuários

### Validações
- O usuário a ter o status atualizado deve existir
- O novo status deve ser um valor válido (ACTIVE ou INACTIVE)

### Efeitos Colaterais
- O usuário é notificado sobre a mudança de status
- A mudança de status pode afetar o acesso do usuário ao sistema
