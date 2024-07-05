import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementTransactionType, AdvertisementType } from '../interfaces/advertisement.interface';




@ValidatorConstraint({ async: false })
export class AdvertisementIsPropertyTaxMandatoryConstraint implements ValidatorConstraintInterface {
    validate(propertyTax: any, args: ValidationArguments) {
        const object = args.object as any;
        const transactionType = object.transactionType;

        if (transactionType === AdvertisementTransactionType.SALE) {
            return typeof propertyTax === 'number' && propertyTax > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.propertyTax.must.be.a.number.greater.than.0.when.type.is.HOUSE.APARTMENT.or.OFFICE';
    }
}

export function AdvertisementIsPropertyTaxMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AdvertisementIsPropertyTaxMandatoryConstraint,
        });
    };
}
