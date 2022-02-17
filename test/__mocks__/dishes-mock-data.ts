export const getDishSeeder = () => getDishesSeeder()[0];

export const getDishesSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        title: 'Prosciutto',
        description:
            'Pizza with mortadella and the finest prosciutto crudo from napoli',
        price: 950,
        image: 'imagelink',
        isAvailable: true,
        category: 'aaaaaaaaaaaaaaaaaaaaaaab',
        allergens: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
        labels: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaab',
        title: 'also Prosciutto',
        description:
            'Pizza with mortadella and the finest prosciutto crudo from napoli',
        price: 10000,
        image: 'imagelink',
        isAvailable: true,
        category: 'aaaaaaaaaaaaaaaaaaaaaaab',
        allergens: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
        labels: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaac',
        title: 'Prosciutto as well,',
        description:
            'Pizza with mortadella and the finest prosciutto crudo from napoli',
        price: 420,
        image: 'imagelink',
        isAvailable: true,
        category: 'aaaaaaaaaaaaaaaaaaaaaaac',
        allergens: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
        labels: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
    }
];

export const getAllergensForDishesSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaca',
        title: 'nuts',
        icon: 'nutsicon'
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaacb',
        title: 'rucola',
        icon: 'salad'
    }
];

export const getLabelsForDishesSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaada',
        title: 'glutenfree',
        icon: 'wheat'
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaadb',
        title: 'premium meat',
        icon: 'stars'
    }
];

export const getSampleDish = () => ({
    title: 'Italiano',
    description:
        'Pizza with mortadella and the finest prosciutto crudo from napoli',
    price: 950,
    image: 'imagelink',
    isAvailable: true,
    category: 'aaaaaaaaaaaaaaaaaaaaaaba',
    allergens: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
    labels: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
});
