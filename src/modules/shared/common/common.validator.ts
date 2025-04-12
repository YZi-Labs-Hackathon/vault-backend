import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@ValidatorConstraint({ name: 'ExistsRule', async: true })
@Injectable()
export class ExistsRule<R> implements ValidatorConstraintInterface {
    private repo: Repository<R>;

    constructor(repo: Repository<R>) {
        this.repo = repo;
    }

    async validate(id: number | string | Date) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await this.repo.findOneByOrFail({ id });
        } catch (e) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.value} doesn't exist`;
    }
}
