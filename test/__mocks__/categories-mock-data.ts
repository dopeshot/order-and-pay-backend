export const getCategorySeeder = () => getCategoriesSeeder()[0];

export const getCategoriesSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaab',
        title: 'Burger',
        description: 'Bread with stuff in between',
        icon: 'buger',
        image: 'burger',
        menuId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
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
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaac',
        title: 'not Burger',
        description: 'Stuff with bread in between',
        icon: 'not burger',
        image: 'not burger',
        menuId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        choices: [
            {
                id: 0,
                title: 'size',
                default: 1,
                type: 'radio',
                options: [
                    {
                        id: 1,
                        name: 'extra large',
                        price: 300
                    },
                    {
                        id: 2,
                        name: 'large',
                        price: 200
                    }
                ]
            }
        ]
    }
];

export const getSampleCategory = () => ({
    title: 'Pizza',
    description: 'Loaf with stuff on it',
    icon: 'pizza',
    image: 'pizza',
    menuId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
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
        categoryId: 'aaaaaaaaaaaaaaaaaaaaaaab',
        allergenIds: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
        labelIds: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
    }
];
