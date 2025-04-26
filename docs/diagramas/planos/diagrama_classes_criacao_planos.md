# Diagrama de Classes: Criação de Planos

## Descrição
Este diagrama descreve as classes envolvidas no processo de criação de planos no sistema tuhogar-api, seguindo os princípios de Clean Architecture e Domain-Driven Design.

## Diagrama

```
+---------------------+      +-------------------------+      +----------------------+
|                     |      |                         |      |                      |
|  PlanController     |      |  CreatePlanUseCase      |      |  IPlanRepository     |
|                     |      |                         |      |                      |
+---------------------+      +-------------------------+      +----------------------+
| - createPlanUseCase |      | - planRepository        |      | + create(plan)       |
+---------------------+      +-------------------------+      | + findByName(name)   |
| + create(dto)       |----->| + execute(command)      |----->| + findById(id)       |
+---------------------+      +-------------------------+      +----------------------+
         ^                             |                              ^
         |                             |                              |
         |                             v                              |
+---------------------+      +-------------------------+      +----------------------+
|                     |      |                         |      |                      |
|  CreatePlanDto      |      |  Plan                   |      |  MongoosePlanRepo    |
|                     |      |                         |      |                      |
+---------------------+      +-------------------------+      +----------------------+
| + name              |      | + id                    |      | - planModel          |
| + duration          |      | + name                  |      +----------------------+
| + items             |      | + duration              |      | + create(plan)       |
| + price             |      | + items                 |      | + findByName(name)   |
| + externalId        |      | + price                 |      | + findById(id)       |
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
  - `id`: Identificador único do plano (opcional para criação)
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

#### CreatePlanUseCase
- **Descrição**: Caso de uso responsável pela criação de novos planos.
- **Atributos**:
  - `planRepository`: Repositório de planos injetado via construtor
- **Métodos**:
  - `execute(command)`: Executa o caso de uso de criação de plano

#### IPlanRepository (Interface)
- **Descrição**: Interface que define os métodos necessários para persistência de planos.
- **Métodos**:
  - `create(plan)`: Cria um novo plano no repositório
  - `findByName(name)`: Busca um plano pelo nome
  - `findById(id)`: Busca um plano pelo ID

### Camada de Infraestrutura

#### MongoosePlanRepository
- **Descrição**: Implementação concreta do repositório de planos usando Mongoose/MongoDB.
- **Atributos**:
  - `planModel`: Modelo Mongoose para a entidade Plan
- **Métodos**:
  - `create(plan)`: Implementa a criação de um plano no MongoDB
  - `findByName(name)`: Implementa a busca de um plano pelo nome
  - `findById(id)`: Implementa a busca de um plano pelo ID

### Camada de Interface

#### PlanController
- **Descrição**: Controlador HTTP que expõe endpoints para gerenciamento de planos.
- **Atributos**:
  - `createPlanUseCase`: Caso de uso de criação de plano injetado via construtor
- **Métodos**:
  - `create(dto)`: Endpoint HTTP para criação de planos

#### CreatePlanDto
- **Descrição**: Objeto de transferência de dados para criação de planos.
- **Atributos**:
  - `name`: Nome do plano
  - `duration`: Duração do plano em dias
  - `items`: Lista de itens/benefícios incluídos no plano
  - `price`: Preço do plano
  - `externalId`: Identificador externo para integração com gateway de pagamento
  - `maxAdvertisements`: Número máximo de anúncios permitidos (opcional)
  - `maxPhotos`: Número máximo de fotos por anúncio permitidas (opcional)

## Fluxo de Criação de Plano

1. O cliente envia uma requisição HTTP POST com os dados do plano para o endpoint exposto pelo `PlanController`.
2. O `PlanController` valida os dados recebidos através do `CreatePlanDto`.
3. O `PlanController` chama o método `execute` do `CreatePlanUseCase` passando os dados validados.
4. O `CreatePlanUseCase` cria uma nova instância da entidade `Plan`.
5. O `CreatePlanUseCase` chama o método `create` do `IPlanRepository` para persistir o plano.
6. O `MongoosePlanRepository` implementa a persistência no MongoDB.
7. O resultado é retornado através das camadas até o cliente.

## Observações

- O diagrama segue os princípios de Clean Architecture, separando claramente as camadas de domínio, aplicação, infraestrutura e interface.
- A injeção de dependências é utilizada para garantir o baixo acoplamento entre os componentes.
- As interfaces são utilizadas para definir contratos entre as camadas, permitindo a substituição de implementações concretas sem afetar o restante do sistema.
