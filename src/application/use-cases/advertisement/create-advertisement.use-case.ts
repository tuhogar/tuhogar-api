import { Injectable } from '@nestjs/common';
import { Advertisement, AdvertisementStatus } from 'src/domain/entities/advertisement';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { CreateUpdateAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto';
import { plainToClass } from 'class-transformer';
import { AddressDto } from 'src/infraestructure/http/dtos/address/address.dto';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { IAdvertisementCodeRepository } from 'src/application/interfaces/repositories/advertisement-code.repository.interface';
import { ConfigService } from '@nestjs/config';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';

@Injectable()
export class CreateAdvertisementUseCase {
    private readonly firstSubscriptionPlanId: string;
    constructor(
        private readonly configService: ConfigService,
        private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly advertisementCodeRepository: IAdvertisementCodeRepository,
        private readonly subscriptionRepository: ISubscriptionRepository,
    ) {
        this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
    }

    async execute(
        authenticatedUser: AuthenticatedUser,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<Advertisement> {
        // Verificar se o usuário tem um plano associado
        if (!authenticatedUser.planId) {
            throw new Error('invalid.user.has.no.plan.associated');
        }

        // Verificar se o plano tem um limite de anúncios definido
        if (authenticatedUser.maxAdvertisements !== undefined && authenticatedUser.maxAdvertisements !== null) {
            // Contar anúncios ativos ou aguardando aprovação da conta
            const currentAdvertisementsCount = await this.advertisementRepository.countActiveOrWaitingByAccountId(authenticatedUser.accountId);
            
            // Verificar se o limite foi atingido
            // Caso especial: quando maxAdvertisements é 0 e não há anúncios, permitir a criação de um anúncio
            if (!(authenticatedUser.maxAdvertisements === 0 && currentAdvertisementsCount === 0) && 
                currentAdvertisementsCount >= authenticatedUser.maxAdvertisements) {
                throw new Error('invalid.advertisement.limit.reached.for.plan');
            }
        }

        createUpdateAdvertisementDto.address = plainToClass(AddressDto, createUpdateAdvertisementDto.address);

        const advertisementCode = await this.advertisementCodeRepository.generateNewCode();
        
        const advertisementCreated = await this.advertisementRepository.create({
            accountId: authenticatedUser.accountId, 
            createdUserId: authenticatedUser.userId, 
            updatedUserId: authenticatedUser.userId, 
            status: AdvertisementStatus.WAITING_FOR_APPROVAL,
            code: advertisementCode.code,
            ...createUpdateAdvertisementDto,
        });

        /*
        if (authenticatedUser.planId === this.firstSubscriptionPlanId && authenticatedUser.subscriptionStatus === SubscriptionStatus.CREATED) {
            await this.subscriptionRepository.active(authenticatedUser.subscriptionId);
            await this.updateFirebaseUsersDataUseCase.execute({ accountId: authenticatedUser.accountId });
        }
        */

        return advertisementCreated;
    }
}