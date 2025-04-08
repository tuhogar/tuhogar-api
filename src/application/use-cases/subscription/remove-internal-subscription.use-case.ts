import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';

interface RemoveInternalSubscriptionUseCaseCommand {
  id: string;
}

@Injectable()
export class RemoveInternalSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute({ id }: RemoveInternalSubscriptionUseCaseCommand): Promise<void> {
    await this.subscriptionRepository.delete(id);
  }
}
