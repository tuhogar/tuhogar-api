# Limitação de Anúncios por Plano

## Visão Geral

A funcionalidade de limitação de anúncios por plano permite definir um número máximo de anúncios que uma conta pode ter ativos simultaneamente, com base no plano de assinatura contratado. Esta limitação ajuda a diferenciar os planos oferecidos e incentiva a contratação de planos superiores para usuários que desejam publicar mais anúncios.

## Implementação

### 1. Modelo de Dados

#### Entidade Plan

A entidade `Plan` foi estendida para incluir a propriedade `maxAdvertisements`:

```typescript
export class Plan {
    id?: string;
    name: string;
    duration: number;
    items: string[];
    price: number;
    photo?: string;
    externalId: string;
    maxAdvertisements?: number; // Número máximo de anúncios permitidos
}
```

Esta propriedade é opcional e, quando não definida, indica que não há limite de anúncios para o plano.

### 2. Persistência

O schema Mongoose para `Plan` foi atualizado para incluir a nova propriedade:

```typescript
@Schema({ timestamps: true, collection: 'plans' })
export class Plan {
    // Outras propriedades...
    
    @Prop()
    maxAdvertisements: number;
}
```

O `MongoosePlanMapper` foi atualizado para mapear esta propriedade entre o modelo de domínio e o documento Mongoose.

### 3. Validação

A validação do limite de anúncios ocorre no caso de uso `CreateAdvertisementUseCase`, que:

1. Verifica se o usuário tem um plano associado
2. Obtém o valor de `maxAdvertisements` do token JWT do usuário
3. Conta o número de anúncios ativos ou aguardando aprovação da conta usando o método `countActiveOrWaitingByAccountId`
4. Compara a contagem atual com o limite do plano
5. Impede a criação de novos anúncios se o limite foi atingido, lançando o erro `invalid.advertisement.limit.reached.for.plan`

```typescript
// Verificar se o plano tem um limite de anúncios definido
if (authenticatedUser.maxAdvertisements !== undefined && authenticatedUser.maxAdvertisements !== null) {
    // Contar anúncios ativos ou aguardando aprovação da conta
    const currentAdvertisementsCount = await this.advertisementRepository.countActiveOrWaitingByAccountId(authenticatedUser.accountId);
    
    // Verificar se o limite foi atingido
    // Caso especial: quando maxAdvertisements é 0 e não há anúncios, permitir a criação de um anúncio
    if (!(authenticatedUser.maxAdvertisements === 0 && currentAdvertisementsCount === 0) && 
        currentAdvertisementsCount >= authenticatedUser.maxAdvertisements) {
        throw new Error('invalid.advertisement.limit.reached.for.plan');
    }
}
```

### 4. Propagação para o Frontend

O valor de `maxAdvertisements` é incluído nos claims do token JWT do usuário através do caso de uso `UpdateFirebaseUsersDataUseCase`, que:

1. Busca os usuários de uma conta
2. Para cada usuário, busca o plano associado para obter o valor de `maxAdvertisements`
3. Inclui este valor nos custom claims enviados ao Firebase Authentication

```typescript
await app.auth().setCustomUserClaims(user.uid, {
    userRole: user.userRole,
    planId: user.account.subscription.planId,
    maxAdvertisements: maxAdvertisements,
    // Outros claims...
});
```

O frontend pode acessar este valor a partir do token JWT para:
- Exibir o limite de anúncios para o usuário
- Desabilitar a opção de criar novos anúncios quando o limite for atingido
- Mostrar mensagens incentivando a atualização do plano

### 5. Casos Especiais

- **Planos sem limite**: Quando `maxAdvertisements` é `undefined` ou `null`, não há limite de anúncios.
- **Planos com limite zero**: Quando `maxAdvertisements` é `0`, o usuário não pode ter anúncios ativos, exceto no caso especial em que o usuário não tem nenhum anúncio (permitindo a criação de um único anúncio).
- **Usuário sem plano**: Se o usuário não tem um plano associado, não pode criar anúncios.

## Fluxo de Dados

1. O administrador define o valor de `maxAdvertisements` para cada plano no banco de dados.
2. Quando um usuário se autentica, o token JWT inclui o valor de `maxAdvertisements` do seu plano.
3. Ao tentar criar um novo anúncio, o backend verifica se o usuário atingiu o limite.
4. Se o limite foi atingido, o backend retorna um erro que o frontend pode tratar para exibir uma mensagem apropriada.

## Considerações de Segurança

A validação do limite de anúncios é realizada tanto no backend quanto no frontend:

- **Backend**: Garante que o limite seja respeitado, mesmo que o frontend seja contornado.
- **Frontend**: Melhora a experiência do usuário, evitando tentativas de criação que seriam rejeitadas.

A propriedade `maxAdvertisements` é propagada através do token JWT, garantindo que o usuário não possa manipular este valor.
