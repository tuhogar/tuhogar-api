# Ciclo de Vida de Assinaturas

## Visão Geral

Este documento detalha o ciclo de vida completo das assinaturas no sistema TuHogar, com foco especial no processo de cancelamento e suas implicações. O sistema foi projetado seguindo os princípios de Clean Architecture, com separação clara entre domínio, aplicação e infraestrutura.

## Estados de uma Assinatura

Uma assinatura pode estar em um dos seguintes estados:

1. **CREATED**: Estado inicial quando uma assinatura é criada no sistema
2. **PENDING**: Assinatura aguardando confirmação de pagamento
3. **ACTIVE**: Assinatura ativa e válida
4. **CANCELLED_ON_PAYMENT_GATEWAY**: Assinatura cancelada no gateway de pagamento, mas ainda válida até a data efetiva de cancelamento
5. **CANCELLED**: Assinatura efetivamente cancelada e não mais válida

## Propriedades Importantes

Além do status, as assinaturas possuem outras propriedades importantes:

- **paymentDate**: Data do último pagamento realizado para esta assinatura
- **effectiveCancellationDate**: Data em que a assinatura será efetivamente cancelada (quando em status CANCELLED_ON_PAYMENT_GATEWAY)

## Fluxo Completo do Ciclo de Vida

### 1. Criação da Assinatura

- Uma assinatura é criada com status `CREATED`
- Associada a uma conta e a um plano específico
- Pode ser criada através do gateway de pagamento ou internamente

### 2. Ativação da Assinatura

- Após confirmação de pagamento, a assinatura passa para status `ACTIVE`
- A data do pagamento (`paymentDate`) é registrada na assinatura
- Os dados dos usuários no Firebase são atualizados com as informações do plano
- O plano da conta é atualizado
- Os anúncios são ajustados conforme os limites do novo plano

### 3. Cancelamento no Gateway de Pagamento

Quando o usuário solicita o cancelamento da assinatura:

1. O cancelamento é processado no gateway de pagamento
2. A assinatura é marcada como `CANCELLED_ON_PAYMENT_GATEWAY`
3. Uma data efetiva de cancelamento é calculada:
   - Se a assinatura possui uma data de pagamento registrada (`paymentDate`), a data efetiva de cancelamento é definida como 1 dia após a data de pagamento (para fins de teste, será alterado para 30 dias em produção)
   - Se a assinatura não possui data de pagamento, a data efetiva de cancelamento é definida como a data atual (cancelamento imediato)
4. Os dados dos usuários no Firebase são atualizados para refletir o status de cancelamento
5. A assinatura continua válida até a data efetiva de cancelamento

### 4. Processamento de Assinaturas Canceladas

Um job agendado executa diariamente para processar assinaturas canceladas:

1. Busca assinaturas com status `CANCELLED_ON_PAYMENT_GATEWAY` e data efetiva de cancelamento vencida
2. Para cada assinatura encontrada:
   - Atualiza o status para `CANCELLED`
   - Cria uma nova assinatura interna com o plano gratuito
   - Ativa a nova assinatura
   - Atualiza o plano da conta para o plano gratuito
   - Atualiza os dados dos usuários no Firebase
   - Ajusta os anúncios conforme os limites do plano gratuito

## Implementação Técnica

### Entidade Subscription

A entidade `Subscription` contém todos os dados necessários para gerenciar o ciclo de vida:

```typescript
export class Subscription {
  id: string;
  accountId: string;
  planId: string;
  status: SubscriptionStatus;
  externalId?: string;
  effectiveCancellationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Casos de Uso Principais

#### CancelSubscriptionOnPaymentGatewayUseCase

Responsável por cancelar a assinatura no gateway de pagamento:

```typescript
async execute({ id, accountId }: CancelSubscriptionOnPaymentGatewayUseCaseCommand): Promise<void> {
  // Verificar se a assinatura existe e está ativa ou pendente
  // Cancelar a assinatura no gateway de pagamento
  // Definir a data efetiva de cancelamento (30 dias após o cancelamento)
  // Atualizar o status da assinatura para CANCELLED_ON_PAYMENT_GATEWAY
  // Atualizar os dados dos usuários no Firebase
}
```

#### ProcessCancelledSubscriptionsUseCase

Job agendado que processa assinaturas canceladas cuja data efetiva de cancelamento já foi atingida:

```typescript
@Cron('0 * * * *')
async executeScheduled(): Promise<void> {
  try {
    await this.execute();
  } catch (error) {
    // Tratamento de erro para não interromper outros jobs
  }
}

async execute(): Promise<void> {
  // Buscar assinaturas com status CANCELLED_ON_PAYMENT_GATEWAY e effectiveCancellationDate <= data atual
  // Para cada assinatura encontrada:
  //   - Atualizar status para CANCELLED
  //   - Criar nova assinatura com plano gratuito
  //   - Ativar a nova assinatura
  //   - Atualizar o plano da conta
  //   - Atualizar dados dos usuários no Firebase
}
```

### Repositórios

#### ISubscriptionRepository

Interface que define os métodos para manipulação de assinaturas:

```typescript
export interface ISubscriptionRepository {
  findOneById(id: string): Promise<Subscription>;
  cancelOnPaymentGateway(id: string, effectiveCancellationDate: Date): Promise<void>;
  findSubscriptionsToCancel(currentDate: Date): Promise<Subscription[]>;
  cancel(id: string): Promise<void>;
  active(id: string): Promise<void>;
  // Outros métodos...
}
```

## Exemplos de Cenários

### Cenário 1: Cancelamento Sem Data de Pagamento

**Fluxo**:
1. Usuário solicita cancelamento da assinatura Premium
2. Assinatura é cancelada no gateway de pagamento
3. Status é atualizado para `CANCELLED_ON_PAYMENT_GATEWAY`
4. Como não há data de pagamento registrada, a data efetiva de cancelamento é definida para a data atual
5. O job agendado processa a assinatura imediatamente:
   - Status é atualizado para `CANCELLED`
   - Nova assinatura com plano gratuito é criada e ativada
   - Anúncios são ajustados conforme limites do plano gratuito

### Cenário 2: Cancelamento Com Data de Pagamento

**Fluxo**:
1. Usuário solicita cancelamento da assinatura Premium
2. Assinatura é cancelada no gateway de pagamento
3. Status é atualizado para `CANCELLED_ON_PAYMENT_GATEWAY`
4. Como há data de pagamento registrada, a data efetiva de cancelamento é definida para 1 dia após a data de pagamento (será alterado para 30 dias em produção)
5. Após esse período, o job agendado processa a assinatura:
   - Status é atualizado para `CANCELLED`
   - Nova assinatura com plano gratuito é criada e ativada
   - Anúncios são ajustados conforme limites do plano gratuito

### Cenário 3: Cancelamento com Reativação

**Fluxo**:
1. Usuário solicita cancelamento da assinatura Premium
2. Assinatura é cancelada no gateway de pagamento
3. Status é atualizado para `CANCELLED_ON_PAYMENT_GATEWAY`
4. Antes da data efetiva de cancelamento, usuário decide reativar a assinatura
5. Nova assinatura é criada com o plano escolhido
6. A assinatura anterior com status `CANCELLED_ON_PAYMENT_GATEWAY` é marcada como `CANCELLED`

## Considerações de Desempenho e Segurança

### Desempenho

- O job agendado utiliza índices otimizados para buscar assinaturas a serem canceladas
- As operações são executadas em transações para garantir consistência
- Logs detalhados são gerados para monitoramento

### Segurança

- Apenas usuários autenticados podem cancelar suas próprias assinaturas
- Administradores podem cancelar assinaturas de qualquer usuário
- Todas as operações são registradas para auditoria

## Índices de Banco de Dados

Para otimizar as consultas, os seguintes índices são utilizados:

```javascript
// Índice para buscar assinaturas a serem canceladas
{ status: 1, effectiveCancellationDate: 1 }

// Índice para buscar assinaturas por conta
{ accountId: 1, status: 1 }
```

## Tratamento de Erros

O sistema foi projetado para ser resiliente a falhas:

1. **Falha no Gateway de Pagamento**: Se o cancelamento no gateway falhar, o processo é interrompido e um erro é retornado ao usuário
2. **Falha no Processamento Agendado**: Erros durante o processamento de uma assinatura não afetam o processamento das demais
3. **Falha na Atualização do Firebase**: Erros são registrados, mas não impedem o cancelamento efetivo da assinatura

## Logs e Monitoramento

O sistema gera logs detalhados para facilitar o monitoramento e diagnóstico:

- Início e conclusão do processamento de assinaturas canceladas
- Número de assinaturas encontradas para cancelamento
- Detalhes do processamento de cada assinatura
- Erros durante o processamento

## Rastreamento e Auditoria

O sistema mantém um registro completo das atividades relacionadas às assinaturas:

1. **Notificações**: Todas as notificações recebidas do gateway são armazenadas
2. **Pagamentos**: Histórico completo de pagamentos associados a cada assinatura, incluindo a data exata em que cada pagamento foi processado pelo gateway
3. **Alterações de status**: Registro de todas as mudanças de status com timestamps
4. **Datas de pagamento**: Registro da data do último pagamento realizado para cada assinatura

## Integração com Gateway de Pagamento

O sistema utiliza o gateway de pagamento ePayco para processar pagamentos e gerenciar assinaturas. A integração inclui:

1. **Criação de assinaturas**: Geração de links de pagamento e formulários para o cliente
2. **Recebimento de notificações**: Processamento de webhooks para atualização de status
3. **Cancelamento de assinaturas**: API para cancelamento no gateway
4. **Rastreamento de pagamentos**: Extração da data de pagamento do campo `x_transaction_date` retornado pelo gateway

## Evolução Futura

Possíveis melhorias para o sistema de gerenciamento de assinaturas:

1. Implementar notificações automáticas para usuários sobre o cancelamento iminente
2. Adicionar opção de cancelamento programado para data futura
3. Implementar sistema de retenção com ofertas especiais para usuários que solicitam cancelamento
4. Adicionar suporte a pausas temporárias de assinatura
