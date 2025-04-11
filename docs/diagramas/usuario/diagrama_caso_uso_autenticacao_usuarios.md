# Diagrama de Caso de Uso - Autenticação de Usuários (Login)

```mermaid
flowchart TD
    %% Atores
    User((Usuário))
    System((Sistema))
    Firebase((Firebase))
    
    %% Casos de Uso
    UC1[Autenticar Usuário]
    UC2[Validar Credenciais]
    UC3[Verificar Status do Usuário]
    UC4[Gerar Token de Acesso]
    UC5[Registrar Login]
    
    %% Relacionamentos
    User -->|inicia| UC1
    UC1 -->|inclui| UC2
    UC1 -->|inclui| UC3
    UC1 -->|inclui| UC4
    UC1 -->|inclui| UC5
    
    UC2 -.->|estende| Firebase
    UC4 -.->|estende| Firebase
    
    %% Estilização
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px
    classDef usecase fill:#ccf,stroke:#333,stroke-width:1px
    classDef system fill:#cfc,stroke:#333,stroke-width:2px
    
    class User,Firebase actor
    class UC1,UC2,UC3,UC4,UC5 usecase
    class System system
```

## Descrição do Diagrama de Caso de Uso

Este diagrama representa o processo de autenticação de usuários (login) no sistema tuhogar-api.

### Atores
- **Usuário**: Pessoa que deseja se autenticar no sistema
- **Firebase**: Serviço externo de autenticação
- **Sistema**: O sistema tuhogar-api

### Casos de Uso
1. **Autenticar Usuário**: Caso de uso principal que representa o processo completo de login
2. **Validar Credenciais**: Verificação das credenciais fornecidas pelo usuário
3. **Verificar Status do Usuário**: Verificação se o usuário está ativo no sistema
4. **Gerar Token de Acesso**: Geração de token JWT para autorização
5. **Registrar Login**: Registro da atividade de login no sistema

### Relacionamentos
- O Usuário inicia o processo de autenticação
- O processo de autenticação inclui validação de credenciais, verificação de status, geração de token e registro de login
- A validação de credenciais e a geração de token são extensões que dependem do serviço externo Firebase
