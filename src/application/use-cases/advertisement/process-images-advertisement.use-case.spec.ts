import { Test, TestingModule } from '@nestjs/testing';
import { ProcessImagesAdvertisementUseCase } from './process-images-advertisement.use-case';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole, UserStatus } from 'src/domain/entities/user';
import { AccountDocumentType, AccountStatus } from 'src/domain/entities/account';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { Advertisement, AdvertisementPhoto, AdvertisementStatus, AdvertisementType, AdvertisementTransactionType } from 'src/domain/entities/advertisement';
import { UploadImagesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/upload-images-advertisement.dto';
import { Plan } from 'src/domain/entities/plan';
import { Account } from 'src/domain/entities/account';

describe('ProcessImagesAdvertisementUseCase', () => {
  let useCase: ProcessImagesAdvertisementUseCase;
  let algoliaService: AlgoliaService;
  let cloudinaryService: CloudinaryService;
  let advertisementRepository: IAdvertisementRepository;
  let configService: ConfigService;
  let redisService: RedisService;
  let accountRepository: IAccountRepository;
  let planRepository: IPlanRepository;

  // Mocks
  const mockAccountId = 'account-123';
  const mockPlanId = 'plan-123';
  const mockSubscriptionId = 'subscription-123';
  const mockUserId = 'user-123';
  const mockUid = 'firebase-uid-123';
  const mockAdvertisementId = 'advertisement-123';
  const mockMaxPhotos = 5;

  // Mock para o usuário autenticado (não MASTER)
  const mockAuthenticatedUser: AuthenticatedUser = {
    userRole: UserRole.USER,
    uid: mockUid,
    userId: mockUserId,
    email: 'agente@inmobiliariamedellin.com',
    userStatus: UserStatus.ACTIVE,
    planId: mockPlanId,
    accountId: mockAccountId,
    accountStatus: AccountStatus.ACTIVE,
    subscriptionId: mockSubscriptionId,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    maxPhotos: mockMaxPhotos,
    maxAdvertisements: 20
  };

  // Mock para o usuário autenticado (MASTER)
  const mockMasterUser: AuthenticatedUser = {
    ...mockAuthenticatedUser,
    userRole: UserRole.MASTER,
    accountId: 'master-account-id', // Diferente da conta do anúncio
  };

  // Mock para o anúncio
  const mockAdvertisement: Advertisement = {
    id: mockAdvertisementId,
    accountId: mockAccountId,
    createdUserId: mockUserId,
    updatedUserId: mockUserId,
    approvingUserId: null,
    status: AdvertisementStatus.ACTIVE,
    code: 12345,
    transactionType: AdvertisementTransactionType.SALE,
    type: AdvertisementType.HOUSE,
    constructionType: null,
    allContentsIncluded: false,
    isResidentialComplex: false,
    isPenthouse: false,
    bedsCount: 3,
    bathsCount: 2,
    parkingCount: 1,
    floorsCount: 1,
    constructionYear: 2020,
    socioEconomicLevel: 3,
    isHoaIncluded: false,
    amenities: [],
    communityAmenities: [],
    description: 'Hermoso apartamento en El Poblado, con vista panorámica a la ciudad. Excelente ubicación cerca de centros comerciales, restaurantes y transporte público. Ideal para inversión o vivienda.',
    hoaFee: 350000,
    lotArea: 120,
    floorArea: 95,
    price: 450000000,
    pricePerFloorArea: 4736842.11,
    pricePerLotArea: 3750000,
    propertyTax: 1200000,
    address: {
      country: 'Colombia',
      state: 'Antioquia',
      city: 'Medellín',
      sector: 'El Poblado',
      neighbourhood: 'El Poblado',
      street: 'Calle 10 #43-12',
      stateSlug: 'antioquia',
      citySlug: 'medellin',
      sectorSlug: 'el-poblado',
      neighbourhoodSlug: 'el-poblado',
      latitude: 6.2476,
      longitude: -75.5658,
      postalCode: '050021',
      placeId: 'ChIJn3xCAkqaRI4RZ6XERi5PE_M',
      establishment: 'Edificio Torre Sur'
    },
    photos: [], // Inicialmente sem fotos
    tourUrl: '',
    videoUrl: '',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isVacant: true,
    vacancyDate: null,
    externalId: '',
    advertisementEvents: [],
  };

  // Mock para o anúncio com fotos existentes
  const mockAdvertisementWithPhotos: Advertisement = {
    ...mockAdvertisement,
    photos: Array(3).fill(0).map((_, i) => ({
      id: `existing-photo-${i}`,
      name: `photo-${i}.jpg`,
      url: `https://example.com/photo-${i}.jpg`,
      thumbnailUrl: `https://example.com/photo-${i}-thumbnail.jpg`,
      order: i,
    })),
  };

  // Mock para a conta
  const mockAccount: Account = {
    id: mockAccountId,
    planId: mockPlanId,
    name: 'Inmobiliaria Medellín',
    email: 'contacto@inmobiliariamedellin.com',
    phone: '+573004567890',
    documentType: AccountDocumentType.NIT,
    documentNumber: '900.123.456-7',
    status: AccountStatus.ACTIVE,
    subscription: {
      id: mockSubscriptionId,
      accountId: mockAccountId,
      planId: mockPlanId,
      status: SubscriptionStatus.ACTIVE,
    },
  };

  // Mock para o plano
  const mockPlan: Plan = {
    id: mockPlanId,
    name: 'Plan Premium',
    freeTrialDays: 30,
    items: ['Hasta 20 anuncios', 'Hasta 5 fotos por anuncio', 'Soporte prioritario'],
    price: 299900,
    externalId: 'plan_premium_mensual',
    maxPhotos: mockMaxPhotos,
    maxAdvertisements: 20
  };

  // Mock para o DTO de upload de imagens
  const createMockUploadDto = (count: number): UploadImagesAdvertisementDto => ({
    images: Array(count).fill(0).map((_, i) => ({
      name: `inmueble-${mockAdvertisementId}-${i+1}.jpg`,
      content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9o=',
      contentType: 'image/jpeg',
      order: i,
    })),
  });

  beforeEach(async () => {
    // Criar mocks para os serviços e repositórios
    const mockAlgoliaService = {
      delete: jest.fn().mockResolvedValue(true),
    };

    const mockCloudinaryService = {
      resizeImage: jest.fn().mockResolvedValue('resized-content'),
      convertToWebP: jest.fn().mockResolvedValue('webp-content'),
      uploadBase64Image: jest.fn().mockImplementation((content, type, name) => 
        Promise.resolve(`https://example.com/${name}.webp`)),
    };

    const mockAdvertisementRepository = {
      findOneById: jest.fn().mockImplementation((id) => {
        if (id === mockAdvertisementId) {
          return Promise.resolve(mockAdvertisement);
        }
        return Promise.resolve(null);
      }),
      createPhotos: jest.fn().mockImplementation((accountId, advertisementId, photos) => {
        return Promise.resolve({
          ...mockAdvertisement,
          photos,
        });
      }),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue(''),
    };

    const mockRedisService = {
      delete: jest.fn().mockResolvedValue(true),
    };

    const mockAccountRepository = {
      findOneByIdWithSubscription: jest.fn().mockImplementation((id) => {
        if (id === mockAccountId) {
          return Promise.resolve(mockAccount);
        }
        return Promise.resolve(null);
      }),
    };

    const mockPlanRepository = {
      findOneById: jest.fn().mockImplementation((id) => {
        if (id === mockPlanId) {
          return Promise.resolve(mockPlan);
        }
        return Promise.resolve(null);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessImagesAdvertisementUseCase,
        { provide: AlgoliaService, useValue: mockAlgoliaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: IAdvertisementRepository, useValue: mockAdvertisementRepository },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: IAccountRepository, useValue: mockAccountRepository },
        { provide: IPlanRepository, useValue: mockPlanRepository },
      ],
    }).compile();

    useCase = module.get<ProcessImagesAdvertisementUseCase>(ProcessImagesAdvertisementUseCase);
    algoliaService = module.get<AlgoliaService>(AlgoliaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    advertisementRepository = module.get<IAdvertisementRepository>(IAdvertisementRepository);
    configService = module.get<ConfigService>(ConfigService);
    redisService = module.get<RedisService>(RedisService);
    accountRepository = module.get<IAccountRepository>(IAccountRepository);
    planRepository = module.get<IPlanRepository>(IPlanRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validação de limite de fotos', () => {
    it('deve permitir o upload de fotos quando o usuário não atingiu o limite', async () => {
      // Arrange
      const uploadDto = createMockUploadDto(2); // 2 novas fotos
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisement); // 0 fotos existentes

      // Act & Assert
      await expect(useCase.execute(mockAuthenticatedUser, mockAdvertisementId, uploadDto))
        .resolves.toBeDefined();
    });

    it('deve permitir o upload de fotos quando o total não excede o limite', async () => {
      // Arrange
      const uploadDto = createMockUploadDto(2); // 2 novas fotos
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisementWithPhotos); // 3 fotos existentes

      // Act & Assert
      await expect(useCase.execute(mockAuthenticatedUser, mockAdvertisementId, uploadDto))
        .resolves.toBeDefined();
    });

    it('deve lançar erro quando o upload excederia o limite de fotos', async () => {
      // Arrange
      const uploadDto = createMockUploadDto(3); // 3 novas fotos
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisementWithPhotos); // 3 fotos existentes

      // Act & Assert
      await expect(useCase.execute(mockAuthenticatedUser, mockAdvertisementId, uploadDto))
        .rejects.toThrow('invalid.photos.limit.reached.for.plan');
    });

    it('não deve validar o limite quando maxPhotos é undefined', async () => {
      // Arrange
      const userWithoutMaxPhotos = { ...mockAuthenticatedUser, maxPhotos: undefined };
      const uploadDto = createMockUploadDto(10); // 10 novas fotos (mais que o limite)
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisementWithPhotos); // 3 fotos existentes

      // Act & Assert
      await expect(useCase.execute(userWithoutMaxPhotos, mockAdvertisementId, uploadDto))
        .resolves.toBeDefined();
    });

    it('não deve validar o limite quando maxPhotos é null', async () => {
      // Arrange
      const userWithNullMaxPhotos = { ...mockAuthenticatedUser, maxPhotos: null };
      const uploadDto = createMockUploadDto(10); // 10 novas fotos (mais que o limite)
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisementWithPhotos); // 3 fotos existentes

      // Act & Assert
      await expect(useCase.execute(userWithNullMaxPhotos, mockAdvertisementId, uploadDto))
        .resolves.toBeDefined();
    });

    it('deve permitir o upload de uma foto quando maxPhotos é 0 e não há fotos existentes', async () => {
      // Arrange
      const userWithZeroMaxPhotos = { ...mockAuthenticatedUser, maxPhotos: 0 };
      const uploadDto = createMockUploadDto(1); // 1 nova foto
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisement); // 0 fotos existentes
      jest.spyOn(cloudinaryService, 'uploadBase64Image').mockResolvedValue('https://example.com/image.jpg');
      
      const mockPhoto = new AdvertisementPhoto({
        id: 'photo-123',
        name: 'test-photo.jpg',
        url: 'https://example.com/image.jpg',
        thumbnailUrl: 'https://example.com/image-thumb.jpg',
        order: 0
      });
      
      jest.spyOn(advertisementRepository, 'createPhotos').mockResolvedValue({ 
        ...mockAdvertisement, 
        photos: [mockPhoto] 
      });
      
      // Act
      const result = await useCase.execute(userWithZeroMaxPhotos, mockAdvertisementId, uploadDto);

      // Assert
      expect(result).toBeDefined();
      expect(advertisementRepository.findOneById).toHaveBeenCalledWith(mockAdvertisementId);
      expect(cloudinaryService.uploadBase64Image).toHaveBeenCalled();
      expect(advertisementRepository.createPhotos).toHaveBeenCalled();
    });

    it('deve permitir o upload de uma foto quando maxPhotos é 0 e já existem fotos', async () => {
      // Arrange
      const userWithZeroMaxPhotos = { ...mockAuthenticatedUser, maxPhotos: 0 };
      const uploadDto = createMockUploadDto(1); // 1 nova foto
      
      const existingPhoto = new AdvertisementPhoto({
        id: 'existing-photo',
        name: 'existing-photo.jpg',
        url: 'https://example.com/existing-image.jpg',
        thumbnailUrl: 'https://example.com/existing-image-thumb.jpg',
        order: 0
      });
      
      const mockAdvWithPhotos = { ...mockAdvertisement, photos: [existingPhoto] };
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvWithPhotos);
      jest.spyOn(cloudinaryService, 'uploadBase64Image').mockResolvedValue('https://example.com/new-image.jpg');
      
      const newPhoto = new AdvertisementPhoto({
        id: 'new-photo-123',
        name: 'new-photo.jpg',
        url: 'https://example.com/new-image.jpg',
        thumbnailUrl: 'https://example.com/new-image-thumb.jpg',
        order: 1
      });
      
      jest.spyOn(advertisementRepository, 'createPhotos').mockResolvedValue({
        ...mockAdvWithPhotos,
        photos: [...mockAdvWithPhotos.photos, newPhoto]
      });

      // Act
      const result = await useCase.execute(userWithZeroMaxPhotos, mockAdvertisementId, uploadDto);

      // Assert
      expect(result).toBeDefined();
      expect(advertisementRepository.findOneById).toHaveBeenCalledWith(mockAdvertisementId);
      expect(cloudinaryService.uploadBase64Image).toHaveBeenCalled();
      expect(advertisementRepository.createPhotos).toHaveBeenCalled();
    });
  });

  describe('Validação de limite de fotos para usuários MASTER', () => {
    it('deve buscar o plano da conta do anúncio para usuários MASTER', async () => {
      // Arrange
      const uploadDto = createMockUploadDto(2); // 2 novas fotos
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisement); // 0 fotos existentes
      const findOneByIdWithSubscriptionSpy = jest.spyOn(accountRepository, 'findOneByIdWithSubscription');
      const findOneByIdSpy = jest.spyOn(planRepository, 'findOneById');

      // Act
      await useCase.execute(mockMasterUser, mockAdvertisementId, uploadDto);

      // Assert
      expect(findOneByIdWithSubscriptionSpy).toHaveBeenCalledWith(mockAccountId);
      expect(findOneByIdSpy).toHaveBeenCalledWith(mockPlanId);
    });

    it('deve lançar erro quando a conta do anúncio não é encontrada', async () => {
      // Arrange
      const uploadDto = createMockUploadDto(2); // 2 novas fotos
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisement); // 0 fotos existentes
      jest.spyOn(accountRepository, 'findOneByIdWithSubscription').mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(mockMasterUser, mockAdvertisementId, uploadDto))
        .rejects.toThrow('notfound.account.do.not.exists');
    });

    it('deve lançar erro quando o upload excederia o limite de fotos do plano da conta do anúncio', async () => {
      // Arrange
      const uploadDto = createMockUploadDto(3); // 3 novas fotos
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisementWithPhotos); // 3 fotos existentes
      jest.spyOn(accountRepository, 'findOneByIdWithSubscription').mockResolvedValue(mockAccount);
      jest.spyOn(planRepository, 'findOneById').mockResolvedValue(mockPlan); // maxPhotos: 5

      // Act & Assert
      await expect(useCase.execute(mockMasterUser, mockAdvertisementId, uploadDto))
        .rejects.toThrow('invalid.photos.limit.reached.for.plan');
    });

    it('deve tratar erro ao buscar o plano e não validar o limite', async () => {
      // Arrange
      const uploadDto = createMockUploadDto(10); // 10 novas fotos (mais que o limite)
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisementWithPhotos); // 3 fotos existentes
      jest.spyOn(accountRepository, 'findOneByIdWithSubscription').mockResolvedValue(mockAccount);
      jest.spyOn(planRepository, 'findOneById').mockRejectedValue(new Error('Database error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(useCase.execute(mockMasterUser, mockAdvertisementId, uploadDto))
        .resolves.toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith('error.fetching.plan.for.photos.limit.validation');
    });

    it('não deve validar o limite quando a conta não tem plano associado', async () => {
      // Arrange
      const accountWithoutPlan = { ...mockAccount, subscription: { ...mockAccount.subscription, planId: null } };
      const uploadDto = createMockUploadDto(10); // 10 novas fotos (mais que o limite)
      jest.spyOn(advertisementRepository, 'findOneById').mockResolvedValue(mockAdvertisementWithPhotos); // 3 fotos existentes
      jest.spyOn(accountRepository, 'findOneByIdWithSubscription').mockResolvedValue(accountWithoutPlan);

      // Act & Assert
      await expect(useCase.execute(mockMasterUser, mockAdvertisementId, uploadDto))
        .resolves.toBeDefined();
    });
  });
});
