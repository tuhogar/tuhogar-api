import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class AddressIsLatitudeLongitudeRadiusMandatoryConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const object = args.object as any;
        const latitude = object.latitude;
        const longitude = object.longitude;
        const radius = object.radius;

        const isDefined = (value: any) => value !== undefined && value !== null;

        if (
            (isDefined(latitude) && (!isDefined(longitude) || !isDefined(radius))) ||
            (isDefined(longitude) && (!isDefined(latitude) || !isDefined(radius))) ||
            (isDefined(radius) && (!isDefined(latitude) || !isDefined(longitude)))
        ) {
            return false;  // Latitude, longitude e raio devem ser fornecidos juntos
        }

        return true;  // Passa na validação se ambos forem fornecidos ou ambos forem undefined/null
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.latitude.and.longitude.and.radius.both.must.be.provided.together';
    }
}

export function AddressIsLatitudeLongitudeRadiusMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AddressIsLatitudeLongitudeRadiusMandatoryConstraint,
        });
    };
}
