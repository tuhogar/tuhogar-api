import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { REQUEST_CONTEXT } from 'src/infraestructure/guards/auth.guard';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { User, UserRole } from 'src/domain/entities/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class UserAlreadyExistsConstraint implements ValidatorConstraintInterface {
    constructor(private readonly userRepository: IUserRepository) {}
    
    async validate(name: any, args: ValidationArguments) {
        const object = args.object as any;

        const user = object[REQUEST_CONTEXT].user as AuthenticatedUser;

        const userExists = await this.userRepository.findOne({ uid: user.uid });

        return !userExists;
    }

    defaultMessage(args: ValidationArguments) {
       return `invalid.user.already.exists`;
    }
}

export function UserAlreadyExists(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: UserAlreadyExistsConstraint,
        });
    };
}
