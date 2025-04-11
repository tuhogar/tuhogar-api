# Diagrama de Sequência - Exclusão de Imagens da Conta

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Controller as AccountController
    participant UseCase as DeleteAccountImageUseCase
    participant AccRepo as AccountRepository
    participant CloudStorage as CloudStorageService
    participant DB as Banco de Dados
    participant Cloud as Serviço de Nuvem
    
    User->>Controller: DELETE /v1/accounts/{accountId}/images/{imageType}
    Controller->>Controller: Extrair AuthenticatedUser do contexto
    Controller->>UseCase: execute(authenticatedUser, accountId, imageType)
    
    %% Verificar autenticação
    alt Usuário não autenticado
        UseCase-->>Controller: Erro: Usuário não autenticado
        Controller-->>User: 401 Unauthorized (Não autenticado)
    else Usuário autenticado
        %% Buscar conta
        UseCase->>AccRepo: findOneById(accountId)
        AccRepo->>DB: Consultar conta por ID
        DB-->>AccRepo: Conta (ou null)
        AccRepo-->>UseCase: Conta (ou null)
        
        alt Conta não encontrada
            UseCase-->>Controller: Erro: Conta não encontrada
            Controller-->>User: 404 Not Found (Conta não encontrada)
        else Conta encontrada
            %% Verificar permissões
            alt Sem permissão (não é admin e não pertence à conta)
                UseCase-->>Controller: Erro: Sem permissão
                Controller-->>User: 403 Forbidden (Sem permissão)
            else Com permissão
                %% Verificar existência da imagem
                alt imageType === ImageType.LOGO
                    UseCase->>UseCase: Verificar se conta.logoUrl existe
                else imageType === ImageType.BANNER
                    UseCase->>UseCase: Verificar se conta.bannerUrl existe
                else imageType === ImageType.PROFILE
                    UseCase->>UseCase: Verificar se conta.profileImageUrl existe
                else imageType === ImageType.OTHER
                    UseCase->>UseCase: Verificar se conta.otherImageUrl existe
                end
                
                alt Imagem não existe
                    UseCase-->>Controller: Erro: Imagem não encontrada
                    Controller-->>User: 404 Not Found (Imagem não encontrada)
                else Imagem existe
                    %% Verificar se a imagem é obrigatória
                    alt Imagem obrigatória para o tipo de conta
                        UseCase-->>Controller: Erro: Imagem obrigatória
                        Controller-->>User: 400 Bad Request (Imagem obrigatória)
                    else Imagem não obrigatória
                        %% Obter URL da imagem
                        alt imageType === ImageType.LOGO
                            UseCase->>UseCase: imageUrl = conta.logoUrl
                        else imageType === ImageType.BANNER
                            UseCase->>UseCase: imageUrl = conta.bannerUrl
                        else imageType === ImageType.PROFILE
                            UseCase->>UseCase: imageUrl = conta.profileImageUrl
                        else imageType === ImageType.OTHER
                            UseCase->>UseCase: imageUrl = conta.otherImageUrl
                        end
                        
                        %% Extrair publicId da URL
                        UseCase->>CloudStorage: extractPublicIdFromUrl(imageUrl)
                        CloudStorage-->>UseCase: publicId
                        
                        %% Excluir imagem do armazenamento
                        UseCase->>CloudStorage: deleteFile(publicId)
                        CloudStorage->>Cloud: Excluir arquivo
                        Cloud-->>CloudStorage: Confirmação
                        CloudStorage-->>UseCase: Confirmação
                        
                        %% Atualizar referência na conta
                        alt imageType === ImageType.LOGO
                            UseCase->>AccRepo: update(accountId, { logoUrl: null })
                        else imageType === ImageType.BANNER
                            UseCase->>AccRepo: update(accountId, { bannerUrl: null })
                        else imageType === ImageType.PROFILE
                            UseCase->>AccRepo: update(accountId, { profileImageUrl: null })
                        else imageType === ImageType.OTHER
                            UseCase->>AccRepo: update(accountId, { otherImageUrl: null })
                        end
                        
                        AccRepo->>DB: Atualizar conta
                        DB-->>AccRepo: Conta atualizada
                        AccRepo-->>UseCase: Conta atualizada
                        
                        UseCase-->>Controller: Conta atualizada
                        Controller-->>User: 200 OK (Conta atualizada)
                    end
                end
            end
        end
    end
```

## Descrição do Diagrama de Sequência

Este diagrama ilustra o fluxo de interações durante o processo de exclusão de imagens de uma conta no sistema tuhogar-api, seguindo os princípios de Clean Architecture.

### Participantes
- **Usuário**: Pessoa que está utilizando o sistema
- **AccountController**: Componente que recebe e processa requisições HTTP
- **DeleteAccountImageUseCase**: Componente que orquestra a lógica de negócio para exclusão de imagens
- **AccountRepository**: Componente responsável pelo acesso aos dados de contas
- **CloudStorageService**: Componente responsável pelo armazenamento de arquivos em nuvem
- **Banco de Dados**: Sistema de armazenamento persistente
- **Serviço de Nuvem**: Serviço externo para armazenamento de arquivos

### Fluxo Principal
1. O usuário envia uma requisição DELETE para `/v1/accounts/{accountId}/images/{imageType}`
2. O controlador extrai o usuário autenticado do contexto da requisição
3. O controlador chama o caso de uso de exclusão de imagem
4. O caso de uso verifica se o usuário está autenticado
5. Se o usuário estiver autenticado:
   - Busca a conta pelo ID fornecido
   - Se a conta for encontrada:
     - Verifica se o usuário tem permissão para excluir imagens da conta
     - Se tiver permissão:
       - Verifica se a imagem do tipo especificado existe na conta
       - Se a imagem existir:
         - Verifica se a imagem é obrigatória para o tipo de conta
         - Se a imagem não for obrigatória:
           - Obtém a URL da imagem com base no tipo
           - Extrai o identificador público da imagem a partir da URL
           - Exclui a imagem do serviço de armazenamento em nuvem
           - Remove a referência da imagem na conta
           - Retorna a conta atualizada
6. O controlador responde à requisição com a conta atualizada ou uma mensagem de erro

### Cenários Alternativos
- **Usuário não autenticado**: O sistema retorna um erro 401 Unauthorized
- **Conta não encontrada**: O sistema retorna um erro 404 Not Found
- **Sem permissão**: O sistema retorna um erro 403 Forbidden
- **Imagem não encontrada**: O sistema retorna um erro 404 Not Found
- **Imagem obrigatória**: O sistema retorna um erro 400 Bad Request

### Regras de Permissão
- Um usuário comum só pode excluir imagens da conta à qual está vinculado
- Um administrador pode excluir imagens de qualquer conta

### Verificações de Imagem
- O sistema verifica se a imagem do tipo especificado existe na conta
- O sistema verifica se a imagem é obrigatória para o tipo de conta (por exemplo, uma imobiliária pode ser obrigada a ter um logo)

### Tipos de Imagem
- **LOGO**: Imagem de logotipo da conta
- **BANNER**: Imagem de banner para a conta
- **PROFILE**: Imagem de perfil da conta
- **OTHER**: Outros tipos de imagem relacionados à conta

### Considerações Técnicas
- O identificador público da imagem é extraído da URL armazenada na conta
- A exclusão da imagem no serviço de nuvem é realizada antes da atualização da referência na conta
- A referência da imagem na conta é definida como null após a exclusão
