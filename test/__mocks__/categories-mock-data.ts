export const getCategorySeeder = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaab',
    title: 'Burger',
    description: 'Bread with stuff in between',
    icon: 'buger',
    image: 'burger',
    menu: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    choices: [
        {
            id: 0,
            title: 'size',
            default: 1,
            type: 'radio',
            options: [
                {
                    id: 0,
                    name: 'small',
                    price: -200
                },
                {
                    id: 1,
                    name: 'normal',
                    price: 0
                },
                {
                    id: 2,
                    name: 'large',
                    price: 200
                }
            ]
        },
        {
            id: 1,
            title: 'toppings',
            type: 'checkbox',
            options: [
                {
                    id: 0,
                    name: 'lettuce',
                    price: 100
                },
                {
                    id: 1,
                    name: 'cucumber',
                    price: 100
                },
                {
                    id: 2,
                    name: 'pickle',
                    price: 200
                }
            ]
        }
    ]
});

export const getSampleCategory = () => ({
    title: 'Pizza',
    description: 'Loaf with stuff on it',
    icon: 'pizza',
    image: 'pizza',
    menu: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    choices: [
        {
            id: 0,
            title: 'size',
            default: 1,
            type: 'radio',
            options: [
                {
                    id: 0,
                    name: 'small',
                    price: -200
                },
                {
                    id: 1,
                    name: 'normal',
                    price: 0
                },
                {
                    id: 2,
                    name: 'large',
                    price: 200
                }
            ]
        },
        {
            id: 1,
            title: 'toppings',
            type: 'checkbox',
            options: [
                {
                    id: 0,
                    name: 'salami',
                    price: 100
                },
                {
                    id: 1,
                    name: 'prosciutto',
                    price: 100
                },
                {
                    id: 2,
                    name: 'olives',
                    price: 200
                }
            ]
        }
    ]
});

export const getDishForCategorySeeder = () => [
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
    }
];
