import { ObjectId } from "mongoose";

export type ResponseTable = {
    _id: ObjectId 
    tableNumber: number 
    capacity: number 
    createdBy: string
    updatedAt: Date // Is equivalent to createdAt on create
 }