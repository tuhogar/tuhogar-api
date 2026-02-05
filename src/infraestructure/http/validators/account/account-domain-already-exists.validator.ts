import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { REQUEST_CONTEXT } from 'src/infraestructure/guards/auth.guard';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Injectable } from '@nestjs/common';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { ObjectId } from 'mongodb';
import { Account } from 'src/domain/entities/account';

@ValidatorConstraint({ async: true })
@Injectable()
export class AccountDomainAlreadyExistsConstraint implements ValidatorConstraintInterface {
    constructor(private readonly accountRepository: IAccountRepository) {}
    
    async validate(domain: string, args: ValidationArguments) {
        const object = args.object as any;

        const user = object[REQUEST_CONTEXT].user as AuthenticatedUser;

        let accountExists: Account | null = null;
        if (!ObjectId.isValid(domain)) {
            accountExists = await this.accountRepository.findOneByDomain(domain);
        } else {
            accountExists = await this.accountRepository.findOneById(domain);
        }

        if (accountExists && accountExists.id !== user.accountId) {
            return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
       return `invalid.account.domain.already.exists`;
    }
}

export function AccountDomainAlreadyExists(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AccountDomainAlreadyExistsConstraint,
        });
    };
}
