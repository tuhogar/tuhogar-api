import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementPropertyStatus } from '../interfaces/advertisement.interface';




@ValidatorConstraint({ async: false })
export class IsSocioEconomicLevelConstraint implements ValidatorConstraintInterface {
    validate(socioEconomicLevel: any, args: ValidationArguments) {
        const object = args.object as any;
        const propertyStatus = object.propertyStatus;

        if (propertyStatus === AdvertisementPropertyStatus.HOUSE || 
            propertyStatus === AdvertisementPropertyStatus.APARTMENT ||
            propertyStatus === AdvertisementPropertyStatus.OFFICE ||
            propertyStatus === AdvertisementPropertyStatus.WAREHOUSE ||
            propertyStatus === AdvertisementPropertyStatus.BUILDING ||
            propertyStatus === AdvertisementPropertyStatus.COMMERCIAL) {
            return typeof socioEconomicLevel === 'number' && socioEconomicLevel > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.socioEconomicLevel.must.be.between.1.and.6';
    }
}

export function IsSocioEconomicLevel(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSocioEconomicLevelConstraint,
        });
    };
}
