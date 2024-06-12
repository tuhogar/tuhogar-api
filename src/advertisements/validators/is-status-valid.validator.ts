import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementStatus } from '../interfaces/advertisement.interface';
import { REQUEST_CONTEXT } from '../../guards/auth.guard';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { UserRole } from 'src/users/interfaces/user.interface';

@ValidatorConstraint({ async: false })
export class IsStatusValidConstraint implements ValidatorConstraintInterface {
    validate(status: any, args: ValidationArguments) {
        const object = args.object as any;

        const user = object[REQUEST_CONTEXT].user as AuthenticatedUser;

        return !(
                    (status === AdvertisementStatus.ACTIVE || status === AdvertisementStatus.PAUSED_BY_APPLICATION)
                    &&
                    user.userRole !== UserRole.MASTER
                )
                &&
               !(
                    status === AdvertisementStatus.PAUSED_BY_USER 
                    && 
                    user.userRole === UserRole.MASTER
                );
    }

    defaultMessage(args: ValidationArguments) {
       return `Unauthorized`;
    }
}

export function IsStatusValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsStatusValidConstraint,
        });
    };
}
