import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user.interface';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { CreateAccountDto } from 'src/infraestructure/http/dtos/account/create-account.dto';
import { CreateUserDto } from 'src/infraestructure/http/dtos/user/create-user.dto';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { CreateUserUseCase } from '../user/create-user.use-case';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    createAccountDto: CreateAccountDto,
  ): Promise<{ id: string }> {
    const accountCreated = await this.accountRepository.create(authenticatedUser, createAccountDto);

    try {
      const createUserDto = new CreateUserDto();
      createUserDto.name = createAccountDto.name;
      createUserDto.userRole = UserRole.ADMIN;

      await this.createUserUseCase.execute(
        authenticatedUser,
        createUserDto,
        accountCreated,
      );

    } catch (error) {
      await this.accountRepository.deleteOne(accountCreated.id);
      throw error;
    }

    return { id: accountCreated.id };
  }
}
