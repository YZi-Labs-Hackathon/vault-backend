import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import moment from 'moment';

@ValidatorConstraint({ name: 'timestampBeforeNow', async: false })
export class TimestampBeforeNowValidator implements ValidatorConstraintInterface {
    validate(timestamp: number, args: ValidationArguments) {
        return moment().unix() - timestamp <= 10;
    }

    defaultMessage(args: ValidationArguments) {
        return `Timestamp is invalid!`;
    }
}

export function IsTimestampBeforeNow(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: TimestampBeforeNowValidator,
        });
    };
}
