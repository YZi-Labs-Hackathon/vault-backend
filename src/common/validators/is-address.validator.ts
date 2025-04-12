import {
    isEthereumAddress,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { PublicKey } from '@solana/web3.js';

@ValidatorConstraint({ async: false })
export class IsAddressValidConstraint implements ValidatorConstraintInterface {
    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Address $value is not a valid!';
    }

    validate(value: string, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
        return !(!isEthereumAddress(value) && !this.isSolanaAddress(value));
    }

    isSolanaAddress(address: string) {
        try {
            return PublicKey.isOnCurve(new PublicKey(address));
        } catch (error) {
            return false;
        }
    }
}

export function IsAddressValidator(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsAddressValidConstraint,
        });
    };
}
