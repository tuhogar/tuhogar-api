# Diagrama de Sequência - Exclusão de Usuário da Conta

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador/Admin da Conta
    participant Controller as UserController
    participant UseCase as RemoveUserFromAccountUseCase
    participant UserRepo as UserRepository
    participant AccRepo as AccountRepository
    participant HistRepo as UserAccountRemovalHistoryRepository
    participant AuthService as AuthService
    participant NotifService as NotificationService
    participant DB as Banco de Dados
    
    Admin->>Controller: DELETE /v1/accounts/{accountId}/users/{userId}
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>UseCase: execute(authenticatedUser, accountId, userId, reason)
    
    %% Verificar autenticação
    alt Usuário não autenticado
        UseCase-->>Controller: Erro: Usuário não autenticado
        Controller-->>Admin: 401 Unauthorized (Não autenticado)
    else Usuário autenticado
        %% Buscar conta
        UseCase->>AccRepo: findOneById(accountId)
        AccRepo->>DB: Consultar conta por ID
        DB-->>AccRepo: Conta (ou null)
        AccRepo-->>UseCase: Conta (ou null)
        
        alt Conta não encontrada
            UseCase-->>Controller: Erro: Conta não encontrada
            Controller-->>Admin: 404 Not Found (Conta não encontrada)
        else Conta encontrada
            %% Verificar permissões
            alt Sem permissão (não é admin global e não é admin da conta)
                UseCase-->>Controller: Erro: Sem permissão
                Controller-->>Admin: 403 Forbidden (Sem permissão)
            else Com permissão
                %% Buscar usuário a ser removido
                UseCase->>UserRepo: findOneById(userId)
                UserRepo->>DB: Consultar usuário por ID
                DB-->>UserRepo: Usuário (ou null)
                UserRepo-->>UseCase: Usuário (ou null)
                
                alt Usuário não encontrado
                    UseCase-->>Controller: Erro: Usuário não encontrado
                    Controller-->>Admin: 404 Not Found (Usuário não encontrado)
                else Usuário encontrado
                    %% Verificar se o usuário pertence à conta
                    alt Usuário não pertence à conta
                        UseCase-->>Controller: Erro: Usuário não pertence à conta
                        Controller-->>Admin: 400 Bad Request (Usuário não pertence à conta)
                    else Usuário pertence à conta
                        %% Verificar se é o próprio usuário tentando se remover
                        alt É o próprio usuário
                            UseCase-->>Controller: Erro: Não é possível remover a si mesmo
                            Controller-->>Admin: 400 Bad Request (Não é possível remover a si mesmo)
                        else Não é o próprio usuário
                            %% Verificar se é o último administrador da conta
                            alt Usuário é admin da conta
                                UseCase->>UserRepo: findAllByAccountId(accountId)
                                UserRepo->>DB: Consultar usuários da conta
                                DB-->>UserRepo: Lista de usuários
                                UserRepo-->>UseCase: Lista de usuários
                                
                                UseCase->>UseCase: Contar admins da conta
                                
                                alt É o último admin da conta
                                    UseCase-->>Controller: Erro: Não é possível remover o último admin
                                    Controller-->>Admin: 400 Bad Request (Não é possível remover o último admin)
                                else Não é o último admin
                                    %% Continuar com a remoção
                                    UseCase->>UseCase: Prosseguir com remoção
                                end
                            else Usuário não é admin da conta
                                %% Continuar com a remoção
                                UseCase->>UseCase: Prosseguir com remoção
                            end
                            
                            %% Remover usuário da conta
                            UseCase->>UserRepo: removeFromAccount(userId)
                            UserRepo->>DB: Atualizar usuário (remover accountId)
                            DB-->>UserRepo: Usuário atualizado
                            UserRepo-->>UseCase: Usuário atualizado
                            
                            %% Revogar acesso do usuário à conta
                            UseCase->>AuthService: revokeAccountAccess(userId, accountId)
                            AuthService-->>UseCase: Acesso revogado
                            
                            %% Registrar no histórico
                            UseCase->>HistRepo: create({ userId, accountId, removedByUserId, reason })
                            HistRepo->>DB: Inserir registro de histórico
                            DB-->>HistRepo: Histórico criado
                            HistRepo-->>UseCase: Histórico criado
                            
                            %% Notificar usuário removido
                            UseCase->>NotifService: notifyUserRemovedFromAccount(user, account, authenticatedUser, reason)
                            NotifService-->>UseCase: Notificação enviada
                            
                            UseCase-->>Controller: Sucesso
                            Controller-->>Admin: 204 No Content (Usuário removido com sucesso)
                        end
                    end
                end
            end
        end
    end
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de exclusão de um usuário de uma conta no sistema tuhogar-api, seguindo os princípios de Clean Architecture.

### Participantes
- **Administrador/Admin da Conta**: Pessoa que está iniciando a exclusão do usuário
- **UserController**: Componente que recebe e processa requisições HTTP
- **RemoveUserFromAccountUseCase**: Componente que orquestra a lógica de negócio para exclusão de usuário
- **UserRepository**: Componente responsável pelo acesso aos dados de usuários
- **AccountRepository**: Componente responsável pelo acesso aos dados de contas
- **UserAccountRemovalHistoryRepository**: Componente responsável pelo registro do histórico de exclusões
- **AuthService**: Componente responsável pelo gerenciamento de autenticação e autorização
- **NotificationService**: Componente responsável pelo envio de notificações
- **Banco de Dados**: Sistema de armazenamento persistente

### Fluxo Principal
1. O administrador ou administrador da conta envia uma requisição DELETE para `/v1/accounts/{accountId}/users/{userId}` com o motivo da exclusão
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de exclusão de usuário
4. O caso de uso verifica se o solicitante está autenticado
5. Se o solicitante estiver autenticado:
   - Busca a conta pelo ID fornecido
   - Se a conta for encontrada:
     - Verifica se o solicitante tem permissão para excluir usuários da conta
     - Se tiver permissão:
       - Busca o usuário a ser removido pelo ID fornecido
       - Se o usuário for encontrado:
         - Verifica se o usuário pertence à conta
         - Se o usuário pertencer à conta:
           - Verifica se o solicitante está tentando remover a si mesmo
           - Se não estiver:
             - Se o usuário a ser removido for um administrador da conta, verifica se é o último administrador
             - Se não for o último administrador ou não for um administrador:
               - Remove o usuário da conta
               - Revoga os acessos do usuário à conta
               - Registra a exclusão no histórico
               - Notifica o usuário sobre a exclusão
               - Retorna sucesso
6. O controlador responde à requisição com uma confirmação de sucesso ou uma mensagem de erro

### Cenários Alternativos
- **Solicitante não autenticado**: O sistema retorna um erro 401 Unauthorized
- **Conta não encontrada**: O sistema retorna um erro 404 Not Found
- **Sem permissão**: O sistema retorna um erro 403 Forbidden
- **Usuário não encontrado**: O sistema retorna um erro 404 Not Found
- **Usuário não pertence à conta**: O sistema retorna um erro 400 Bad Request
- **Tentativa de remover a si mesmo**: O sistema retorna um erro 400 Bad Request
- **Tentativa de remover o último administrador**: O sistema retorna um erro 400 Bad Request

### Regras de Permissão
- Um administrador global pode excluir qualquer usuário de qualquer conta
- Um administrador de conta só pode excluir usuários da conta que administra
- Um usuário comum não pode excluir outros usuários

### Validações
- O sistema verifica se o usuário a ser removido pertence à conta
- O sistema não permite que um usuário remova a si mesmo
- O sistema não permite a remoção do último administrador de uma conta

### Efeitos Colaterais
- O usuário é desvinculado da conta (accountId é removido)
- Os acessos do usuário à conta são revogados
- A exclusão é registrada no histórico para fins de auditoria
- O usuário é notificado sobre a exclusão

### Considerações Técnicas
- A remoção do usuário da conta não exclui o usuário do sistema, apenas desvincula da conta
- O motivo da exclusão é registrado no histórico e incluído na notificação ao usuário
