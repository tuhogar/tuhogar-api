# Atualização Manual da Propriedade maxPhotos nos Planos Existentes

## Visão Geral

Este documento descreve o processo para atualizar manualmente a propriedade `maxPhotos` nos planos existentes no banco de dados MongoDB. Esta propriedade define o número máximo de fotos que podem ser adicionadas a cada anúncio para contas com determinado plano.

## Pré-requisitos

- Acesso ao banco de dados MongoDB
- Conhecimento dos planos existentes e seus limites desejados de fotos
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
db.plans.find({}, {name: 1, price: 1, duration: 1, maxPhotos: 1, maxAdvertisements: 1})
```

### 3. Atualização Individual de Planos

Para atualizar um plano específico, use o comando `updateOne` com o ID do plano:

```javascript
db.plans.updateOne(
  { _id: ObjectId("id-do-plano") },
  { $set: { maxPhotos: 5 } }
)
```

Substitua `"id-do-plano"` pelo ID real do plano e `5` pelo número máximo de fotos desejado para esse plano.

### 4. Atualização em Lote

Para atualizar vários planos de uma vez, você pode usar o comando `updateMany`:

```javascript
// Exemplo: Definir limite de 3 fotos para todos os planos básicos
db.plans.updateMany(
  { name: { $regex: /básico/i } },
  { $set: { maxPhotos: 3 } }
)

// Exemplo: Definir limite de 5 fotos para todos os planos premium
db.plans.updateMany(
  { name: { $regex: /premium/i } },
  { $set: { maxPhotos: 5 } }
)

// Exemplo: Definir limite de 10 fotos para todos os planos empresariais
db.plans.updateMany(
  { name: { $regex: /empresarial|business/i } },
  { $set: { maxPhotos: 10 } }
)
```

### 5. Definir Valor Padrão para Todos os Planos

Se você deseja garantir que todos os planos tenham um valor padrão para `maxPhotos`:

```javascript
// Definir um valor padrão de 5 fotos para todos os planos que não têm maxPhotos definido
db.plans.updateMany(
  { maxPhotos: { $exists: false } },
  { $set: { maxPhotos: 5 } }
)
```

## Verificação

Após a atualização, verifique se os valores foram aplicados corretamente:

```javascript
db.plans.find({}, {name: 1, price: 1, maxPhotos: 1})
```

## Propagação das Alterações

Após atualizar os planos no banco de dados, as alterações serão propagadas da seguinte forma:

1. **Novos Usuários**: Receberão automaticamente o novo limite ao se registrarem.
2. **Usuários Existentes**: 
   - O limite será atualizado na próxima vez que fizerem login (através do token JWT).
   - Para forçar a atualização imediata, você pode executar o caso de uso `UpdateFirebaseUsersDataUseCase` manualmente.

## Considerações Importantes

- **Valor Zero**: Definir `maxPhotos` como `0` impedirá completamente o upload de fotos para anúncios.
- **Valor Undefined**: Se `maxPhotos` não estiver definido, não haverá limite para o número de fotos.
- **Impacto nos Usuários**: Alterar o limite para um valor menor do que o número atual de fotos em anúncios existentes não removerá as fotos, mas impedirá a adição de novas fotos até que o número fique abaixo do limite.
- **Usuários MASTER**: Usuários com perfil MASTER podem adicionar fotos a anúncios de outras contas, mas ainda estarão sujeitos ao limite do plano da conta do anúncio.

## Melhores Práticas

- **Comunicação**: Informe os usuários sobre alterações nos limites antes de implementá-las.
- **Gradualidade**: Considere implementar mudanças graduais para planos com muitos usuários.
- **Monitoramento**: Após a atualização, monitore o sistema para garantir que a limitação esteja funcionando conforme esperado e que não haja impacto negativo na experiência do usuário.

## Suporte

Em caso de dúvidas ou problemas durante o processo de atualização, entre em contato com a equipe de desenvolvimento pelo e-mail support@tuhogar.com.
