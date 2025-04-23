import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

interface PathUserUseCaseCommand {
    userRole: UserRole;
    accountId: string;
    userId: string;
    name?: string;
    phone?: string;
    whatsApp?: string;
}

@Injectable()
export class PathUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({
        userRole,
        accountId,
        userId,
        name,
        phone,
        whatsApp
    }: PathUserUseCaseCommand): Promise<void> {
        const user = await this.userRepository.findOneById(userId);
        if (!user) throw new Error('notfound.user.do.not.exists');

        if (userRole !== UserRole.MASTER && accountId !== user.accountId) {
            throw new Error('notfound.user.do.not.exists');
        }

        const updatedUser = await this.userRepository.update(userId, name, phone, whatsApp);

        if (!updatedUser) throw new Error('notfound.user.do.not.exists');
    }
}