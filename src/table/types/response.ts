import { ObjectId } from "mongoose";

export type ResponseTable = {
    _id: ObjectId, 
    tableNumber: number, 
    capacity: number 
    updatedAt: Date // Is equivalent to createdAt on create
 }