import { USER_ROLE } from '@app/modules/user/user.constants';

export interface UserVaultData {
    id: string;
    name: string;
    address: string;
    chainType: string;
    role: USER_ROLE;
}
