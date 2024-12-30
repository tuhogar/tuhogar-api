import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class AddressIsLatitudeLongitudeMandatoryConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const object = args.object as any;
        const latitude = object.latitude;
        const longitude = object.longitude;

        // Validação: quando um for informado, o outro deve ser obrigatório
        if ((latitude !== undefined && latitude !== null) && (longitude === undefined || longitude === null)) {
            return false;  // Longitude é obrigatória se a latitude for informada
        }

        if ((longitude !== undefined && longitude !== null) && (latitude === undefined || latitude === null)) {
            return false;  // Latitude é obrigatória se a longitude for informada
        }

        return true;  // Passa na validação se ambos forem fornecidos ou ambos forem undefined/null
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.latitude.and.longitude.both.must.be.provided.together';
    }
}

export function AddressIsLatitudeLongitudeMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AddressIsLatitudeLongitudeMandatoryConstraint,
        });
    };
}
