# Diagrama de Sequência - Atualização de Status da Conta

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Controller as AccountController
    participant UseCase as UpdateAccountStatusUseCase
    participant AccRepo as AccountRepository
    participant HistRepo as AccountStatusHistoryRepository
    participant AdvRepo as AdvertisementRepository
    participant NotifService as NotificationService
    participant DB as Banco de Dados
    
    User->>Controller: PATCH /v1/accounts/{accountId}/status
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>UseCase: execute(authenticatedUser, accountId, updateStatusDto)
    
    %% Verificar autenticação
    alt Usuário não autenticado
        UseCase-->>Controller: Erro: Usuário não autenticado
        Controller-->>User: 401 Unauthorized (Não autenticado)
    else Usuário autenticado
        %% Buscar conta
        UseCase->>AccRepo: findOneById(accountId)
        AccRepo->>DB: Consultar conta por ID
        DB-->>AccRepo: Conta (ou null)
        AccRepo-->>UseCase: Conta (ou null)
        
        alt Conta não encontrada
            UseCase-->>Controller: Erro: Conta não encontrada
            Controller-->>User: 404 Not Found (Conta não encontrada)
        else Conta encontrada
            %% Verificar permissões
            alt Sem permissão (não é admin e não pertence à conta ou transição restrita)
                UseCase-->>Controller: Erro: Sem permissão
                Controller-->>User: 403 Forbidden (Sem permissão)
            else Com permissão
                %% Verificar se a transição de status é válida
                UseCase->>UseCase: conta.canTransitionTo(updateStatusDto.status)
                
                alt Transição inválida
                    UseCase-->>Controller: Erro: Transição de status inválida
                    Controller-->>User: 400 Bad Request (Transição inválida)
                else Transição válida
                    %% Armazenar status antigo para histórico
                    UseCase->>UseCase: oldStatus = conta.status
                    
                    %% Atualizar status da conta
                    UseCase->>AccRepo: update(accountId, { status: updateStatusDto.status })
                    AccRepo->>DB: Atualizar status da conta
                    DB-->>AccRepo: Conta atualizada
                    AccRepo-->>UseCase: Conta atualizada
                    
                    %% Registrar no histórico
                    UseCase->>HistRepo: create({ accountId, oldStatus, newStatus, userId, reason })
                    HistRepo->>DB: Inserir registro de histórico
                    DB-->>HistRepo: Histórico criado
                    HistRepo-->>UseCase: Histórico criado
                    
                    %% Atualizar anúncios se necessário
                    alt Novo status é INACTIVE ou SUSPENDED
                        UseCase->>AdvRepo: updateStatusByAccountId(accountId, 'INACTIVE')
                        AdvRepo->>DB: Desativar anúncios da conta
                        DB-->>AdvRepo: Número de anúncios atualizados
                        AdvRepo-->>UseCase: Número de anúncios atualizados
                    end
                    
                    %% Notificar usuários da conta
                    UseCase->>NotifService: notifyAccountStatusChange(account, oldStatus, newStatus, reason)
                    NotifService-->>UseCase: Notificação enviada
                    
                    UseCase-->>Controller: Conta atualizada
                    Controller-->>User: 200 OK (Conta atualizada)
                end
            end
        end
    end
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de atualização de status de uma conta no sistema tuhogar-api, seguindo os princípios de Clean Architecture.

### Participantes
- **Usuário**: Pessoa que está utilizando o sistema
- **AccountController**: Componente que recebe e processa requisições HTTP
- **UpdateAccountStatusUseCase**: Componente que orquestra a lógica de negócio para atualização de status
- **AccountRepository**: Componente responsável pelo acesso aos dados de contas
- **AccountStatusHistoryRepository**: Componente responsável pelo registro do histórico de alterações de status
- **AdvertisementRepository**: Componente responsável pelo acesso aos dados de anúncios
- **NotificationService**: Componente responsável pelo envio de notificações
- **Banco de Dados**: Sistema de armazenamento persistente

### Fluxo Principal
1. O usuário envia uma requisição PATCH para `/v1/accounts/{accountId}/status` com o novo status e motivo da alteração
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de atualização de status
4. O caso de uso verifica se o usuário está autenticado
5. Se o usuário estiver autenticado:
   - Busca a conta pelo ID fornecido
   - Se a conta for encontrada:
     - Verifica se o usuário tem permissão para atualizar o status da conta
     - Se tiver permissão:
       - Verifica se a transição de status é válida
       - Se a transição for válida:
         - Armazena o status antigo para registro no histórico
         - Atualiza o status da conta
         - Registra a alteração no histórico
         - Se o novo status for INACTIVE ou SUSPENDED, desativa os anúncios vinculados à conta
         - Notifica os usuários da conta sobre a alteração de status
         - Retorna a conta atualizada
6. O controlador responde à requisição com a conta atualizada ou uma mensagem de erro

### Cenários Alternativos
- **Usuário não autenticado**: O sistema retorna um erro 401 Unauthorized
- **Conta não encontrada**: O sistema retorna um erro 404 Not Found
- **Sem permissão**: O sistema retorna um erro 403 Forbidden
- **Transição inválida**: O sistema retorna um erro 400 Bad Request

### Regras de Permissão
- Um usuário comum só pode realizar certas transições de status para a conta à qual está vinculado
- Um administrador pode realizar qualquer transição de status para qualquer conta

### Transições de Status
- Nem todas as transições de status são permitidas (ex: uma conta SUSPENDED só pode ser reativada por um administrador)
- A validação de transições é feita pelo método `canTransitionTo` da entidade Account

### Efeitos Colaterais
- A alteração de status é registrada no histórico para fins de auditoria
- Se o novo status for INACTIVE ou SUSPENDED, os anúncios vinculados à conta são desativados
- Os usuários da conta são notificados sobre a alteração de status

### Considerações Técnicas
- O motivo da alteração de status é registrado no histórico
- As notificações são enviadas por um serviço dedicado, que pode usar diferentes canais (email, SMS, etc.)
- A atualização de anúncios é feita em massa para todos os anúncios vinculados à conta
