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
                isDefault: 1,
                type: 'radio',
                options: [
                    {
                        id: 0,
                        title: 'small',
                        price: -200
                    },
                    {
                        id: 1,
                        title: 'normal',
                        price: 0
                    },
                    {
                        id: 2,
                        title: 'large',
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
                        title: 'lettuce',
                        price: 100
                    },
                    {
                        id: 1,
                        title: 'cucumber',
                        price: 100
                    },
                    {
                        id: 2,
                        title: 'pickle',
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
                isDefault: 1,
                type: 'radio',
                options: [
                    {
                        id: 1,
                        title: 'extra large',
                        price: 300
                    },
                    {
                        id: 2,
                        title: 'large',
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
            isDefault: 1,
            type: 'radio',
            options: [
                {
                    id: 0,
                    title: 'small',
                    price: -200
                },
                {
                    id: 1,
                    title: 'normal',
                    price: 0
                },
                {
                    id: 2,
                    title: 'large',
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
                    title: 'salami',
                    price: 100
                },
                {
                    id: 1,
                    title: 'prosciutto',
                    price: 100
                },
                {
                    id: 2,
                    title: 'olives',
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
