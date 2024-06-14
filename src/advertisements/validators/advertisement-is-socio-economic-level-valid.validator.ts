import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementType } from '../interfaces/advertisement.interface';




@ValidatorConstraint({ async: false })
export class AdvertisementIsSocioEconomicLevelConstraint implements ValidatorConstraintInterface {
    validate(socioEconomicLevel: any, args: ValidationArguments) {
        const object = args.object as any;
        const type = object.type;

        if (type === AdvertisementType.HOUSE || 
            type === AdvertisementType.APARTMENT ||
            type === AdvertisementType.OFFICE ||
            type === AdvertisementType.WAREHOUSE ||
            type === AdvertisementType.BUILDING ||
            type === AdvertisementType.COMMERCIAL) {
            return typeof socioEconomicLevel === 'number' && socioEconomicLevel > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.socioEconomicLevel.must.be.between.1.and.6';
    }
}

export function AdvertisementIsSocioEconomicLevel(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AdvertisementIsSocioEconomicLevelConstraint,
        });
    };
}
