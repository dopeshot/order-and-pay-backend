import { ChoiceType } from '../../src/categories/enums/choice-type';
import { OrderStatus } from '../../src/orders/enums/order-status.enum';
import { PaymentStatus } from '../../src/orders/enums/payment-status.enum';
import { getTablesSeeder } from './tables-mock-data';

export const getUniqueOrder = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaa69',
    table: getTablesSeeder()[0],
    items: [],
    paymentStatus: PaymentStatus.PENDING,
    status: OrderStatus.FINISHED,
    price: 0
});

export const getProperOrder = () => ({
    price: 12700,
    tableNumber: getTablesSeeder()[0].tableNumber,
    items: [
        {
            dishId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
            count: 2,
            note: 'my note',
            pickedChoices: [
                {
                    id: 1,
                    valueId: [1, 2]
                }
            ]
        },
        {
            dishId: 'aaaaaaaaaaaaaaaaaaaaaaa1',
            count: 1,
            note: 'your note',
            pickedChoices: [
                {
                    id: 0,
                    valueId: [2]
                }
            ]
        }
    ]
});

export const getCategoryForOrdersSeeder = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaab',
    title: 'stuff',
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
});

export const getDishesForOrdersSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        title: 'Prosciutto',
        description:
            'Pizza with mortadella and the finest prosciutto crudo from napoli',
        price: 950,
        image: 'imagelink',
        isAvailable: true,
        categoryId: 'aaaaaaaaaaaaaaaaaaaaaaab',
        allergenIds: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
        labelIds: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa1',
        title: 'also Prosciutto',
        description:
            'Pizza with mortadella and the finest prosciutto crudo from napoli',
        price: 10000,
        image: 'imagelink',
        isAvailable: true,
        categoryId: 'aaaaaaaaaaaaaaaaaaaaaaab',
        allergenIds: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
        labelIds: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
    }
];

export const getOrdersSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        table: getTablesSeeder()[0],
        items: [],
        status: OrderStatus.FINISHED,
        paymentStatus: PaymentStatus.RECEIVED,
        price: 0
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa1',
        table: getTablesSeeder()[2],
        items: [
            {
                dishId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
                count: 2,
                note: 'my note',
                pickedChoices: [
                    {
                        id: 1,
                        type: ChoiceType.CHECKBOX,
                        valueId: [1, 2, 3]
                    }
                ]
            },
            {
                dishId: 'aaaaaaaaaaaaaaaaaaaaaaa1',
                count: 1,
                note: 'your note',
                pickedChoices: [
                    {
                        id: 0,
                        type: ChoiceType.RADIO,
                        valueId: [2]
                    }
                ]
            }
        ],
        status: OrderStatus.IN_PROGRESS,
        paymentStatus: PaymentStatus.RECEIVED,
        price: 0
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa2',
        table: getTablesSeeder()[2],
        items: [],
        status: OrderStatus.RECEIVED,
        paymentStatus: PaymentStatus.CANCELED,
        price: 0
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa3',
        table: getTablesSeeder()[3],
        items: [],
        status: OrderStatus.RETURNED,
        paymentStatus: PaymentStatus.PENDING,
        price: 0
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa4',
        table: getTablesSeeder()[0],
        items: [],
        status: OrderStatus.RECEIVED,
        paymentStatus: PaymentStatus.RECEIVED,
        price: 0
    }
];

export const getActiveOrders = () => {
    return getOrdersSeeder().filter(
        (order) =>
            order.status === OrderStatus.RECEIVED ||
            order.status === OrderStatus.IN_PROGRESS ||
            order.status === OrderStatus.RETURNED
    );
};
