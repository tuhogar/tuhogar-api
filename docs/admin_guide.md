# Guia para Administradores: Comportamento do Sistema

## Introdução

Este guia foi elaborado para administradores do sistema TuHogar, fornecendo informações detalhadas sobre o comportamento automático do sistema relacionado ao gerenciamento de assinaturas e anúncios. Compreender esses processos é essencial para oferecer suporte adequado aos usuários e monitorar o funcionamento correto do sistema.

## Ciclo de Vida das Assinaturas

### Visão Geral do Processo

O sistema gerencia automaticamente o ciclo de vida das assinaturas, especialmente durante o processo de cancelamento. É importante entender esse fluxo para auxiliar usuários que tenham dúvidas sobre o status de suas assinaturas.

### Estados de Assinatura

1. **CREATED**: Assinatura recém-criada, ainda não processada pelo gateway de pagamento
2. **PENDING**: Aguardando confirmação de pagamento
3. **ACTIVE**: Assinatura ativa e válida
4. **CANCELLED_ON_PAYMENT_GATEWAY**: Assinatura cancelada no gateway, mas ainda válida por 30 dias
5. **CANCELLED**: Assinatura efetivamente cancelada e não mais válida

### Processo de Cancelamento

Quando um usuário cancela sua assinatura:

1. A assinatura é cancelada no gateway de pagamento (ePayco)
2. O status é alterado para `CANCELLED_ON_PAYMENT_GATEWAY`
3. Uma data efetiva de cancelamento é definida (30 dias após o cancelamento)
4. Após esse período, um job agendado:
   - Altera o status para `CANCELLED`
   - Cria uma nova assinatura com o plano gratuito
   - Ativa essa nova assinatura
   - Atualiza o plano da conta
   - Atualiza os dados dos usuários no Firebase
   - Ajusta os anúncios conforme os limites do plano gratuito

### Pontos de Atenção para Suporte

- Usuários com assinaturas no estado `CANCELLED_ON_PAYMENT_GATEWAY` ainda têm acesso completo ao plano contratado
- A data efetiva de cancelamento pode ser visualizada no painel administrativo
- Se um usuário desejar reativar sua assinatura antes da data efetiva de cancelamento, a assinatura antiga deve ser cancelada manualmente e uma nova deve ser criada

## Ajuste Automático de Anúncios

### Visão Geral

O sistema ajusta automaticamente os anúncios quando ocorrem mudanças no plano de um usuário, garantindo que os limites do plano sejam respeitados.

### Regras de Ajuste

1. **Limitação de Fotos**:
   - Anúncios com mais fotos do que o permitido pelo plano são pausados automaticamente
   - O status é alterado para `PAUSED_BY_APPLICATION`
   - Para reativar, o usuário deve remover as fotos excedentes

2. **Limitação de Anúncios Ativos**:
   - Se o número de anúncios ativos exceder o limite do plano, os mais recentes são pausados
   - A ordem é determinada pela data de atualização (mais recentes primeiro)
   - O status é alterado para `PAUSED_BY_APPLICATION`

### Cenários Comuns de Suporte

#### 1. Usuário reclama que anúncios foram pausados

**Verificação**:
- Confirme se houve mudança recente de plano ou cancelamento de assinatura
- Verifique o número de fotos nos anúncios pausados
- Compare com os limites do plano atual

**Solução**:
- Explique ao usuário que o sistema pausou os anúncios para respeitar os limites do plano
- Oriente sobre como remover fotos excedentes ou fazer upgrade do plano

#### 2. Usuário não consegue reativar anúncios

**Verificação**:
- Verifique se o anúncio ainda excede o limite de fotos
- Confirme se o usuário já atingiu o limite de anúncios ativos

**Solução**:
- Oriente o usuário a remover fotos excedentes
- Sugira pausar outros anúncios para liberar espaço para os que deseja reativar
- Ofereça opções de upgrade de plano

## Monitoramento e Manutenção

### Jobs Agendados

O sistema possui jobs agendados que executam tarefas importantes:

1. **ProcessCancelledSubscriptionsUseCase**:
   - Executa a cada hora (`@Cron('0 * * * *')`)
   - Processa assinaturas canceladas com data efetiva de cancelamento vencida
   - Logs são gerados em cada execução

### Logs do Sistema

Os logs são essenciais para monitoramento e diagnóstico:

1. **Logs de Cancelamento**:
   - Formato: `Processando assinatura {id} da conta {accountId}`
   - Indica o processamento de uma assinatura cancelada

2. **Logs de Ajuste de Anúncios**:
   - Formato: `Ajuste automático de anúncios para accountId: {accountId}`
   - Detalha quantos anúncios foram pausados e por qual motivo

### Verificações Periódicas Recomendadas

1. **Diariamente**:
   - Verificar logs de erros do job `process-cancelled-subscriptions`
   - Confirmar que assinaturas vencidas estão sendo processadas corretamente

2. **Semanalmente**:
   - Analisar padrões de cancelamento de assinaturas
   - Verificar consistência entre status de assinaturas e dados no Firebase

3. **Mensalmente**:
   - Auditar assinaturas canceladas para garantir que foram migradas corretamente para o plano gratuito
   - Verificar se há anúncios pausados incorretamente

## Procedimentos de Contingência

### Falha no Job de Processamento de Assinaturas

Se o job `process-cancelled-subscriptions` falhar consistentemente:

1. Verificar logs de erro para identificar a causa
2. Corrigir o problema na origem
3. Executar manualmente o processamento de assinaturas pendentes:

```typescript
// Código para execução manual do processamento
await processCancelledSubscriptionsUseCase.execute();
```

### Inconsistência entre Assinaturas e Firebase

Se houver inconsistência entre o status das assinaturas e os dados no Firebase:

1. Identificar as contas afetadas
2. Executar manualmente a atualização dos dados no Firebase:

```typescript
// Código para atualização manual dos dados no Firebase
await updateFirebaseUsersDataUseCase.execute({ accountId });
```

### Anúncios Pausados Incorretamente

Se anúncios forem pausados incorretamente:

1. Verificar se houve mudança recente no plano da conta
2. Confirmar os limites atuais do plano
3. Reativar manualmente os anúncios se necessário:

```typescript
// Código para reativação manual de anúncios
await advertisementRepository.updateStatus(
  [advertisementId],
  accountId,
  AdvertisementStatus.ACTIVE,
  null,
  null
);
```

## Perguntas Frequentes de Suporte

### 1. Por que o usuário ainda tem acesso ao plano após cancelar?

**Resposta**: O sistema mantém o acesso por 30 dias após o cancelamento (período de carência). Após esse período, a assinatura é efetivamente cancelada e o usuário é migrado para o plano gratuito.

### 2. Por que alguns anúncios foram pausados automaticamente?

**Resposta**: Anúncios são pausados automaticamente quando:
- Excedem o limite de fotos do plano atual
- O número total de anúncios ativos excede o limite do plano

### 3. Como o usuário pode reativar anúncios pausados pelo sistema?

**Resposta**: Para reativar anúncios pausados:
- Se pausados por excesso de fotos: remover as fotos excedentes e solicitar reativação
- Se pausados por limite de anúncios: pausar outros anúncios ou fazer upgrade do plano

### 4. O que acontece com os anúncios quando uma assinatura é cancelada?

**Resposta**: Após o período de carência de 30 dias, o sistema:
1. Migra a conta para o plano gratuito
2. Ajusta os anúncios conforme os limites do plano gratuito
3. Pausa anúncios com excesso de fotos
4. Limita o número de anúncios ativos conforme o plano gratuito

## Relatórios Administrativos

### Relatório de Assinaturas Canceladas

Para gerar um relatório de assinaturas canceladas no último mês:

```sql
SELECT 
  s.id, 
  s.accountId, 
  s.planId, 
  s.status, 
  s.effectiveCancellationDate, 
  s.updatedAt
FROM 
  subscriptions s
WHERE 
  s.status = 'CANCELLED_ON_PAYMENT_GATEWAY' 
  OR (s.status = 'CANCELLED' AND s.updatedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY))
ORDER BY 
  s.updatedAt DESC;
```

### Relatório de Anúncios Pausados Automaticamente

Para gerar um relatório de anúncios pausados automaticamente:

```sql
SELECT 
  a.id, 
  a.accountId, 
  a.status, 
  a.updatedAt,
  COUNT(p.id) as photoCount
FROM 
  advertisements a
LEFT JOIN 
  photos p ON a.id = p.advertisementId
WHERE 
  a.status = 'PAUSED_BY_APPLICATION'
GROUP BY 
  a.id, a.accountId, a.status, a.updatedAt
ORDER BY 
  a.updatedAt DESC;
```

## Conclusão

Este guia fornece as informações necessárias para administradores entenderem e gerenciarem o comportamento automático do sistema TuHogar relacionado a assinaturas e anúncios. Para questões não abordadas neste documento, consulte a documentação técnica detalhada ou entre em contato com a equipe de desenvolvimento.
