import { Test, TestingModule } from '@nestjs/testing';
import { GetAccountEventsUseCase } from './get-account-events.use-case';
import { IAccountEventRepository } from 'src/application/interfaces/repositories/account-event.repository.interface';
import { AccountEvent } from 'src/domain/entities/account-event';

describe('GetAccountEventsUseCase', () => {
  let useCase: GetAccountEventsUseCase;
  let accountEventRepository: IAccountEventRepository;

  const mockAccountEvents: AccountEvent[] = [
    {
      id: 'event-id-1',
      accountId: 'account-id-1',
      type: 'page_view',
      count: 10,
    } as AccountEvent,
    {
      id: 'event-id-2',
      accountId: 'account-id-1',
      type: 'phone_click',
      count: 5,
    } as AccountEvent,
  ];

  const mockGroupedEvents: AccountEvent[] = [
    {
      accountId: null,
      type: 'page_view',
      count: 100,
    } as AccountEvent,
    {
      accountId: null,
      type: 'phone_click',
      count: 50,
    } as AccountEvent,
  ];

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAccountEventsUseCase,
        {
          provide: IAccountEventRepository,
          useValue: {
            findByAccountId: jest.fn(),
            findAllGroupedByType: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetAccountEventsUseCase>(GetAccountEventsUseCase);
    accountEventRepository = module.get<IAccountEventRepository>(
      IAccountEventRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return events for a specific accountId when accountId is provided', async () => {
      const accountId = 'account-id-1';
      jest
        .spyOn(accountEventRepository, 'findByAccountId')
        .mockResolvedValue(mockAccountEvents);

      const result = await useCase.execute({ accountId });

      expect(result).toEqual(mockAccountEvents);
      expect(accountEventRepository.findByAccountId).toHaveBeenCalledWith(
        accountId,
      );
      expect(
        accountEventRepository.findAllGroupedByType,
      ).not.toHaveBeenCalled();
    });

    it('should return aggregated events grouped by type when accountId is not provided', async () => {
      jest
        .spyOn(accountEventRepository, 'findAllGroupedByType')
        .mockResolvedValue(mockGroupedEvents);

      const result = await useCase.execute({});

      expect(result).toEqual(mockGroupedEvents);
      expect(accountEventRepository.findAllGroupedByType).toHaveBeenCalled();
      expect(accountEventRepository.findByAccountId).not.toHaveBeenCalled();
    });

    it('should return aggregated events when accountId is undefined', async () => {
      jest
        .spyOn(accountEventRepository, 'findAllGroupedByType')
        .mockResolvedValue(mockGroupedEvents);

      const result = await useCase.execute({ accountId: undefined });

      expect(result).toEqual(mockGroupedEvents);
      expect(accountEventRepository.findAllGroupedByType).toHaveBeenCalled();
      expect(accountEventRepository.findByAccountId).not.toHaveBeenCalled();
    });
  });
});
