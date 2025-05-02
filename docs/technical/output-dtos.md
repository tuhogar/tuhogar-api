# DTOs de Saída (Output DTOs)

Este documento descreve o padrão de DTOs de saída implementado no projeto tuhogar-api, seguindo os princípios de Clean Architecture.

## Visão Geral

Os DTOs de saída (Output DTOs) são utilizados para formatar os dados retornados pela API, garantindo uma separação clara entre as entidades de domínio e a camada de apresentação. Eles permitem:

1. Controlar quais propriedades são expostas na API
2. Formatar os dados de acordo com as necessidades dos clientes
3. Documentar claramente o contrato da API
4. Evoluir as entidades de domínio sem afetar a API pública

## Estrutura de Diretórios

Os DTOs de saída seguem a seguinte estrutura de diretórios:

```
src/infraestructure/http/dtos/{módulo}/output/
└── {nome-do-endpoint}.output.dto.ts
└── mapper/
    └── {nome-do-endpoint}.output.dto.mapper.ts
    └── {nome-do-endpoint}.output.dto.mapper.spec.ts
```

## Convenções de Nomenclatura

- **Arquivos**: Utilizam o formato kebab-case com o sufixo `.output.dto.ts`
- **Classes**: Utilizam o formato PascalCase com o sufixo `OutputDto`
- **Mapeadores**: Utilizam o formato PascalCase com o sufixo `OutputDtoMapper`
- **Métodos de mapeamento**: Utilizam o nome `toOutputDto()`

## Exemplo Implementado

### GetCurrentSubscriptionOutputDto

Este DTO foi implementado para o endpoint `GET /v1/subscriptions/current` e retorna os dados da assinatura atual do usuário com informações sobre dias gratuitos restantes.

#### Propriedades

| Propriedade | Tipo | Descrição | Obrigatório |
|-------------|------|-----------|-------------|
| id | string | ID da assinatura | Sim |
| planId | string | ID do plano associado à assinatura | Sim |
| status | SubscriptionStatus | Status atual da assinatura | Sim |
| effectiveCancellationDate | Date | Data efetiva de cancelamento da assinatura | Não |
| paymentDate | Date | Data do último pagamento realizado | Não |
| nextPaymentDate | Date | Data prevista para o próximo pagamento | Não |
| createdAt | Date | Data de criação da assinatura | Não |
| remainingFreeDays | number | Número de dias gratuitos restantes na assinatura | Sim |

#### Mapeador

O mapeador `GetCurrentSubscriptionOutputDtoMapper` é responsável por converter a entidade de domínio `SubscriptionWithRemainingFreeDays` para o DTO de saída `GetCurrentSubscriptionOutputDto`.

```typescript
public static toOutputDto(subscription: SubscriptionWithRemainingFreeDays): GetCurrentSubscriptionOutputDto {
  return {
    id: subscription.id || null,
    planId: subscription.planId,
    status: subscription.status,
    effectiveCancellationDate: subscription.effectiveCancellationDate || null,
    paymentDate: subscription.paymentDate || null,
    nextPaymentDate: subscription.nextPaymentDate || null,
    createdAt: subscription.createdAt || null,
    remainingFreeDays: subscription.remainingFreeDays
  };
}
```

## Boas Práticas

1. **Propriedades Opcionais**: Sempre retornar `null` para propriedades opcionais não definidas, em vez de omiti-las
2. **Documentação Swagger**: Utilizar decoradores `@ApiProperty` com descrições detalhadas
3. **Validação**: Implementar testes unitários para garantir que o mapeador funciona corretamente
4. **Separação de Responsabilidades**: Manter o mapeador separado do controller
5. **Reutilização**: Implementar mapeadores como classes com métodos estáticos para facilitar a reutilização

## Benefícios

- **Separação clara entre domínio e apresentação**: Seguindo os princípios de Clean Architecture
- **Documentação melhorada**: Propriedades bem documentadas com Swagger
- **Consistência nas respostas**: Formato padronizado para todas as respostas da API
- **Flexibilidade para evolução**: Possibilidade de evoluir as entidades de domínio sem afetar a API pública
