# Atualização Manual da Propriedade maxAdvertisements nos Planos Existentes

## Visão Geral

Este documento descreve o processo para atualizar manualmente a propriedade `maxAdvertisements` nos planos existentes no banco de dados MongoDB. Esta propriedade define o número máximo de anúncios que uma conta com determinado plano pode ter ativos simultaneamente.

## Pré-requisitos

- Acesso ao banco de dados MongoDB
- Conhecimento dos planos existentes e seus limites desejados
- Permissões de administrador para modificar a collection `plans`

## Processo de Atualização

### 1. Conexão ao MongoDB

Conecte-se ao banco de dados MongoDB usando o MongoDB Compass, mongo shell ou qualquer outra ferramenta de sua preferência.

```bash
# Exemplo usando mongo shell
mongo "mongodb+srv://<username>:<password>@<cluster-url>/<database>"
```

### 2. Verificação dos Planos Existentes

Liste todos os planos existentes para verificar seus IDs e valores atuais:

```javascript
db.plans.find({}, {name: 1, price: 1, duration: 1, maxAdvertisements: 1})
```

### 3. Atualização Individual de Planos

Para atualizar um plano específico, use o comando `updateOne` com o ID do plano:

```javascript
db.plans.updateOne(
  { _id: ObjectId("id-do-plano") },
  { $set: { maxAdvertisements: 10 } }
)
```

Substitua `"id-do-plano"` pelo ID real do plano e `10` pelo número máximo de anúncios desejado para esse plano.

### 4. Atualização em Lote

Para atualizar vários planos de uma vez, você pode usar o comando `updateMany`:

```javascript
// Exemplo: Definir limite de 5 anúncios para todos os planos básicos
db.plans.updateMany(
  { name: { $regex: /básico/i } },
  { $set: { maxAdvertisements: 5 } }
)

// Exemplo: Definir limite de 20 anúncios para todos os planos premium
db.plans.updateMany(
  { name: { $regex: /premium/i } },
  { $set: { maxAdvertisements: 20 } }
)

// Exemplo: Definir limite de 50 anúncios para todos os planos empresariais
db.plans.updateMany(
  { name: { $regex: /empresarial|business/i } },
  { $set: { maxAdvertisements: 50 } }
)
```

### 5. Verificação das Atualizações

Após as atualizações, verifique se os valores foram aplicados corretamente:

```javascript
db.plans.find({}, {name: 1, price: 1, duration: 1, maxAdvertisements: 1})
```

### 6. Propagação para os Usuários

Após atualizar os valores no banco de dados, é necessário propagar essas alterações para os tokens JWT dos usuários. Isso pode ser feito de duas maneiras:

#### 6.1. Atualização Automática

Os usuários receberão os novos valores de `maxAdvertisements` automaticamente quando:
- Fizerem login novamente (o token JWT será regenerado)
- O token JWT expirar e for renovado
- O caso de uso `UpdateFirebaseUsersDataUseCase` for executado (por exemplo, quando uma assinatura é ativada)

#### 6.2. Atualização Forçada

Para forçar a atualização imediata dos tokens JWT para todos os usuários de uma conta específica, você pode executar o seguinte comando no MongoDB shell para obter a lista de IDs de contas:

```javascript
db.accounts.find({}, {_id: 1})
```

Em seguida, para cada ID de conta, execute o endpoint de atualização de dados do Firebase ou o caso de uso diretamente:

```bash
# Exemplo usando curl para chamar o endpoint
curl -X POST https://api.tuhogar.com/admin/update-firebase-users-data \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"accountId": "<account-id>"}'
```

## Valores Recomendados

Recomendamos os seguintes valores para diferentes tipos de planos:

| Tipo de Plano | maxAdvertisements | Descrição |
|---------------|-------------------|-----------|
| Gratuito      | 1                 | Permite apenas um anúncio ativo |
| Básico        | 5                 | Adequado para usuários individuais |
| Intermediário | 15                | Adequado para pequenas imobiliárias |
| Premium       | 30                | Adequado para imobiliárias médias |
| Empresarial   | 100               | Adequado para grandes imobiliárias |
| Ilimitado     | null              | Sem limite de anúncios (deixe o campo null) |

## Considerações Importantes

- **Planos sem limite**: Para planos sem limite de anúncios, defina `maxAdvertisements` como `null` ou simplesmente não defina a propriedade.
- **Planos com limite zero**: Definir `maxAdvertisements` como `0` impedirá que os usuários criem novos anúncios, exceto no caso especial em que o usuário não tem nenhum anúncio (permitindo a criação de um único anúncio).
- **Alterações retroativas**: Alterar o valor de `maxAdvertisements` para um valor menor que o número atual de anúncios ativos de um usuário não excluirá automaticamente os anúncios excedentes. Os usuários poderão manter seus anúncios existentes, mas não poderão criar novos até que o número fique abaixo do limite.
- **Monitoramento**: Após a atualização, monitore o sistema para garantir que a limitação esteja funcionando conforme esperado e que não haja impacto negativo na experiência do usuário.

## Suporte

Em caso de dúvidas ou problemas durante o processo de atualização, entre em contato com a equipe de desenvolvimento pelo e-mail support@tuhogar.com.
