# Diagrama de Sequência: Atualização de Planos

## Descrição
Este diagrama descreve a sequência de interações entre os componentes do sistema durante o processo de atualização de um plano existente, seguindo os princípios de Clean Architecture e Domain-Driven Design.

## Diagrama

```
+---------------+    +---------------+    +------------------+    +---------------+    +------------------+    +---------------+
|               |    |               |    |                  |    |               |    |                  |    |               |
| Cliente/Admin |    | PlanController|    | UpdatePlanUseCase|    |  Plan Entity  |    |IPlanRepository   |    |MongoosePlanRepo|
|               |    |               |    |                  |    |               |    |                  |    |               |
+-------+-------+    +-------+-------+    +--------+---------+    +-------+-------+    +--------+---------+    +-------+-------+
        |                    |                     |                      |                     |                      |
        | PUT /plans/{id}    |                     |                      |                     |                      |
        +------------------->|                     |                      |                     |                      |
        |                    |                     |                      |                     |                      |
        |                    | Valida UpdatePlanDto|                      |                     |                      |
        |                    |---+                 |                      |                     |                      |
        |                    |   |                 |                      |                     |                      |
        |                    |<--+                 |                      |                     |                      |
        |                    |                     |                      |                     |                      |
        |                    | execute(id, command)|                      |                     |                      |
        |                    +-------------------->|                      |                     |                      |
        |                    |                     |                      |                     |                      |
        |                    |                     | findById(id)         |                     |                      |
        |                    |                     +--------------------------------------------->                      |
        |                    |                     |                      |                     | findById(id)         |
        |                    |                     |                      |                     +--------------------->|
        |                    |                     |                      |                     |                      |
        |                    |                     |                      |                     |                      | Busca no MongoDB
        |                    |                     |                      |                     |                      |----+
        |                    |                     |                      |                     |                      |    |
        |                    |                     |                      |                     |                      |<---+
        |                    |                     |                      |                     |                      |
        |                    |                     |                      |                     | retorna plano        |
        |                    |                     |                      |                     |<---------------------+
        |                    |                     |                      |                     |                      |
        |                    |                     | retorna plano        |                     |                      |
        |                    |                     |<---------------------------------------------+                      |
        |                    |                     |                      |                     |                      |
        |                    |                     | atualiza propriedades|                     |                      |
        |                    |                     |--------------------->|                     |                      |
        |                    |                     |                      |                     |                      |
        |                    |                     |                      | retorna instância   |                      |
        |                    |                     |<---------------------+                     |                      |
        |                    |                     |                      |                     |                      |
        |                    |                     | update(plan)         |                     |                      |
        |                    |                     +--------------------------------------------->                      |
        |                    |                     |                      |                     | update(plan)         |
        |                    |                     |                      |                     +--------------------->|
        |                    |                     |                      |                     |                      |
        |                    |                     |                      |                     |                      | Atualiza no MongoDB
        |                    |                     |                      |                     |                      |----+
        |                    |                     |                      |                     |                      |    |
        |                    |                     |                      |                     |                      |<---+
        |                    |                     |                      |                     |                      |
        |                    |                     |                      |                     | retorna plano atualizado|
        |                    |                     |                      |                     |<---------------------+
        |                    |                     |                      |                     |                      |
        |                    |                     | retorna plano atualizado|                  |                      |
        |                    |                     |<---------------------------------------------+                      |
        |                    |                     |                      |                     |                      |
        |                    | retorna plano atualizado|                  |                     |                      |
        |                    |<--------------------+                      |                     |                      |
        |                    |                     |                      |                     |                      |
        | resposta HTTP 200  |                     |                      |                     |                      |
        |<-------------------+                     |                      |                     |                      |
        |                    |                     |                      |                     |                      |
```

## Descrição do Fluxo

1. **Cliente/Admin → PlanController**:
   - O Cliente/Admin envia uma requisição HTTP PUT para o endpoint `/plans/{id}` com os dados atualizados do plano.

2. **PlanController (Validação)**:
   - O PlanController recebe a requisição e valida os dados recebidos usando o UpdatePlanDto.
   - Verifica se todos os campos obrigatórios estão presentes e se os valores são válidos.

3. **PlanController → UpdatePlanUseCase**:
   - Após validar os dados, o PlanController chama o método `execute` do UpdatePlanUseCase, passando o ID do plano e os dados validados como comando.

4. **UpdatePlanUseCase → IPlanRepository**:
   - O UpdatePlanUseCase chama o método `findById` da interface IPlanRepository para buscar o plano existente.

5. **IPlanRepository → MongoosePlanRepository**:
   - A implementação concreta MongoosePlanRepository recebe a chamada para buscar o plano.
   - Busca o plano no MongoDB usando o ID fornecido.

6. **MongoosePlanRepository → IPlanRepository → UpdatePlanUseCase**:
   - O MongoosePlanRepository retorna o plano encontrado (ou null se não existir).
   - A interface IPlanRepository repassa o plano para o UpdatePlanUseCase.

7. **UpdatePlanUseCase → Plan Entity**:
   - Se o plano for encontrado, o UpdatePlanUseCase atualiza as propriedades da entidade Plan com os novos valores.

8. **Plan Entity → UpdatePlanUseCase**:
   - A entidade Plan atualizada é retornada ao UpdatePlanUseCase.

9. **UpdatePlanUseCase → IPlanRepository**:
   - O UpdatePlanUseCase chama o método `update` da interface IPlanRepository, passando a instância atualizada da entidade Plan.

10. **IPlanRepository → MongoosePlanRepository**:
    - A implementação concreta MongoosePlanRepository recebe a chamada para atualizar o plano.
    - Atualiza os dados no MongoDB.

11. **MongoosePlanRepository → IPlanRepository → UpdatePlanUseCase**:
    - Após atualizar com sucesso, o MongoosePlanRepository retorna o plano atualizado.
    - A interface IPlanRepository repassa o plano atualizado para o UpdatePlanUseCase.

12. **UpdatePlanUseCase → PlanController**:
    - O UpdatePlanUseCase retorna o plano atualizado para o PlanController.

13. **PlanController → Cliente/Admin**:
    - O PlanController formata a resposta e retorna um HTTP 200 OK com os dados do plano atualizado.

## Tratamento de Erros

O diagrama representa o fluxo de sucesso. Em caso de erros, as seguintes situações podem ocorrer:

1. **Validação de Dados**:
   - Se os dados não passarem na validação, o PlanController retorna um HTTP 400 Bad Request com detalhes dos erros.

2. **Plano Não Encontrado**:
   - Se o plano com o ID fornecido não for encontrado, o UpdatePlanUseCase lança um erro que é convertido em HTTP 404 Not Found pelo PlanController.

3. **Conflito de Nome**:
   - Se o nome for alterado e já existir outro plano com o mesmo nome, o UpdatePlanUseCase verifica isso chamando `findByName` e lança um erro, que é convertido em HTTP 409 Conflict pelo PlanController.

4. **Erro de Banco de Dados**:
   - Se ocorrer um erro ao atualizar no MongoDB, o MongoosePlanRepository propaga o erro, que é tratado pelo UpdatePlanUseCase e convertido em HTTP 500 Internal Server Error pelo PlanController.

## Observações

- O diagrama segue os princípios de Clean Architecture, com fluxo de controle passando pelas camadas de interface, aplicação, domínio e infraestrutura.
- A injeção de dependências é utilizada para garantir o baixo acoplamento entre os componentes.
- As interfaces são utilizadas para definir contratos entre as camadas, permitindo a substituição de implementações concretas sem afetar o restante do sistema.
- A atualização de planos segue o padrão de primeiro buscar a entidade existente, depois atualizar suas propriedades e finalmente persistir as alterações.
