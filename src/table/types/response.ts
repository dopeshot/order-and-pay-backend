import { ObjectId } from "mongoose";

export type ResponseTable = {
    _id: ObjectId, // Die Datenbank Id
    tableNumber: number, // Die Tischnummer (hier könnte man beim erstellen automatisch hochzählen) 
    capacity: number // Die Anzahl der Personen welche am Tisch platz nehmen können
 }