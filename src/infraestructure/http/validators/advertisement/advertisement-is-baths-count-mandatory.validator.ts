import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementType } from '../../../../domain/entities/advertisement';




@ValidatorConstraint({ async: false })
export class AdvertisementIsBathsCountMandatoryConstraint implements ValidatorConstraintInterface {
    validate(bathsCount: any, args: ValidationArguments) {
        const object = args.object as any;
        const type = object.type;

        if (type === AdvertisementType.HOUSE || type === AdvertisementType.APARTMENT) {
            return typeof bathsCount === 'number' && bathsCount > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.bathsCount.must.be.a.number.greater.than.0.when.type.is.HOUSE.APARTMENT';
    }
}

export function AdvertisementIsBathsCountMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AdvertisementIsBathsCountMandatoryConstraint,
        });
    };
}
