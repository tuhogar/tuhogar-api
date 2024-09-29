import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementStatus } from '../../../../domain/entities/advertisement';
import { REQUEST_CONTEXT } from '../../../guards/auth.guard';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole } from 'src/domain/entities/user';

@ValidatorConstraint({ async: false })
export class AdvertisementIsStatusValidConstraint implements ValidatorConstraintInterface {
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

export function AdvertisementIsStatusValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AdvertisementIsStatusValidConstraint,
        });
    };
}
