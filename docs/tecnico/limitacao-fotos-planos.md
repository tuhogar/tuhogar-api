# Limitação de Fotos por Plano - Documentação Técnica

## Visão Geral

Este documento descreve a implementação da funcionalidade de limitação de fotos por plano no sistema tuhogar-api. Esta funcionalidade permite definir um número máximo de fotos (`maxPhotos`) que podem ser adicionadas a cada anúncio, com base no plano associado à conta do usuário.

## Arquitetura

A implementação segue os princípios de Clean Architecture e Domain-Driven Design (DDD) do projeto, com alterações nas seguintes camadas:

### 1. Camada de Domínio

- **Entidade Plan**: Adicionada a propriedade opcional `maxPhotos` para definir o limite de fotos por anúncio.
- **Entidade AuthenticatedUser**: Adicionada a propriedade opcional `maxPhotos` para transportar o limite via JWT.

### 2. Camada de Aplicação

- **ProcessImagesAdvertisementUseCase**: Modificado para validar o limite de fotos antes de processar o upload.
- **UpdateFirebaseUsersDataUseCase**: Atualizado para incluir `maxPhotos` nos custom claims do Firebase.

### 3. Camada de Infraestrutura

- **MongoosePlanMapper**: Atualizado para mapear a propriedade `maxPhotos` entre o domínio e a persistência.
- **AuthGuard**: Modificado para extrair a propriedade `maxPhotos` dos claims JWT.
- **MongooseAccountRepository**: Adicionado método `findOneByIdWithSubscription` para buscar conta com subscription preenchida.

## Fluxo de Validação

A validação do limite de fotos ocorre no `ProcessImagesAdvertisementUseCase` e segue dois caminhos diferentes dependendo do perfil do usuário:

### Para usuários normais (não MASTER)

1. O limite é obtido diretamente dos claims JWT via `authenticatedUser.maxPhotos`.
2. Se o limite estiver definido (não for null ou undefined):
   - O sistema verifica se a soma das fotos existentes e novas excede o limite.
   - Se exceder, lança o erro `invalid.photos.limit.reached.for.plan`.

### Para usuários MASTER

1. O sistema busca a conta associada ao anúncio usando `accountRepository.findOneByIdWithSubscription()`.
2. Se a conta existir e tiver uma subscription com planId:
   - O sistema busca o plano associado usando `planRepository.findOneById()`.
   - Se o plano existir e tiver `maxPhotos` definido, aplica a mesma validação de limite.

## Propagação do Limite

O limite de fotos é propagado através do sistema da seguinte forma:

1. O valor é armazenado na entidade `Plan` no banco de dados.
2. Quando um usuário se autentica, o `UpdateFirebaseUsersDataUseCase` inclui o valor de `maxPhotos` nos custom claims do Firebase.
3. O token JWT gerado pelo Firebase contém o valor de `maxPhotos`.
4. O `AuthGuard` extrai esse valor e o inclui no objeto `AuthenticatedUser`.
5. Os casos de uso podem acessar o limite via `authenticatedUser.maxPhotos`.

## Considerações Técnicas

- **Desempenho**: Para usuários normais, o limite é validado usando apenas os claims JWT, evitando consultas desnecessárias ao banco de dados.
- **Agregação MongoDB**: Para usuários MASTER, é utilizada uma agregação MongoDB para garantir que a propriedade `subscription` da conta esteja corretamente preenchida.
- **Tratamento de Erros**: Erros específicos são lançados para facilitar o tratamento no frontend e backend.
- **Compatibilidade**: A implementação mantém compatibilidade com o fluxo existente de `maxAdvertisements`.

## Testes

A funcionalidade é coberta por testes unitários abrangentes:

- Testes para a entidade `Plan` com a propriedade `maxPhotos`.
- Testes para o `MongoosePlanMapper` mapeando `maxPhotos`.
- Testes para o `ProcessImagesAdvertisementUseCase` validando o limite de fotos.

## Mensagens de Erro

- `invalid.photos.limit.reached.for.plan`: Lançado quando o limite de fotos é excedido.
- `notfound.account.do.not.exists`: Lançado quando a conta do anúncio não é encontrada (para usuários MASTER).

## Exemplos de Uso

### Validação de limite para usuário normal

```typescript
// No ProcessImagesAdvertisementUseCase
if (authenticatedUser.userRole !== UserRole.MASTER) {
  const maxPhotos = authenticatedUser.maxPhotos;
  
  if (maxPhotos !== undefined && maxPhotos !== null) {
    const currentPhotosCount = advertisement.photos ? advertisement.photos.length : 0;
    const newPhotosCount = uploadImagesAdvertisementDto.images.length;
    
    if (currentPhotosCount + newPhotosCount > maxPhotos) {
      throw new Error('invalid.photos.limit.reached.for.plan');
    }
  }
}
```

### Validação de limite para usuário MASTER

```typescript
// No ProcessImagesAdvertisementUseCase
if (authenticatedUser.userRole === UserRole.MASTER) {
  try {
    const account = await this.accountRepository.findOneByIdWithSubscription(advertisement.accountId);
    
    if (!account) {
      throw new Error('notfound.account.do.not.exists');
    }
    
    if (account.subscription?.planId) {
      const plan = await this.planRepository.findOneById(account.subscription.planId);
      const maxPhotos = plan?.maxPhotos;
      
      if (maxPhotos !== undefined && maxPhotos !== null) {
        const currentPhotosCount = advertisement.photos ? advertisement.photos.length : 0;
        const newPhotosCount = uploadImagesAdvertisementDto.images.length;
        
        if (currentPhotosCount + newPhotosCount > maxPhotos) {
          throw new Error('invalid.photos.limit.reached.for.plan');
        }
      }
    }
  } catch (error) {
    // Tratamento de erros
  }
}
```
