export const getLabelSeeder = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    icon: 'dave',
    title: 'Muck',
    createdAt: '2022-01-23T11:35:29.127Z',
    updatedAt: '2022-01-23T12:01:00.201Z',
    __v: 0
});
export const getExtraLabelSeeder = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaab',
    icon: 'dave',
    title: 'something',
    createdAt: '2022-01-23T11:35:29.127Z',
    updatedAt: '2022-01-23T12:01:00.201Z',
    __v: 0
});

export const getSampleLabel = () => ({
    title: 'string',
    icon: 'string'
});

export const getDishWithReference = () => ({
    _id: '12345aaaaaaaaaaaaaaaaaaa',
    title: 'title',
    price: 100,
    categoryId: '1234567aaaaaaaaaaaaaaaaa',
    labelIds: ['123aaaaaaaaaaaaaaaaaaaaa', getLabelSeeder()._id],
    description: 'something',
    image: 'someImage'
});
