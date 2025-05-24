import { Plan } from './plan';

describe('Plan Entity', () => {
  it('should create a plan with all required properties', () => {
    // Arrange
    const planData = {
      name: 'Premium Plan',
      freeTrialDays: 30,
      items: ['Feature 1', 'Feature 2'],
      price: 99.99,
      externalId: 'ext-123',
    };

    // Act
    const plan = new Plan(planData);

    // Assert
    expect(plan).toBeDefined();
    expect(plan.name).toBe('Premium Plan');
    expect(plan.freeTrialDays).toBe(30);
    expect(plan.items).toEqual(['Feature 1', 'Feature 2']);
    expect(plan.price).toBe(99.99);
    expect(plan.externalId).toBe('ext-123');
    expect(plan.maxAdvertisements).toBeUndefined();
    expect(plan.maxPhotos).toBeUndefined();
  });

  it('should create a plan with optional properties', () => {
    // Arrange
    const planData = {
      id: '123',
      name: 'Premium Plan',
      freeTrialDays: 30,
      items: ['Feature 1', 'Feature 2'],
      price: 99.99,
      photo: 'https://example.com/photo.jpg',
      externalId: 'ext-123',
      maxAdvertisements: 10,
      maxPhotos: 20,
    };

    // Act
    const plan = new Plan(planData);

    // Assert
    expect(plan).toBeDefined();
    expect(plan.id).toBe('123');
    expect(plan.name).toBe('Premium Plan');
    expect(plan.freeTrialDays).toBe(30);
    expect(plan.items).toEqual(['Feature 1', 'Feature 2']);
    expect(plan.price).toBe(99.99);
    expect(plan.photo).toBe('https://example.com/photo.jpg');
    expect(plan.externalId).toBe('ext-123');
    expect(plan.maxAdvertisements).toBe(10);
    expect(plan.maxPhotos).toBe(20);
  });

  it('should create a plan with maxAdvertisements set to zero', () => {
    // Arrange
    const planData = {
      name: 'Free Plan',
      freeTrialDays: 30,
      items: ['Basic Feature'],
      price: 0,
      externalId: 'free-plan',
      maxAdvertisements: 0,
    };

    // Act
    const plan = new Plan(planData);

    // Assert
    expect(plan).toBeDefined();
    expect(plan.maxAdvertisements).toBe(0);
  });

  it('should create a plan with maxPhotos set to zero', () => {
    // Arrange
    const planData = {
      name: 'Basic Plan',
      freeTrialDays: 30,
      items: ['Basic Feature'],
      price: 9.99,
      externalId: 'basic-plan',
      maxPhotos: 0,
    };

    // Act
    const plan = new Plan(planData);

    // Assert
    expect(plan).toBeDefined();
    expect(plan.maxPhotos).toBe(0);
  });

  it('should create a plan with both maxAdvertisements and maxPhotos', () => {
    // Arrange
    const planData = {
      name: 'Complete Plan',
      freeTrialDays: 30,
      items: ['All Features'],
      price: 49.99,
      externalId: 'complete-plan',
      maxAdvertisements: 5,
      maxPhotos: 10,
    };

    // Act
    const plan = new Plan(planData);

    // Assert
    expect(plan).toBeDefined();
    expect(plan.maxAdvertisements).toBe(5);
    expect(plan.maxPhotos).toBe(10);
  });
});
