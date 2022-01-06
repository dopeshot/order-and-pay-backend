import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'mongoose';
import { TableDocument } from '../entities/table.entity';

export class ResponseTable {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;

    @Expose()
    tableNumber: string;

    @Expose()
    capacity: number;

    @Expose()
    author: string;

    @Expose()
    updatedAt: Date; // Is equivalent to createdAt on create

    constructor(partial: Partial<TableDocument>) {
        Object.assign(this, partial.toObject());
    }
}
