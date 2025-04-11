# Diagrama de Classes - Processamento de Imagens da Conta

```mermaid
classDiagram
    %% Entidades de Domínio
    class Account {
        +string id
        +string name
        +AccountType type
        +string description
        +string phone
        +string email
        +string website
        +string logoUrl
        +string address
        +AccountStatus status
        +Date createdAt
        +Date updatedAt
        +constructor(props: Account)
    }
    
    class AccountType {
        <<enumeration>>
        REAL_ESTATE
        INDIVIDUAL_OWNER
        DEVELOPER
        OTHER
    }
    
    class AccountStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
        PENDING
        SUSPENDED
    }
    
    class User {
        +string id
        +string email
        +string name
        +string lastName
        +string phone
        +UserRole role
        +UserStatus status
        +string accountId
        +string firebaseId
        +Date createdAt
        +Date updatedAt
    }
    
    class AuthenticatedUser {
        +string id
        +string email
        +string name
        +UserRole role
        +string accountId
    }
    
    class ImageFile {
        +Buffer data
        +string originalname
        +string mimetype
        +number size
        +constructor(props: ImageFile)
    }
    
    class ImageType {
        <<enumeration>>
        LOGO
        BANNER
        PROFILE
        OTHER
    }
    
    class ProcessedImage {
        +string url
        +string publicId
        +number width
        +number height
        +number size
        +string format
        +constructor(props: ProcessedImage)
    }
    
    %% Interfaces
    class IAccountRepository {
        <<interface>>
        +findOneById(id: string) Promise~Account~
        +update(id: string, accountData: Partial~Account~) Promise~Account~
    }
    
    class IImageProcessingService {
        <<interface>>
        +validateImage(imageFile: ImageFile) Promise~boolean~
        +resizeImage(imageFile: ImageFile, width: number, height: number) Promise~Buffer~
        +optimizeImage(imageBuffer: Buffer, format: string) Promise~Buffer~
        +uploadImage(imageBuffer: Buffer, path: string, filename: string) Promise~ProcessedImage~
    }
    
    class ICloudStorageService {
        <<interface>>
        +uploadFile(buffer: Buffer, path: string, filename: string) Promise~{url: string, publicId: string}~
        +deleteFile(publicId: string) Promise~void~
    }
    
    %% Casos de Uso
    class ProcessAccountImageUseCase {
        -IAccountRepository accountRepository
        -IImageProcessingService imageProcessingService
        +constructor(dependencies: ...)
        +execute(authenticatedUser: AuthenticatedUser, accountId: string, imageFile: ImageFile, imageType: ImageType) Promise~Account~
    }
    
    %% Implementações
    class MongooseAccountRepository {
        -AccountModel accountModel
        +constructor(accountModel: Model)
        +findOneById(id: string) Promise~Account~
        +update(id: string, accountData: Partial~Account~) Promise~Account~
    }
    
    class SharpImageProcessingService {
        -ICloudStorageService cloudStorageService
        +constructor(cloudStorageService: ICloudStorageService)
        +validateImage(imageFile: ImageFile) Promise~boolean~
        +resizeImage(imageFile: ImageFile, width: number, height: number) Promise~Buffer~
        +optimizeImage(imageBuffer: Buffer, format: string) Promise~Buffer~
        +uploadImage(imageBuffer: Buffer, path: string, filename: string) Promise~ProcessedImage~
    }
    
    class CloudinaryStorageService {
        -CloudinaryClient cloudinaryClient
        +constructor(cloudinaryClient: CloudinaryClient)
        +uploadFile(buffer: Buffer, path: string, filename: string) Promise~{url: string, publicId: string}~
        +deleteFile(publicId: string) Promise~void~
    }
    
    class AccountController {
        -ProcessAccountImageUseCase processAccountImageUseCase
        +constructor(processAccountImageUseCase: ProcessAccountImageUseCase)
        +uploadImage(authenticatedUser: AuthenticatedUser, accountId: string, imageFile: ImageFile, imageType: ImageType) Promise~Account~
    }
    
    %% Relações
    Account "1" -- "1" AccountType : tem >
    Account "1" -- "1" AccountStatus : tem >
    User "*" -- "1" Account : pertence a >
    
    IAccountRepository <|.. MongooseAccountRepository : implementa
    IImageProcessingService <|.. SharpImageProcessingService : implementa
    ICloudStorageService <|.. CloudinaryStorageService : implementa
    
    ProcessAccountImageUseCase --> IAccountRepository : usa >
    ProcessAccountImageUseCase --> IImageProcessingService : usa >
    
    SharpImageProcessingService --> ICloudStorageService : usa >
    
    AccountController --> ProcessAccountImageUseCase : usa >
    
    ProcessAccountImageUseCase ..> AuthenticatedUser : usa >
    ProcessAccountImageUseCase ..> ImageFile : processa >
    ProcessAccountImageUseCase ..> ImageType : usa >
    ProcessAccountImageUseCase ..> Account : atualiza >
    
    SharpImageProcessingService ..> ProcessedImage : retorna >
```

## Descrição do Diagrama de Classes

Este diagrama representa a estrutura de classes envolvidas no processo de processamento de imagens de uma conta no sistema tuhogar-api, seguindo os princípios de Clean Architecture.

### Entidades de Domínio
- **Account**: Representa uma conta no sistema com seus atributos
- **AccountType**: Enumeração que define os possíveis tipos de conta
- **AccountStatus**: Enumeração que define os possíveis estados de uma conta
- **User**: Representa um usuário no sistema
- **AuthenticatedUser**: Representa um usuário autenticado com informações reduzidas
- **ImageFile**: Representa um arquivo de imagem a ser processado
- **ImageType**: Enumeração que define os tipos de imagem (LOGO, BANNER, PROFILE, OTHER)
- **ProcessedImage**: Representa uma imagem após o processamento, com suas características e URL

### Interfaces
- **IAccountRepository**: Interface para acesso e manipulação dos dados de contas
- **IImageProcessingService**: Interface para processamento de imagens
- **ICloudStorageService**: Interface para armazenamento de arquivos em nuvem

### Casos de Uso
- **ProcessAccountImageUseCase**: Orquestra o processo de processamento de imagens para uma conta

### Implementações
- **MongooseAccountRepository**: Implementação do repositório de contas usando MongoDB/Mongoose
- **SharpImageProcessingService**: Implementação do serviço de processamento de imagens usando a biblioteca Sharp
- **CloudinaryStorageService**: Implementação do serviço de armazenamento em nuvem usando Cloudinary
- **AccountController**: Controlador HTTP para endpoints relacionados a contas

### Relações
- Uma Account tem um AccountType e um AccountStatus
- Vários Users podem pertencer a uma Account
- MongooseAccountRepository implementa IAccountRepository
- SharpImageProcessingService implementa IImageProcessingService
- CloudinaryStorageService implementa ICloudStorageService
- ProcessAccountImageUseCase depende de IAccountRepository e IImageProcessingService
- SharpImageProcessingService depende de ICloudStorageService
- AccountController depende de ProcessAccountImageUseCase
- ProcessAccountImageUseCase usa AuthenticatedUser, ImageFile e ImageType, e atualiza Account
- SharpImageProcessingService retorna ProcessedImage

### Responsabilidades
- O ProcessAccountImageUseCase coordena todo o processo de processamento de imagens, incluindo:
  - Verificação de autenticação e permissões
  - Validação da imagem
  - Redimensionamento e otimização da imagem
  - Upload da imagem para o serviço de armazenamento
  - Atualização da referência da imagem na conta

Este diagrama segue os princípios de Clean Architecture, com separação clara entre entidades de domínio, casos de uso, interfaces e implementações, conforme a estrutura do projeto tuhogar-api.
