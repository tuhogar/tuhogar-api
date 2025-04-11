# Diagrama de Sequência - Atualização de Dados de Usuários

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário/Administrador
    participant Controller as UserController
    participant UseCase as PathUserUseCase
    participant UserRepo as UserRepository
    participant Firebase as FirebaseService
    participant DB as Banco de Dados
    
    User->>Controller: PATCH /v1/users/{userId} (dados de atualização)
    Controller->>Controller: Validar dados de entrada (DTO)
    Controller->>UseCase: execute(authenticatedUser, userId, pathUserDto)
    
    UseCase->>UserRepo: findOneById(userId)
    UserRepo->>DB: Consultar usuário por ID
    DB-->>UserRepo: Usuário
    UserRepo-->>UseCase: Usuário
    
    alt Usuário não encontrado
        UseCase-->>Controller: Erro: Usuário não encontrado
        Controller-->>User: 404 Not Found (Usuário não encontrado)
    else Sem permissão para atualizar
        UseCase-->>Controller: Erro: Sem permissão
        Controller-->>User: 403 Forbidden (Sem permissão)
    else Usuário encontrado e com permissão
        UseCase->>UseCase: Validar e preparar dados para atualização
        
        alt Atualização de dados que afetam o Firebase
            UseCase->>Firebase: updateUser(firebaseId, userData)
            Firebase-->>UseCase: Confirmação
        end
        
        UseCase->>UserRepo: update(userId, userData)
        UserRepo->>DB: Atualizar usuário
        DB-->>UserRepo: Usuário atualizado
        UserRepo-->>UseCase: Usuário atualizado
        
        UseCase-->>Controller: Usuário atualizado
        Controller-->>User: 200 OK (Dados do usuário atualizado)
    end
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de atualização de dados de um usuário no sistema tuhogar-api.

### Participantes
- **Usuário/Administrador**: Pessoa que está solicitando a atualização de dados
- **UserController**: Componente que recebe e processa requisições HTTP
- **PathUserUseCase**: Componente que orquestra a lógica de negócio para atualização de usuários
- **UserRepository**: Componente responsável pelo acesso e manipulação dos dados de usuários
- **FirebaseService**: Serviço que interage com o Firebase para autenticação
- **Banco de Dados**: Sistema de armazenamento persistente

### Fluxo Principal
1. O usuário ou administrador envia uma requisição PATCH para `/v1/users/{userId}` com os dados a serem atualizados
2. O controlador valida os dados de entrada usando DTOs
3. O controlador chama o caso de uso de atualização de usuário
4. O caso de uso busca o usuário no banco de dados pelo ID
5. Se o usuário for encontrado e o solicitante tiver permissão:
   - Valida e prepara os dados para atualização
   - Se necessário, atualiza os dados no Firebase
   - Atualiza os dados do usuário no banco de dados
   - Retorna os dados do usuário atualizado
6. O controlador responde à requisição com os dados do usuário atualizado ou uma mensagem de erro

### Cenários Alternativos
- **Usuário não encontrado**: O sistema retorna um erro 404 Not Found
- **Sem permissão para atualizar**: O sistema retorna um erro 403 Forbidden
- **Falha na atualização no Firebase**: O sistema retorna um erro (não mostrado explicitamente no diagrama)
- **Falha na atualização no banco de dados**: O sistema retorna um erro (não mostrado explicitamente no diagrama)

### Regras de Permissão
- Um usuário comum só pode atualizar seus próprios dados
- Um administrador pode atualizar dados de qualquer usuário
- Algumas informações (como papel/role) só podem ser atualizadas por administradores
