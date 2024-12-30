import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { REQUEST_CONTEXT } from 'src/infraestructure/guards/auth.guard';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Injectable } from '@nestjs/common';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class AccountAlreadyExistsConstraint implements ValidatorConstraintInterface {
    constructor(private readonly accountRepository: IAccountRepository) {}
    
    async validate(name: any, args: ValidationArguments) {
        const object = args.object as any;

        const user = object[REQUEST_CONTEXT].user as AuthenticatedUser;

        const accountExists = await this.accountRepository.findOneByEmail(user.email);

        return !accountExists;
    }

    defaultMessage(args: ValidationArguments) {
       return `invalid.account.already.exists`;
    }
}

export function AccountAlreadyExists(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AccountAlreadyExistsConstraint,
        });
    };
}
