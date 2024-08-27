import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementType } from '../../../../domain/entities/advertisement.interface';

@ValidatorConstraint({ async: false })
export class AdvertisementIsBedsCountMandatoryConstraint implements ValidatorConstraintInterface {
    validate(bedsCount: any, args: ValidationArguments) {
        const object = args.object as any;
        const type = object.type;

        if (type === AdvertisementType.HOUSE || type === AdvertisementType.APARTMENT) {
            return typeof bedsCount === 'number' && bedsCount > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.bedsCount.must.be.a.number.greater.than.0.when.type.is.HOUSE.or.APARTMENT';
    }
}

export function AdvertisementIsBedsCountMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AdvertisementIsBedsCountMandatoryConstraint,
        });
    };
}
