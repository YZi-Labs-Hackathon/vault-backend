import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsGreaterThanZeroConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
    }

    defaultMessage(args: ValidationArguments) {
        return 'The value must be a number greater than 0';
    }
}

export function IsGreaterThanZero(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsGreaterThanZeroConstraint,
        });
    };
}
