import { ObjectId } from "mongoose";

export type ResponseTable = {
    _id: ObjectId 
    tableNumber: string 
    capacity: number 
    author: string
    updatedAt: Date // Is equivalent to createdAt on create
 }