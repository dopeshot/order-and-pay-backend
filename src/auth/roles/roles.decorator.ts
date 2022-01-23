import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum';

export const Roles = (...role: Role[]) => SetMetadata('role', role);
