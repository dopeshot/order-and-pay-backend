import { Expose, Transform } from 'class-transformer';
import { MenuDocument } from '../entities/menu.entity';
import { Status } from '../enums/status.enum';

export class MenuResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    status: Status;

    @Expose()
    isActive: boolean;

    constructor(partial: Partial<MenuDocument>) {
        Object.assign(this, partial);
    }
}
