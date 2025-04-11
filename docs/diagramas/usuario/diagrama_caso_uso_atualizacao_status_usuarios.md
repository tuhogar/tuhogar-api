# Diagrama de Caso de Uso - Atualização de Status de Usuários

```mermaid
flowchart TD
    %% Atores
    Admin((Administrador))
    System((Sistema))
    
    %% Casos de Uso
    UC1[Atualizar Status do Usuário]
    UC2[Verificar Permissões]
    UC3[Verificar Existência do Usuário]
    UC4[Validar Status]
    UC5[Notificar Usuário]
    
    %% Relacionamentos
    Admin -->|inicia| UC1
    
    UC1 -->|inclui| UC2
    UC1 -->|inclui| UC3
    UC1 -->|inclui| UC4
    UC1 -->|inclui| UC5
    
    %% Estilização
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px
    classDef usecase fill:#ccf,stroke:#333,stroke-width:1px
    classDef system fill:#cfc,stroke:#333,stroke-width:2px
    
    class Admin actor
    class UC1,UC2,UC3,UC4,UC5 usecase
    class System system
```

## Descrição do Diagrama de Caso de Uso

Este diagrama representa o processo de atualização de status de usuários no sistema tuhogar-api.

### Atores
- **Administrador**: Usuário com privilégios elevados que pode alterar o status de qualquer usuário
- **Sistema**: O sistema tuhogar-api

### Casos de Uso
1. **Atualizar Status do Usuário**: Caso de uso principal que representa o processo completo de atualização de status
2. **Verificar Permissões**: Validação se o solicitante tem permissão para atualizar o status do usuário
3. **Verificar Existência do Usuário**: Validação se o usuário a ter o status atualizado existe
4. **Validar Status**: Verificação se o novo status é válido
5. **Notificar Usuário**: Envio de notificação ao usuário sobre a mudança de status

### Relacionamentos
- O Administrador inicia o processo de atualização de status
- O processo de atualização de status inclui verificação de permissões, verificação de existência do usuário, validação do status e notificação do usuário

### Regras de Negócio
- Apenas administradores podem atualizar o status de usuários
- O usuário deve existir no sistema
- O novo status deve ser um valor válido (ACTIVE ou INACTIVE)
- O usuário deve ser notificado sobre a mudança de status
- A atualização de status pode afetar o acesso do usuário ao sistema
