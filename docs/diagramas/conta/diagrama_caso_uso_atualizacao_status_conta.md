# Diagrama de Caso de Uso - Atualização de Status da Conta

```mermaid
flowchart TD
    %% Atores
    Admin((Administrador))
    User((Usuário))
    System((Sistema))
    
    %% Casos de Uso
    UC1[Atualizar Status da Conta]
    UC2[Verificar Autenticação]
    UC3[Verificar Permissões]
    UC4[Validar Status]
    UC5[Notificar Usuários da Conta]
    UC6[Registrar Histórico de Alterações]
    UC7[Atualizar Status de Anúncios]
    
    %% Relacionamentos
    Admin -->|inicia| UC1
    User -->|inicia| UC1
    
    UC1 -->|inclui| UC2
    UC1 -->|inclui| UC3
    UC1 -->|inclui| UC4
    UC1 -->|inclui| UC5
    UC1 -->|inclui| UC6
    UC1 -->|inclui| UC7
    
    %% Estilização
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px
    classDef usecase fill:#ccf,stroke:#333,stroke-width:1px
    classDef system fill:#cfc,stroke:#333,stroke-width:2px
    
    class Admin,User actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7 usecase
    class System system
```

## Descrição do Diagrama de Caso de Uso

Este diagrama representa o processo de atualização do status de uma conta no sistema tuhogar-api.

### Atores
- **Administrador**: Usuário com privilégios elevados que pode atualizar o status de qualquer conta
- **Usuário**: Pessoa vinculada à conta que pode atualizar o status da própria conta (com restrições)
- **Sistema**: O sistema tuhogar-api

### Casos de Uso
1. **Atualizar Status da Conta**: Processo principal de atualização do status de uma conta
2. **Verificar Autenticação**: Validação se o usuário está autenticado no sistema
3. **Verificar Permissões**: Validação se o usuário tem permissão para atualizar o status da conta
4. **Validar Status**: Verificação se o novo status é válido e se a transição é permitida
5. **Notificar Usuários da Conta**: Envio de notificações aos usuários vinculados à conta sobre a mudança de status
6. **Registrar Histórico de Alterações**: Registro da alteração de status no histórico da conta
7. **Atualizar Status de Anúncios**: Atualização do status dos anúncios vinculados à conta, se necessário

### Relacionamentos
- O Administrador ou o Usuário iniciam o processo de atualização de status
- O processo de atualização inclui verificação de autenticação, verificação de permissões, validação do status, notificação de usuários, registro no histórico e atualização de anúncios

### Regras de Negócio
- O usuário deve estar autenticado para atualizar o status da conta
- Um usuário comum só pode realizar certas transições de status (ex: ativar ou desativar sua própria conta)
- Um administrador pode realizar qualquer transição de status para qualquer conta
- O novo status deve ser um valor válido (ACTIVE, INACTIVE, PENDING, SUSPENDED)
- Certas transições de status podem ser restritas (ex: uma conta SUSPENDED só pode ser reativada por um administrador)
- Quando uma conta é suspensa ou inativada, os anúncios vinculados a ela podem ser automaticamente desativados
- Todas as alterações de status são registradas em um histórico para auditoria
- Os usuários vinculados à conta são notificados sobre a mudança de status
