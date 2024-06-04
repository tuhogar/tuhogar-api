import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementPropertyStatus } from '../interfaces/advertisement.interface';




@ValidatorConstraint({ async: false })
export class IsBathsCountMandatoryConstraint implements ValidatorConstraintInterface {
    validate(bathsCount: any, args: ValidationArguments) {
        const object = args.object as any;
        const propertyStatus = object.propertyStatus;

        if (propertyStatus === AdvertisementPropertyStatus.HOUSE || propertyStatus === AdvertisementPropertyStatus.APARTMENT || propertyStatus === AdvertisementPropertyStatus.OFFICE) {
            return typeof bathsCount === 'number' && bathsCount > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.bathsCount.must.be.a.number.greater.than.0.when.propertyStatus.is.HOUSE.APARTMENT.or.OFFICE';
    }
}

export function IsBathsCountMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsBathsCountMandatoryConstraint,
        });
    };
}
