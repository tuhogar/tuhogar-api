# Requisitos Funcionais - tuhogar-api

## Visão Geral
O tuhogar-api é um sistema de back-end para gerenciamento de anúncios imobiliários, usuários, assinaturas e pagamentos. O sistema implementa uma arquitetura em camadas seguindo princípios de Clean Architecture com Domain-Driven Design.

## Módulos e Funcionalidades

### 1. Gerenciamento de Usuários
- Registro de novos usuários
- Autenticação de usuários (login)
- Atualização de dados de usuários
- Recuperação de senha
- Controle de níveis de acesso por perfis (ADMIN e padrão)

### 2. Gerenciamento de Contas
- Criação de contas associadas a usuários
- Atualização de informações da conta
- Consulta de dados da conta

### 3. Anúncios Imobiliários
- Criação de anúncios de imóveis
- Edição de anúncios
- Exclusão de anúncios
- Moderação de anúncios (aprovação/rejeição)
- Upload e gerenciamento de imagens para anúncios
- Controle de status dos anúncios (ativo, pendente aprovação, etc.)
- Transferência de anúncios entre contas
- Busca avançada de anúncios por diferentes critérios
- Busca de imóveis similares

### 4. Assinaturas e Pagamentos
- Integração com gateway de pagamento ePayco
- Criação de assinaturas para planos
- Processamento de pagamentos recorrentes
- Gerenciamento de status das assinaturas (ativa, cancelada, etc.)
- Recebimento e processamento de notificações de pagamento
- Atualização de planos de assinatura
- Cancelamento de assinaturas

### 5. Planos
- Consulta de planos disponíveis
- Gerenciamento de características e preços dos planos

### 6. Eventos de Imóveis (Advertisement Events)
- Registro de eventos relacionados a anúncios imobiliários
- Geração de relatório mensal de estatísticas por conta
  - Processamento automático no primeiro dia de cada mês
  - Agregação de dados de eventos do mês anterior
  - Armazenamento na collection account-advertisements-statistics
  - Estrutura do relatório incluindo:
    - Identificação da conta (accountId) e período (month: "YYYY-MM")
    - Total de anúncios (totalAdvertisements)
    - Total de visualizações (totalVisits) baseado no evento AD_VIEW
    - Cliques em telefone (phoneClicks) baseado no evento AD_PHONE_CLICK
    - Visualizações de catálogo digital (digitalCatalogViews) baseado no evento AD_PROFILE_CLICK
    - Cliques em informações de contato (contactInfoClicks) baseado no evento AD_CONTACT_CLICK
    - Top 5 anúncios mais visualizados (topViewedAdvertisements) baseado no evento AD_VIEW
    - Top 5 anúncios com maior interação (topInteractedAdvertisements) baseado na soma de AD_CONTACT_CLICK e AD_PHONE_CLICK
    - Segmentação de métricas por:
      - Tipo de transação (venda/aluguel)
      - Tipo de propriedade (casa/apartamento/terreno)
      - Combinação de tipo de propriedade e transação
  - Acesso restrito a usuários do tipo USER ou ADMIN da conta

### 7. Amenidades e Tipos de Contrato
- Gestão de amenidades disponíveis para cadastro em imóveis
- Gestão de tipos de contrato para imóveis

### 8. Integrações
- Integração com Firebase para autenticação
- Integração com ePayco para processamento de pagamentos
- Processamento de webhooks para notificações de pagamento

## Requisitos Não-Funcionais

### Segurança
- Autenticação via tokens JWT
- Autorização baseada em roles para acesso a endpoints

### Persistência
- Uso de MongoDB para armazenamento de dados
- Repositórios específicos para cada entidade

### Arquitetura
- API RESTful
- Implementação seguindo Clean Architecture
- Separação clara entre domínio, aplicação e infraestrutura
