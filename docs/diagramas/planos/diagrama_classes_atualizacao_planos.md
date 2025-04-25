# Diagrama de Classes: Atualização de Planos

## Descrição
Este diagrama descreve as classes envolvidas no processo de atualização de planos no sistema tuhogar-api, seguindo os princípios de Clean Architecture e Domain-Driven Design.

## Diagrama

```
+---------------------+      +-------------------------+      +----------------------+
|                     |      |                         |      |                      |
|  PlanController     |      |  UpdatePlanUseCase      |      |  IPlanRepository     |
|                     |      |                         |      |                      |
+---------------------+      +-------------------------+      +----------------------+
| - updatePlanUseCase |      | - planRepository        |      | + findById(id)       |
+---------------------+      +-------------------------+      | + update(plan)       |
| + update(id, dto)   |----->| + execute(id, command)  |----->| + findByName(name)   |
+---------------------+      +-------------------------+      +----------------------+
         ^                             |                              ^
         |                             |                              |
         |                             v                              |
+---------------------+      +-------------------------+      +----------------------+
|                     |      |                         |      |                      |
|  UpdatePlanDto      |      |  Plan                   |      |  MongoosePlanRepo    |
|                     |      |                         |      |                      |
+---------------------+      +-------------------------+      +----------------------+
| + name              |      | + id                    |      | - planModel          |
| + duration          |      | + name                  |      +----------------------+
| + items             |      | + duration              |      | + findById(id)       |
| + price             |      | + items                 |      | + update(plan)       |
| + externalId        |      | + price                 |      | + findByName(name)   |
| + maxAdvertisements |      | + externalId            |      +----------------------+
| + maxPhotos         |      | + maxAdvertisements     |
+---------------------+      | + maxPhotos             |
                             +-------------------------+
                             | + constructor(props)    |
                             +-------------------------+
```

## Descrição das Classes

### Camada de Domínio

#### Plan
- **Descrição**: Entidade de domínio que representa um plano no sistema.
- **Atributos**:
  - `id`: Identificador único do plano
  - `name`: Nome do plano
  - `duration`: Duração do plano em dias
  - `items`: Lista de itens/benefícios incluídos no plano
  - `price`: Preço do plano
  - `externalId`: Identificador externo para integração com gateway de pagamento
  - `maxAdvertisements`: Número máximo de anúncios permitidos (opcional)
  - `maxPhotos`: Número máximo de fotos por anúncio permitidas (opcional)
- **Métodos**:
  - `constructor(props)`: Inicializa uma nova instância de Plan

### Camada de Aplicação

#### UpdatePlanUseCase
- **Descrição**: Caso de uso responsável pela atualização de planos existentes.
- **Atributos**:
  - `planRepository`: Repositório de planos injetado via construtor
- **Métodos**:
  - `execute(id, command)`: Executa o caso de uso de atualização de plano

#### IPlanRepository (Interface)
- **Descrição**: Interface que define os métodos necessários para persistência de planos.
- **Métodos**:
  - `findById(id)`: Busca um plano pelo ID
  - `update(plan)`: Atualiza um plano existente no repositório
  - `findByName(name)`: Busca um plano pelo nome (para verificar unicidade)

### Camada de Infraestrutura

#### MongoosePlanRepository
- **Descrição**: Implementação concreta do repositório de planos usando Mongoose/MongoDB.
- **Atributos**:
  - `planModel`: Modelo Mongoose para a entidade Plan
- **Métodos**:
  - `findById(id)`: Implementa a busca de um plano pelo ID
  - `update(plan)`: Implementa a atualização de um plano no MongoDB
  - `findByName(name)`: Implementa a busca de um plano pelo nome

### Camada de Interface

#### PlanController
- **Descrição**: Controlador HTTP que expõe endpoints para gerenciamento de planos.
- **Atributos**:
  - `updatePlanUseCase`: Caso de uso de atualização de plano injetado via construtor
- **Métodos**:
  - `update(id, dto)`: Endpoint HTTP para atualização de planos

#### UpdatePlanDto
- **Descrição**: Objeto de transferência de dados para atualização de planos.
- **Atributos**:
  - `name`: Nome do plano
  - `duration`: Duração do plano em dias
  - `items`: Lista de itens/benefícios incluídos no plano
  - `price`: Preço do plano
  - `externalId`: Identificador externo para integração com gateway de pagamento
  - `maxAdvertisements`: Número máximo de anúncios permitidos (opcional)
  - `maxPhotos`: Número máximo de fotos por anúncio permitidas (opcional)

## Fluxo de Atualização de Plano

1. O cliente envia uma requisição HTTP PUT com os dados atualizados do plano para o endpoint exposto pelo `PlanController`.
2. O `PlanController` valida os dados recebidos através do `UpdatePlanDto`.
3. O `PlanController` chama o método `execute` do `UpdatePlanUseCase` passando o ID do plano e os dados validados.
4. O `UpdatePlanUseCase` busca o plano existente pelo ID através do `IPlanRepository`.
5. Se o plano for encontrado, o `UpdatePlanUseCase` atualiza os atributos do plano com os novos valores.
6. O `UpdatePlanUseCase` chama o método `update` do `IPlanRepository` para persistir as alterações.
7. O `MongoosePlanRepository` implementa a atualização no MongoDB.
8. O resultado é retornado através das camadas até o cliente.

## Observações

- O diagrama segue os princípios de Clean Architecture, separando claramente as camadas de domínio, aplicação, infraestrutura e interface.
- A injeção de dependências é utilizada para garantir o baixo acoplamento entre os componentes.
- As interfaces são utilizadas para definir contratos entre as camadas, permitindo a substituição de implementações concretas sem afetar o restante do sistema.
- Antes de atualizar um plano com um novo nome ou externalId, o sistema verifica se já existe outro plano com o mesmo valor para garantir a unicidade.
