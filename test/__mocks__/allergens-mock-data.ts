export const getAllergenSeeder = () =>
({
    "_id": "aaaaaaaaaaaaaaaaaaaaaaaa",
    "icon": "dave",
    "title": "Muck",
    "createdAt": "2022-01-23T11:35:29.127Z",
    "updatedAt": "2022-01-23T12:01:00.201Z",
    "__v": 0
})
export const getExtraAllergenSeeder = () =>
({
    "_id": "aaaaaaaaaaaaaaaaaaaaaaab",
    "icon": "dave",
    "title": "something",
    "createdAt": "2022-01-23T11:35:29.127Z",
    "updatedAt": "2022-01-23T12:01:00.201Z",
    "__v": 0
})

export const getWrongId = () => "1aaaaaaaaaaaaaaaaaaaaaaa"

export const getSampleAllergen = () => ({
    "title": "string",
    "icon": "string"
  })

export const getStringOfLength = (length: number) => new Array(length + 1).join('a');