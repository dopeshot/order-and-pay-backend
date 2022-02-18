import { ChoiceType } from '../../src/categories/enums/choice-type';
import { OrderStatus } from '../../src/orders/enums/order-status.enum';
import { PaymentStatus } from '../../src/orders/enums/payment-status.enum';

export const getUniqueOrder = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaa69',
    tableId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
    items: [],
    PaymentStatus: PaymentStatus.PENDING,
    Status: OrderStatus.FINISHED,
    price: 0
});

export const getCategoryForOrdersSeeder = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaab',
    title: 'stuff',
    description: 'Bread with stuff in between',
    icon: 'buger',
    image: 'burger',
    menu: 'aaaaaaaaaaaaaaaaaaaaaaa0',
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

export const getDishesForOrdersSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa0',
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
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa1',
        title: 'also Prosciutto',
        description:
            'Pizza with mortadella and the finest prosciutto crudo from napoli',
        price: 10000,
        image: 'imagelink',
        isAvailable: true,
        category: 'aaaaaaaaaaaaaaaaaaaaaaab',
        allergens: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
        labels: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
    }
];

export const getOrdersSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        items: [],
        Status: OrderStatus.FINISHED,
        PaymentStatus: PaymentStatus.RECEIVED,
        price: 0
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa1',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa2',
        items: [
            {
                dish: 'aaaaaaaaaaaaaaaaaaaaaaa0',
                count: 2,
                note: 'my note',
                pickedChoices: {
                    id: 1,
                    type: ChoiceType.CHECKBOX,
                    valueId: [1, 2, 3]
                }
            },
            {
                dish: 'aaaaaaaaaaaaaaaaaaaaaaa1',
                count: 1,
                note: 'your note',
                pickedChoices: {
                    id: 0,
                    type: ChoiceType.RADIO,
                    valueId: [2]
                }
            }
        ],
        Status: OrderStatus.IN_PROGRESS,
        PaymentStatus: PaymentStatus.RECEIVED,
        price: 0
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa2',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa2',
        items: [],
        Status: OrderStatus.RECEIVED,
        PaymentStatus: PaymentStatus.CANCELED,
        price: 0
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa3',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa3',
        items: [],
        Status: OrderStatus.RETURNED,
        PaymentStatus: PaymentStatus.PENDING,
        price: 0
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa4',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        items: [],
        Status: OrderStatus.RECEIVED,
        PaymentStatus: PaymentStatus.RECEIVED,
        price: 0
    }
];

export const getActiveOrders = () => {
    return getOrdersSeeder().filter(
        (order) =>
            order.Status === OrderStatus.RECEIVED ||
            order.Status === OrderStatus.IN_PROGRESS ||
            order.Status === OrderStatus.RETURNED
    );
};
