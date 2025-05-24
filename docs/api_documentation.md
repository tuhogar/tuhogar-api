# Documentação da API TuHogar

## Visão Geral

Esta documentação descreve os endpoints da API relacionados ao gerenciamento de assinaturas e anúncios no sistema TuHogar, com foco especial nos processos de cancelamento de assinatura e ajuste automático de anúncios.

## Base URL

```
https://api.tuhogar.com/v1
```

## Autenticação

Todos os endpoints requerem autenticação via token JWT no cabeçalho da requisição:

```
Authorization: Bearer {token}
```

## Endpoints

### Assinaturas

#### Cancelar Assinatura

```
POST /subscriptions/{id}/cancel
```

Cancela uma assinatura no gateway de pagamento. A assinatura permanecerá ativa por 30 dias após o cancelamento, quando então será efetivamente cancelada e substituída por uma assinatura gratuita.

**Parâmetros de URL:**
- `id` (string, obrigatório): ID da assinatura a ser cancelada

**Corpo da Requisição:**
Nenhum

**Resposta de Sucesso:**
- Código: 200 OK
- Conteúdo:
```json
{
  "message": "Assinatura cancelada com sucesso",
  "effectiveCancellationDate": "2025-05-28T15:45:43-03:00"
}
```

**Respostas de Erro:**
- Código: 404 Not Found
  ```json
  {
    "message": "Assinatura não encontrada",
    "error": "notfound.subscription.do.not.exists"
  }
  ```

- Código: 400 Bad Request
  ```json
  {
    "message": "Falha ao cancelar assinatura no gateway de pagamento",
    "error": "error.subscription.cancel.on.payment.gateway.failed"
  }
  ```

#### Obter Assinatura Atual

```
GET /subscriptions/current
```

Retorna a assinatura atual (mais recente) do usuário autenticado. Este endpoint está disponível para usuários com perfil ADMIN e USER.

**Parâmetros de URL:**
Nenhum

**Resposta de Sucesso:**
- Código: 200 OK
- Conteúdo:
```json
{
  "id": "subscription-123",
  "accountId": "account-123",
  "planId": "plan-123",
  "status": "ACTIVE",
  "externalId": "ext-subscription-123",
  "externalPayerReference": "ext-payer-123",
  "paymentDate": "2025-04-15T10:30:22-03:00",
  "createdAt": "2025-01-01T10:00:00-03:00",
  "updatedAt": "2025-04-28T15:45:43-03:00"
}
```

**Respostas de Erro:**
- Código: 404 Not Found
  ```json
  {
    "message": "Nenhuma assinatura encontrada para este usuário",
    "error": "notfound.subscription.do.not.exists"
  }
  ```

#### Obter Detalhes da Assinatura

```
GET /subscriptions/{id}
```

Retorna os detalhes de uma assinatura, incluindo seu status atual e data efetiva de cancelamento, se aplicável.

**Parâmetros de URL:**
- `id` (string, obrigatório): ID da assinatura

**Resposta de Sucesso:**
- Código: 200 OK
- Conteúdo:
```json
{
  "id": "subscription-123",
  "accountId": "account-123",
  "planId": "plan-123",
  "status": "CANCELLED_ON_PAYMENT_GATEWAY",
  "effectiveCancellationDate": "2025-05-28T15:45:43-03:00",
  "paymentDate": "2025-04-15T10:30:22-03:00",
  "createdAt": "2025-01-01T10:00:00-03:00",
  "updatedAt": "2025-04-28T15:45:43-03:00"
}
```

#### Obter Pagamentos da Assinatura

```
GET /subscriptions/{id}/payments
```

Retorna todos os pagamentos associados a uma assinatura.

**Parâmetros de URL:**
- `id` (string, obrigatório): ID da assinatura

**Resposta de Sucesso:**
- Código: 200 OK
- Conteúdo:
```json
[
  {
    "id": "payment-123",
    "subscriptionId": "subscription-123",
    "accountId": "account-123",
    "externalId": "ext-payment-123",
    "status": "APPROVED",
    "amount": 29.99,
    "currency": "USD",
    "description": "Pagamento mensal do plano Premium",
    "paymentDate": "2025-04-15T10:30:22-03:00",
    "createdAt": "2025-04-15T10:30:22-03:00",
    "updatedAt": "2025-04-15T10:30:22-03:00"
  }
]
```

#### Obter Histórico de Assinaturas

```
GET /subscriptions/history
```

Retorna o histórico completo de assinaturas do usuário autenticado, incluindo todos os pagamentos relacionados a cada assinatura. Este endpoint está disponível para usuários com perfil ADMIN e USER.

**Parâmetros de URL:**
Nenhum

**Resposta de Sucesso:**
- Código: 200 OK
- Conteúdo:
```json
[
  {
    "id": "subscription-123",
    "accountId": "account-123",
    "planId": "plan-123",
    "status": "ACTIVE",
    "externalId": "ext-subscription-123",
    "externalPayerReference": "ext-payer-123",
    "paymentDate": "2025-04-15T10:30:22-03:00",
    "createdAt": "2025-04-15T10:30:22-03:00",
    "updatedAt": "2025-04-15T10:30:22-03:00",
    "plan": {
      "id": "plan-123",
      "name": "Plano Premium",
      "price": 29.99,
      "freeTrialDays": 30,
      "maxAdvertisements": 10,
      "maxPhotos": 20
    },
    "payments": [
      {
        "id": "payment-123",
        "subscriptionId": "subscription-123",
        "accountId": "account-123",
        "externalId": "ext-payment-123",
        "type": "subscription",
        "method": "credit_card",
        "description": "Pagamento mensal - Plano Premium",
        "amount": 29.99,
        "currency": "COP",
        "status": "APPROVED",
        "paymentDate": "2025-04-15T10:30:22-03:00"
      },
      {
        "id": "payment-124",
        "subscriptionId": "subscription-123",
        "accountId": "account-123",
        "externalId": "ext-payment-124",
        "type": "subscription",
        "method": "credit_card",
        "description": "Pagamento mensal - Plano Premium",
        "amount": 29.99,
        "currency": "COP",
        "status": "APPROVED",
        "paymentDate": "2025-05-15T10:30:22-03:00"
      }
    ]
  },
  {
    "id": "subscription-122",
    "accountId": "account-123",
    "planId": "plan-122",
    "status": "CANCELLED",
    "externalId": "ext-subscription-122",
    "externalPayerReference": "ext-payer-123",
    "paymentDate": "2025-03-15T10:30:22-03:00",
    "createdAt": "2025-03-15T10:30:22-03:00",
    "updatedAt": "2025-04-10T10:30:22-03:00",
    "plan": {
      "id": "plan-122",
      "name": "Plano Básico",
      "price": 19.99,
      "freeTrialDays": 15,
      "maxAdvertisements": 5,
      "maxPhotos": 10
    },
    "payments": [
      {
        "id": "payment-122",
        "subscriptionId": "subscription-122",
        "accountId": "account-123",
        "externalId": "ext-payment-122",
        "type": "subscription",
        "method": "credit_card",
        "description": "Pagamento mensal - Plano Básico",
        "amount": 19.99,
        "currency": "COP",
        "status": "APPROVED",
        "paymentDate": "2025-03-15T10:30:22-03:00"
      }
    ]
  }
]
```

**Respostas de Erro:**
- Código: 404 Not Found
  ```json
  {
    "message": "Nenhum histórico de assinaturas encontrado para este usuário",
    "error": "notfound.subscription.history.do.not.exists"
  }
  ```

### Webhook de Notificação de Pagamento

```
POST {webhook_url}
```

Endpoint que recebe notificações do gateway de pagamento sobre pagamentos de assinaturas. O sistema processa estas notificações para atualizar o status dos pagamentos e das assinaturas, bem como registrar a data em que o pagamento foi processado pelo gateway.

**Corpo da Requisição:**
O corpo da requisição segue o formato definido pelo gateway de pagamento ePayco. O campo `x_transaction_date` é utilizado para extrair a data exata do pagamento.

**Resposta de Sucesso:**
- Código: 200 OK
- Conteúdo:
```json
{
  "message": "Notificação de pagamento processada com sucesso"
}
```

### Anúncios

#### Reativar Anúncio Pausado

```
POST /advertisements/{id}/reactivate
```

Tenta reativar um anúncio que foi pausado automaticamente pelo sistema. A reativação só será bem-sucedida se o anúncio estiver em conformidade com os limites do plano atual.

**Parâmetros de URL:**
- `id` (string, obrigatório): ID do anúncio a ser reativado

**Corpo da Requisição:**
Nenhum

**Resposta de Sucesso:**
- Código: 200 OK
- Conteúdo:
```json
{
  "message": "Anúncio reativado com sucesso",
  "advertisement": {
    "id": "advertisement-123",
    "status": "ACTIVE",
    // outros campos do anúncio
  }
}
```

**Respostas de Erro:**
- Código: 400 Bad Request
  ```json
  {
    "message": "Não foi possível reativar o anúncio devido ao excesso de fotos",
    "error": "invalid.advertisement.excess.photos",
    "maxPhotos": 5,
    "currentPhotos": 8
  }
  ```

- Código: 400 Bad Request
  ```json
  {
    "message": "Não foi possível reativar o anúncio devido ao limite de anúncios ativos",
    "error": "invalid.advertisement.limit.reached",
    "maxAdvertisements": 3,
    "currentActive": 3
  }
  ```

#### Listar Anúncios Pausados Automaticamente

```
GET /advertisements/paused-by-application
```

Retorna a lista de anúncios que foram pausados automaticamente pelo sistema devido a limitações do plano.

**Parâmetros de Query:**
- `page` (integer, opcional): Número da página, padrão: 1
- `limit` (integer, opcional): Número de itens por página, padrão: 10

**Resposta de Sucesso:**
- Código: 200 OK
- Conteúdo:
```json
{
  "items": [
    {
      "id": "advertisement-123",
      "status": "PAUSED_BY_APPLICATION",
      "pauseReason": "EXCESS_PHOTOS",
      "photos": 8,
      "maxPhotos": 5,
      // outros campos do anúncio
    },
    {
      "id": "advertisement-456",
      "status": "PAUSED_BY_APPLICATION",
      "pauseReason": "ADVERTISEMENT_LIMIT",
      // outros campos do anúncio
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

## Códigos de Status

- `200 OK`: Requisição bem-sucedida
- `400 Bad Request`: Erro de validação ou regra de negócio
- `401 Unauthorized`: Autenticação necessária
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Prefixos de Erro

Os erros retornados pela API seguem um padrão de prefixos que indica o tipo de erro:

- `notfound.`: Recurso não encontrado (convertido para 404)
- `invalid.`: Dados inválidos ou violação de regra de negócio (convertido para 400)
- `Unauthorized`: Problemas de autorização (convertido para 401)
- `error.`: Erros gerais do sistema

## Webhooks

A API também fornece webhooks para notificar sistemas externos sobre eventos relacionados a assinaturas:

### Webhook de Cancelamento de Assinatura

```
POST {webhook_url}
```

Payload enviado quando uma assinatura é efetivamente cancelada:

```json
{
  "event": "subscription.cancelled",
  "data": {
    "subscriptionId": "subscription-123",
    "accountId": "account-123",
    "cancelledAt": "2025-05-28T15:45:43-03:00",
    "newSubscriptionId": "subscription-456",
    "newPlanId": "free-plan-id"
  }
}
```

## Limites de Taxa

A API implementa limites de taxa para proteger contra uso abusivo:

- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

Exceder esses limites resultará em respostas com status 429 (Too Many Requests).
