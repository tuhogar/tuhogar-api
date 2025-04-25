# Diagrama de Sequência: Criação de Planos

## Descrição
Este diagrama descreve a sequência de interações entre os componentes do sistema durante o processo de criação de um novo plano, seguindo os princípios de Clean Architecture e Domain-Driven Design.

## Diagrama

```
+---------------+    +---------------+    +------------------+    +---------------+    +------------------+    +---------------+
|               |    |               |    |                  |    |               |    |                  |    |               |
| Cliente/Admin |    | PlanController|    | CreatePlanUseCase|    |  Plan Entity  |    |IPlanRepository   |    |MongoosePlanRepo|
|               |    |               |    |                  |    |               |    |                  |    |               |
+-------+-------+    +-------+-------+    +--------+---------+    +-------+-------+    +--------+---------+    +-------+-------+
        |                    |                     |                      |                     |                      |
        | POST /plans        |                     |                      |                     |                      |
        +------------------->|                     |                      |                     |                      |
        |                    |                     |                      |                     |                      |
        |                    | Valida CreatePlanDto|                      |                     |                      |
        |                    |---+                 |                      |                     |                      |
        |                    |   |                 |                      |                     |                      |
        |                    |<--+                 |                      |                     |                      |
        |                    |                     |                      |                     |                      |
        |                    | execute(command)    |                      |                     |                      |
        |                    +-------------------->|                      |                     |                      |
        |                    |                     |                      |                     |                      |
        |                    |                     | new Plan(props)      |                     |                      |
        |                    |                     +--------------------->|                     |                      |
        |                    |                     |                      |                     |                      |
        |                    |                     |                      | retorna instância   |                      |
        |                    |                     |<---------------------+                     |                      |
        |                    |                     |                      |                     |                      |
        |                    |                     | create(plan)         |                     |                      |
        |                    |                     +--------------------------------------------->                      |
        |                    |                     |                      |                     | create(plan)         |
        |                    |                     |                      |                     +--------------------->|
        |                    |                     |                      |                     |                      |
        |                    |                     |                      |                     |                      | Salva no MongoDB
        |                    |                     |                      |                     |                      |----+
        |                    |                     |                      |                     |                      |    |
        |                    |                     |                      |                     |                      |<---+
        |                    |                     |                      |                     |                      |
        |                    |                     |                      |                     | retorna plano criado |
        |                    |                     |                      |                     |<---------------------+
        |                    |                     |                      |                     |                      |
        |                    |                     | retorna plano criado |                     |                      |
        |                    |                     |<---------------------------------------------+                      |
        |                    |                     |                      |                     |                      |
        |                    | retorna plano criado|                      |                     |                      |
        |                    |<--------------------+                      |                     |                      |
        |                    |                     |                      |                     |                      |
        | resposta HTTP 201  |                     |                      |                     |                      |
        |<-------------------+                     |                      |                     |                      |
        |                    |                     |                      |                     |                      |
```

## Descrição do Fluxo

1. **Cliente/Admin → PlanController**:
   - O Cliente/Admin envia uma requisição HTTP POST para o endpoint `/plans` com os dados do novo plano.

2. **PlanController (Validação)**:
   - O PlanController recebe a requisição e valida os dados recebidos usando o CreatePlanDto.
   - Verifica se todos os campos obrigatórios estão presentes e se os valores são válidos.

3. **PlanController → CreatePlanUseCase**:
   - Após validar os dados, o PlanController chama o método `execute` do CreatePlanUseCase, passando os dados validados como comando.

4. **CreatePlanUseCase → Plan Entity**:
   - O CreatePlanUseCase cria uma nova instância da entidade Plan, passando os dados recebidos.

5. **Plan Entity → CreatePlanUseCase**:
   - A entidade Plan é inicializada e retornada ao CreatePlanUseCase.

6. **CreatePlanUseCase → IPlanRepository**:
   - O CreatePlanUseCase chama o método `create` da interface IPlanRepository, passando a instância da entidade Plan.

7. **IPlanRepository → MongoosePlanRepository**:
   - A implementação concreta MongoosePlanRepository recebe a chamada para criar o plano.

8. **MongoosePlanRepository (Persistência)**:
   - O MongoosePlanRepository converte a entidade Plan para o formato do modelo Mongoose.
   - Salva os dados no MongoDB.

9. **MongoosePlanRepository → IPlanRepository**:
   - Após salvar com sucesso, o MongoosePlanRepository retorna o plano criado (com ID gerado) para a interface IPlanRepository.

10. **IPlanRepository → CreatePlanUseCase**:
    - A interface IPlanRepository repassa o plano criado para o CreatePlanUseCase.

11. **CreatePlanUseCase → PlanController**:
    - O CreatePlanUseCase retorna o plano criado para o PlanController.

12. **PlanController → Cliente/Admin**:
    - O PlanController formata a resposta e retorna um HTTP 201 Created com os dados do plano criado.

## Tratamento de Erros

O diagrama representa o fluxo de sucesso. Em caso de erros, as seguintes situações podem ocorrer:

1. **Validação de Dados**:
   - Se os dados não passarem na validação, o PlanController retorna um HTTP 400 Bad Request com detalhes dos erros.

2. **Conflito de Nome**:
   - Se já existir um plano com o mesmo nome, o repositório detecta o conflito e o CreatePlanUseCase retorna um erro, que é convertido em HTTP 409 Conflict pelo PlanController.

3. **Erro de Banco de Dados**:
   - Se ocorrer um erro ao salvar no MongoDB, o MongoosePlanRepository propaga o erro, que é tratado pelo CreatePlanUseCase e convertido em HTTP 500 Internal Server Error pelo PlanController.

## Observações

- O diagrama segue os princípios de Clean Architecture, com fluxo de controle passando pelas camadas de interface, aplicação, domínio e infraestrutura.
- A injeção de dependências é utilizada para garantir o baixo acoplamento entre os componentes.
- As interfaces são utilizadas para definir contratos entre as camadas, permitindo a substituição de implementações concretas sem afetar o restante do sistema.
