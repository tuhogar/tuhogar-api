# Diagrama de Sequência - Gerenciamento de Tipos de Contrato

## Descrição
Este diagrama descreve a sequência de interações entre os componentes do sistema durante os processos de gerenciamento de tipos de contrato, seguindo os princípios de Clean Architecture e Domain-Driven Design.

## Diagrama

```mermaid
sequenceDiagram
    %% Atores e Componentes
    actor Admin as Administrador
    actor User as Usuário
    participant Controller as ContractTypeController
    participant CreateUC as CreateContractTypeUseCase
    participant GetAllUC as GetAllContractTypesUseCase
    participant UpdateUC as UpdateContractTypeUseCase
    participant DeactivateUC as DeactivateContractTypeUseCase
    participant IContractRepo as IContractTypeRepository
    participant IAdRepo as IAdvertisementRepository
    participant ContractType as ContractType Entity
    participant MongoRepo as MongooseContractTypeRepository
    participant MongoDB as MongoDB

    %% Fluxo de Criação de Tipo de Contrato
    Admin->>Controller: POST /contract-types (CreateContractTypeDto)
    Controller->>CreateUC: execute(CreateContractTypeCommand)
    
    %% Verificação de nome único
    CreateUC->>IContractRepo: findByName(name)
    IContractRepo->>MongoRepo: findByName(name)
    MongoRepo->>MongoDB: findOne({name})
    MongoDB-->>MongoRepo: null (não existe)
    MongoRepo-->>IContractRepo: null
    IContractRepo-->>CreateUC: null
    
    %% Verificação de código único
    CreateUC->>IContractRepo: findByCode(code)
    IContractRepo->>MongoRepo: findByCode(code)
    MongoRepo->>MongoDB: findOne({code})
    MongoDB-->>MongoRepo: null (não existe)
    MongoRepo-->>IContractRepo: null
    IContractRepo-->>CreateUC: null
    
    %% Criação da entidade e persistência
    CreateUC->>ContractType: new ContractType(props)
    ContractType-->>CreateUC: instância de ContractType
    
    CreateUC->>IContractRepo: create(contractType)
    IContractRepo->>MongoRepo: create(contractType)
    MongoRepo->>MongoDB: save(contractTypeDocument)
    MongoDB-->>MongoRepo: contractTypeDocument salvo
    MongoRepo-->>IContractRepo: ContractType
    IContractRepo-->>CreateUC: ContractType
    CreateUC-->>Controller: ContractType
    Controller-->>Admin: Resposta HTTP 201 Created
    
    %% Fluxo de Listagem de Tipos de Contrato
    User->>Controller: GET /contract-types?includeInactive=false
    Controller->>GetAllUC: execute(false)
    GetAllUC->>IContractRepo: findAll(false)
    IContractRepo->>MongoRepo: findAll(false)
    MongoRepo->>MongoDB: find({active: true})
    MongoDB-->>MongoRepo: Array de documentos
    MongoRepo-->>IContractRepo: Array de ContractType
    IContractRepo-->>GetAllUC: Array de ContractType
    GetAllUC-->>Controller: Array de ContractType
    Controller-->>User: Resposta HTTP 200 OK
    
    %% Fluxo de Atualização de Tipo de Contrato
    Admin->>Controller: PUT /contract-types/{id} (UpdateContractTypeDto)
    Controller->>UpdateUC: execute(id, UpdateContractTypeCommand)
    
    %% Busca do tipo de contrato existente
    UpdateUC->>IContractRepo: findById(id)
    IContractRepo->>MongoRepo: findById(id)
    MongoRepo->>MongoDB: findOne({_id: id})
    MongoDB-->>MongoRepo: contractTypeDocument
    MongoRepo-->>IContractRepo: ContractType
    IContractRepo-->>UpdateUC: ContractType
    
    %% Verificação de nome único (se alterado)
    alt Nome foi alterado
        UpdateUC->>IContractRepo: findByName(newName)
        IContractRepo->>MongoRepo: findByName(newName)
        MongoRepo->>MongoDB: findOne({name: newName})
        MongoDB-->>MongoRepo: null (não existe)
        MongoRepo-->>IContractRepo: null
        IContractRepo-->>UpdateUC: null
    end
    
    %% Verificação de código único (se alterado)
    alt Código foi alterado
        UpdateUC->>IContractRepo: findByCode(newCode)
        IContractRepo->>MongoRepo: findByCode(newCode)
        MongoRepo->>MongoDB: findOne({code: newCode})
        MongoDB-->>MongoRepo: null (não existe)
        MongoRepo-->>IContractRepo: null
        IContractRepo-->>UpdateUC: null
    end
    
    %% Atualização da entidade e persistência
    UpdateUC->>ContractType: update(props)
    ContractType-->>UpdateUC: ContractType atualizado
    
    UpdateUC->>IContractRepo: update(contractType)
    IContractRepo->>MongoRepo: update(contractType)
    MongoRepo->>MongoDB: updateOne({_id: id}, contractTypeData)
    MongoDB-->>MongoRepo: resultado da operação
    MongoRepo-->>IContractRepo: ContractType atualizado
    IContractRepo-->>UpdateUC: ContractType atualizado
    UpdateUC-->>Controller: ContractType atualizado
    Controller-->>Admin: Resposta HTTP 200 OK
    
    %% Fluxo de Desativação de Tipo de Contrato
    Admin->>Controller: PUT /contract-types/{id}/deactivate
    Controller->>DeactivateUC: execute(id)
    
    %% Busca do tipo de contrato existente
    DeactivateUC->>IContractRepo: findById(id)
    IContractRepo->>MongoRepo: findById(id)
    MongoRepo->>MongoDB: findOne({_id: id})
    MongoDB-->>MongoRepo: contractTypeDocument
    MongoRepo-->>IContractRepo: ContractType
    IContractRepo-->>DeactivateUC: ContractType
    
    %% Verificação de uso em anúncios
    DeactivateUC->>IAdRepo: countByContractTypeId(id)
    IAdRepo-->>DeactivateUC: count (número de anúncios)
    
    alt Tipo de Contrato em uso
        DeactivateUC->>Admin: Solicita confirmação
        Admin->>DeactivateUC: Confirma desativação
    end
    
    %% Desativação da entidade e persistência
    DeactivateUC->>ContractType: deactivate()
    ContractType-->>DeactivateUC: ContractType desativado
    
    DeactivateUC->>IContractRepo: update(contractType)
    IContractRepo->>MongoRepo: update(contractType)
    MongoRepo->>MongoDB: updateOne({_id: id}, {$set: {active: false}})
    MongoDB-->>MongoRepo: resultado da operação
    MongoRepo-->>IContractRepo: ContractType desativado
    IContractRepo-->>DeactivateUC: ContractType desativado
    DeactivateUC-->>Controller: ContractType desativado
    Controller-->>Admin: Resposta HTTP 200 OK
```

## Descrição dos Fluxos

### Fluxo de Criação de Tipo de Contrato

1. **Administrador → ContractTypeController**:
   - O Administrador envia uma requisição HTTP POST para o endpoint `/contract-types` com os dados do novo tipo de contrato.

2. **ContractTypeController → CreateContractTypeUseCase**:
   - O ContractTypeController valida os dados recebidos através do CreateContractTypeDto.
   - O ContractTypeController chama o método `execute` do CreateContractTypeUseCase, passando os dados validados como CreateContractTypeCommand.

3. **Verificação de Nome Único**:
   - O CreateContractTypeUseCase verifica se já existe um tipo de contrato com o mesmo nome, chamando o método `findByName` do IContractTypeRepository.
   - A implementação MongooseContractTypeRepository executa uma consulta no MongoDB.
   - O MongoDB retorna null, indicando que não existe um tipo de contrato com o nome fornecido.

4. **Verificação de Código Único**:
   - O CreateContractTypeUseCase verifica se já existe um tipo de contrato com o mesmo código, chamando o método `findByCode` do IContractTypeRepository.
   - A implementação MongooseContractTypeRepository executa uma consulta no MongoDB.
   - O MongoDB retorna null, indicando que não existe um tipo de contrato com o código fornecido.

5. **Criação da Entidade e Persistência**:
   - O CreateContractTypeUseCase cria uma nova instância da entidade ContractType com os dados fornecidos.
   - A entidade ContractType valida os dados e retorna uma nova instância.
   - O CreateContractTypeUseCase chama o método `create` do IContractTypeRepository para persistir o novo tipo de contrato.
   - A implementação MongooseContractTypeRepository salva o documento no MongoDB.
   - O resultado é retornado através das camadas até o Administrador.

### Fluxo de Listagem de Tipos de Contrato

1. **Usuário → ContractTypeController**:
   - O Usuário envia uma requisição HTTP GET para o endpoint `/contract-types` com o parâmetro `includeInactive=false`.

2. **ContractTypeController → GetAllContractTypesUseCase**:
   - O ContractTypeController chama o método `execute` do GetAllContractTypesUseCase, passando o parâmetro `includeInactive`.

3. **GetAllContractTypesUseCase → IContractTypeRepository → MongooseContractTypeRepository → MongoDB**:
   - O GetAllContractTypesUseCase chama o método `findAll` do IContractTypeRepository.
   - A implementação MongooseContractTypeRepository executa uma consulta no MongoDB para recuperar os tipos de contrato ativos.
   - O MongoDB retorna os documentos encontrados.
   - O MongooseContractTypeRepository converte os documentos em instâncias da entidade ContractType.
   - O resultado é retornado através das camadas até o Usuário.

### Fluxo de Atualização de Tipo de Contrato

1. **Administrador → ContractTypeController**:
   - O Administrador envia uma requisição HTTP PUT para o endpoint `/contract-types/{id}` com os dados a serem atualizados.

2. **ContractTypeController → UpdateContractTypeUseCase**:
   - O ContractTypeController valida os dados recebidos através do UpdateContractTypeDto.
   - O ContractTypeController chama o método `execute` do UpdateContractTypeUseCase, passando o ID do tipo de contrato e os dados validados como UpdateContractTypeCommand.

3. **Busca do Tipo de Contrato Existente**:
   - O UpdateContractTypeUseCase busca o tipo de contrato existente pelo ID através do método `findById` do IContractTypeRepository.
   - A implementação MongooseContractTypeRepository executa uma consulta no MongoDB.
   - O MongoDB retorna o documento encontrado.
   - O MongooseContractTypeRepository converte o documento em uma instância da entidade ContractType.

4. **Verificação de Nome Único (se alterado)**:
   - Se o nome do tipo de contrato for alterado, o UpdateContractTypeUseCase verifica se já existe outro tipo de contrato com o mesmo nome.
   - A verificação segue um fluxo similar ao passo 3 da criação, mas usando o método `findByName`.

5. **Verificação de Código Único (se alterado)**:
   - Se o código do tipo de contrato for alterado, o UpdateContractTypeUseCase verifica se já existe outro tipo de contrato com o mesmo código.
   - A verificação segue um fluxo similar ao passo 4 da criação, mas usando o método `findByCode`.

6. **Atualização da Entidade e Persistência**:
   - O UpdateContractTypeUseCase chama o método `update` da entidade ContractType, passando os novos dados.
   - A entidade ContractType atualiza suas propriedades e retorna a instância atualizada.
   - O UpdateContractTypeUseCase chama o método `update` do IContractTypeRepository para persistir as alterações.
   - A implementação MongooseContractTypeRepository atualiza o documento no MongoDB.
   - O resultado é retornado através das camadas até o Administrador.

### Fluxo de Desativação de Tipo de Contrato

1. **Administrador → ContractTypeController**:
   - O Administrador envia uma requisição HTTP PUT para o endpoint `/contract-types/{id}/deactivate`.

2. **ContractTypeController → DeactivateContractTypeUseCase**:
   - O ContractTypeController chama o método `execute` do DeactivateContractTypeUseCase, passando o ID do tipo de contrato.

3. **Busca do Tipo de Contrato Existente**:
   - O DeactivateContractTypeUseCase busca o tipo de contrato existente pelo ID através do método `findById` do IContractTypeRepository.
   - A implementação MongooseContractTypeRepository executa uma consulta no MongoDB.
   - O MongoDB retorna o documento encontrado.
   - O MongooseContractTypeRepository converte o documento em uma instância da entidade ContractType.

4. **Verificação de Uso em Anúncios**:
   - O DeactivateContractTypeUseCase verifica se o tipo de contrato está em uso em anúncios ativos através do método `countByContractTypeId` do IAdvertisementRepository.
   - O IAdvertisementRepository retorna o número de anúncios que utilizam o tipo de contrato.

5. **Confirmação Adicional (se necessário)**:
   - Se o tipo de contrato estiver em uso, o DeactivateContractTypeUseCase solicita confirmação adicional do Administrador.
   - O Administrador confirma a desativação.

6. **Desativação da Entidade e Persistência**:
   - O DeactivateContractTypeUseCase chama o método `deactivate` da entidade ContractType.
   - A entidade ContractType atualiza seu estado para inativo e retorna a instância atualizada.
   - O DeactivateContractTypeUseCase chama o método `update` do IContractTypeRepository para persistir a desativação.
   - A implementação MongooseContractTypeRepository atualiza o documento no MongoDB.
   - O resultado é retornado através das camadas até o Administrador.

## Fluxos Alternativos

### FA1. Nome de Tipo de Contrato Já Existe (Criação)

Se durante a verificação de unicidade do nome na criação de um tipo de contrato, for encontrado um tipo de contrato com o mesmo nome:
1. O MongoDB retorna o documento existente.
2. O MongooseContractTypeRepository converte o documento em uma instância da entidade ContractType.
3. O CreateContractTypeUseCase lança um erro informando que o nome já está em uso.
4. O ContractTypeController captura o erro e retorna um HTTP 409 Conflict para o Administrador.

### FA2. Código de Tipo de Contrato Já Existe (Criação)

Se durante a verificação de unicidade do código na criação de um tipo de contrato, for encontrado um tipo de contrato com o mesmo código:
1. O MongoDB retorna o documento existente.
2. O MongooseContractTypeRepository converte o documento em uma instância da entidade ContractType.
3. O CreateContractTypeUseCase lança um erro informando que o código já está em uso.
4. O ContractTypeController captura o erro e retorna um HTTP 409 Conflict para o Administrador.

### FA3. Nome de Tipo de Contrato Já Existe (Atualização)

Se durante a verificação de unicidade do nome na atualização de um tipo de contrato, for encontrado outro tipo de contrato com o mesmo nome:
1. O MongoDB retorna o documento existente.
2. O MongooseContractTypeRepository converte o documento em uma instância da entidade ContractType.
3. O UpdateContractTypeUseCase lança um erro informando que o nome já está em uso.
4. O ContractTypeController captura o erro e retorna um HTTP 409 Conflict para o Administrador.

### FA4. Código de Tipo de Contrato Já Existe (Atualização)

Se durante a verificação de unicidade do código na atualização de um tipo de contrato, for encontrado outro tipo de contrato com o mesmo código:
1. O MongoDB retorna o documento existente.
2. O MongooseContractTypeRepository converte o documento em uma instância da entidade ContractType.
3. O UpdateContractTypeUseCase lança um erro informando que o código já está em uso.
4. O ContractTypeController captura o erro e retorna um HTTP 409 Conflict para o Administrador.

### FA5. Tipo de Contrato Não Encontrado

Se durante a busca de um tipo de contrato pelo ID, não for encontrado nenhum tipo de contrato:
1. O MongoDB retorna null.
2. O MongooseContractTypeRepository repassa o null para o IContractTypeRepository.
3. O caso de uso (UpdateContractTypeUseCase ou DeactivateContractTypeUseCase) lança um erro informando que o tipo de contrato não foi encontrado.
4. O ContractTypeController captura o erro e retorna um HTTP 404 Not Found para o Administrador.

## Observações

- O diagrama segue os princípios de Clean Architecture, com fluxo de controle passando pelas camadas de interface, aplicação, domínio e infraestrutura.
- A injeção de dependências é utilizada para garantir o baixo acoplamento entre os componentes.
- As interfaces são utilizadas para definir contratos entre as camadas, permitindo a substituição de implementações concretas sem afetar o restante do sistema.
- A entidade de domínio ContractType encapsula o comportamento relacionado aos tipos de contrato, como atualização e desativação.
- A verificação de tipos de contrato em uso é realizada antes da desativação para alertar sobre possíveis impactos.
- A verificação de unicidade é realizada tanto para o nome quanto para o código do tipo de contrato, garantindo que ambos sejam únicos no sistema.
