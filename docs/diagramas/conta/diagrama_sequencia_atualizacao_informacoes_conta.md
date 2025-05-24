# Diagrama de Sequência - Atualização de Informações da Conta

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Controller as AccountController
    participant UseCase as UpdateAccountUseCase
    participant AccRepo as AccountRepository
    participant UserRepo as UserRepository
    participant ImgService as ImageProcessingService
    participant NotifService as NotificationService
    participant DB as Banco de Dados
    participant Storage as Armazenamento em Nuvem
    
    User->>Controller: PATCH /v1/accounts/{accountId} (com dados atualizados e logo)
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>UseCase: execute(authenticatedUser, accountId, updateAccountDto, logoFile)
    
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
            alt Sem permissão (não é admin e não pertence à conta)
                UseCase-->>Controller: Erro: Sem permissão
                Controller-->>User: 403 Forbidden (Sem permissão)
            else Com permissão
                %% Validar dados da conta
                alt Dados inválidos
                    UseCase-->>Controller: Erro: Dados inválidos
                    Controller-->>User: 400 Bad Request (Dados inválidos)
                else Dados válidos
                    %% Verificar conflitos (email ou nome já existentes)
                    opt Email alterado
                        UseCase->>AccRepo: findOneByEmail(email)
                        AccRepo->>DB: Consultar conta por email
                        DB-->>AccRepo: Conta (ou null)
                        AccRepo-->>UseCase: Conta (ou null)
                        
                        alt Email já existe em outra conta
                            UseCase-->>Controller: Erro: Email já em uso
                            Controller-->>User: 409 Conflict (Email já em uso)
                        end
                    end
                    
                    opt Nome alterado
                        UseCase->>AccRepo: findOneByName(name)
                        AccRepo->>DB: Consultar conta por nome
                        DB-->>AccRepo: Conta (ou null)
                        AccRepo-->>UseCase: Conta (ou null)
                        
                        alt Nome já existe em outra conta
                            UseCase-->>Controller: Erro: Nome já em uso
                            Controller-->>User: 409 Conflict (Nome já em uso)
                        end
                    end
                    
                    %% Processar imagem (se fornecida)
                    opt Logo fornecido
                        UseCase->>ImgService: processAndUploadImage(logoFile, "accounts/logos")
                        ImgService->>Storage: Processar e fazer upload da imagem
                        Storage-->>ImgService: URL da imagem
                        ImgService-->>UseCase: URL da imagem
                    end
                    
                    %% Atualizar conta
                    UseCase->>AccRepo: update(accountId, updatedAccountData)
                    AccRepo->>DB: Atualizar conta
                    DB-->>AccRepo: Conta atualizada
                    AccRepo-->>UseCase: Conta atualizada
                    
                    %% Notificar usuários da conta
                    UseCase->>UserRepo: findAllByAccountId(accountId)
                    UserRepo->>DB: Consultar usuários da conta
                    DB-->>UserRepo: Lista de usuários
                    UserRepo-->>UseCase: Lista de usuários
                    
                    UseCase->>NotifService: notifyAccountUpdate(users, updatedAccount)
                    NotifService-->>UseCase: Confirmação
                    
                    UseCase-->>Controller: Conta atualizada
                    Controller-->>User: 200 OK (Conta atualizada)
                end
            end
        end
    end
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de atualização de informações de uma conta no sistema tuhogar-api.

### Participantes
- **Usuário**: Pessoa que está utilizando o sistema
- **AccountController**: Componente que recebe e processa requisições HTTP
- **UpdateAccountUseCase**: Componente que orquestra a lógica de negócio para atualização de contas
- **AccountRepository**: Componente responsável pelo acesso aos dados de contas
- **UserRepository**: Componente responsável pelo acesso aos dados de usuários
- **ImageProcessingService**: Componente responsável pelo processamento e upload de imagens
- **NotificationService**: Componente responsável pelo envio de notificações
- **Banco de Dados**: Sistema de armazenamento persistente
- **Armazenamento em Nuvem**: Serviço para armazenamento de arquivos

### Fluxo Principal
1. O usuário envia uma requisição PATCH para `/v1/accounts/{accountId}` com os dados atualizados e opcionalmente uma nova imagem de logo
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de atualização de conta
4. O caso de uso verifica se o usuário está autenticado
5. Se o usuário estiver autenticado:
   - Busca a conta pelo ID fornecido
   - Se a conta for encontrada:
     - Verifica se o usuário tem permissão para atualizar a conta
     - Se tiver permissão:
       - Valida os novos dados da conta
       - Verifica conflitos (email ou nome já existentes em outras contas)
       - Processa a nova imagem de logo (se fornecida)
       - Atualiza a conta no banco de dados
       - Notifica os usuários vinculados à conta sobre as alterações
       - Retorna a conta atualizada
6. O controlador responde à requisição com a conta atualizada ou uma mensagem de erro

### Cenários Alternativos
- **Usuário não autenticado**: O sistema retorna um erro 401 Unauthorized
- **Conta não encontrada**: O sistema retorna um erro 404 Not Found
- **Sem permissão**: O sistema retorna um erro 403 Forbidden
- **Dados inválidos**: O sistema retorna um erro 400 Bad Request
- **Conflito de email ou nome**: O sistema retorna um erro 409 Conflict

### Regras de Permissão
- Um usuário comum só pode atualizar a conta à qual está vinculado
- Um administrador pode atualizar qualquer conta

### Validações
- Os novos dados da conta devem ser válidos
- O email e o nome da conta devem ser únicos no sistema

### Processamento de Imagem
- Se uma nova imagem de logo for fornecida, ela é processada e armazenada em um serviço de armazenamento em nuvem
- A URL da imagem processada é armazenada no campo logoUrl da conta

### Notificações
- Todos os usuários vinculados à conta são notificados sobre as alterações realizadas
