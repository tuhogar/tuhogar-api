# Diagrama de Sequência - Criação de Contas

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Controller as AccountController
    participant UseCase as CreateAccountUseCase
    participant AccRepo as AccountRepository
    participant UserRepo as UserRepository
    participant ImgService as ImageProcessingService
    participant DB as Banco de Dados
    participant Storage as Armazenamento em Nuvem
    
    User->>Controller: POST /v1/accounts (com dados da conta e logo)
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>UseCase: execute(authenticatedUser, createAccountDto, logoFile)
    
    %% Verificar autenticação
    alt Usuário não autenticado
        UseCase-->>Controller: Erro: Usuário não autenticado
        Controller-->>User: 401 Unauthorized (Não autenticado)
    else Usuário autenticado
        %% Validar dados da conta
        alt Dados inválidos
            UseCase-->>Controller: Erro: Dados inválidos
            Controller-->>User: 400 Bad Request (Dados inválidos)
        else Dados válidos
            %% Verificar existência de conta
            UseCase->>AccRepo: findOneByEmail(email)
            AccRepo->>DB: Consultar conta por email
            DB-->>AccRepo: Conta (ou null)
            AccRepo-->>UseCase: Conta (ou null)
            
            UseCase->>AccRepo: findOneByName(name)
            AccRepo->>DB: Consultar conta por nome
            DB-->>AccRepo: Conta (ou null)
            AccRepo-->>UseCase: Conta (ou null)
            
            alt Conta já existe
                UseCase-->>Controller: Erro: Conta já existe
                Controller-->>User: 409 Conflict (Conta já existe)
            else Conta não existe
                %% Processar imagem (se fornecida)
                opt Logo fornecido
                    UseCase->>ImgService: processAndUploadImage(logoFile, "accounts/logos")
                    ImgService->>Storage: Processar e fazer upload da imagem
                    Storage-->>ImgService: URL da imagem
                    ImgService-->>UseCase: URL da imagem
                end
                
                %% Criar conta
                UseCase->>UseCase: Criar objeto Account
                UseCase->>AccRepo: create(account)
                AccRepo->>DB: Inserir conta
                DB-->>AccRepo: Conta criada
                AccRepo-->>UseCase: Conta criada
                
                %% Associar usuário à conta
                UseCase->>UserRepo: findOneById(authenticatedUser.id)
                UserRepo->>DB: Consultar usuário
                DB-->>UserRepo: Usuário
                UserRepo-->>UseCase: Usuário
                
                UseCase->>UserRepo: update(userId, { accountId: account.id })
                UserRepo->>DB: Atualizar usuário
                DB-->>UserRepo: Usuário atualizado
                UserRepo-->>UseCase: Usuário atualizado
                
                UseCase-->>Controller: Conta criada
                Controller-->>User: 201 Created (Conta criada)
            end
        end
    end
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de criação de uma conta no sistema tuhogar-api.

### Participantes
- **Usuário**: Pessoa que está utilizando o sistema
- **AccountController**: Componente que recebe e processa requisições HTTP
- **CreateAccountUseCase**: Componente que orquestra a lógica de negócio para criação de contas
- **AccountRepository**: Componente responsável pelo acesso aos dados de contas
- **UserRepository**: Componente responsável pelo acesso aos dados de usuários
- **ImageProcessingService**: Componente responsável pelo processamento e upload de imagens
- **Banco de Dados**: Sistema de armazenamento persistente
- **Armazenamento em Nuvem**: Serviço para armazenamento de arquivos

### Fluxo Principal
1. O usuário envia uma requisição POST para `/v1/accounts` com os dados da conta e opcionalmente uma imagem de logo
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de criação de conta
4. O caso de uso verifica se o usuário está autenticado
5. Se o usuário estiver autenticado:
   - Valida os dados da conta
   - Se os dados forem válidos:
     - Verifica se já existe uma conta com o mesmo email ou nome
     - Se não existir:
       - Processa a imagem de logo (se fornecida)
       - Cria a conta no banco de dados
       - Associa o usuário autenticado à nova conta
       - Retorna a conta criada
6. O controlador responde à requisição com a conta criada ou uma mensagem de erro

### Cenários Alternativos
- **Usuário não autenticado**: O sistema retorna um erro 401 Unauthorized
- **Dados inválidos**: O sistema retorna um erro 400 Bad Request
- **Conta já existe**: O sistema retorna um erro 409 Conflict

### Validações
- O usuário deve estar autenticado
- Os dados da conta devem ser válidos
- Não deve existir outra conta com o mesmo email ou nome

### Processamento de Imagem
- Se uma imagem de logo for fornecida, ela é processada e armazenada em um serviço de armazenamento em nuvem
- A URL da imagem processada é armazenada no campo logoUrl da conta

### Associação de Usuário
- O usuário que cria a conta é automaticamente associado a ela
- A associação é feita atualizando o campo accountId do usuário
