import { ValidationError } from '@nestjs/common';

export function flattenValidationErrors(errors: ValidationError[]): string[] {
    return errors
        .map((error) => {
            if (error.constraints) {
                return Object.values(error.constraints);
            } else if (error.children) {
                return flattenValidationErrors(error.children);
            }
        })
        .reduce((a, b) => b.concat(a), []);
}
