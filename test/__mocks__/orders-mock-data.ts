import { ChoiceType } from '../../src/categories/enums/choice-type';
import { OrderStatus } from '../../src/orders/enums/order-status.enum';

const orderMockData = [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        items: [],
        PaymentStatus: {
            status: 'received',
            transactionId: 'xeN97BA1P6',
            amount: 10
        },
        Status: OrderStatus.FINISHED
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
                    id: 2,
                    type: ChoiceType.RADIO,
                    valueId: [2]
                }
            }
        ],
        PaymentStatus: {
            status: 'received',
            transactionId: 'xeN97BA1P6',
            amount: 10
        },
        Status: OrderStatus.IN_PROGRESS
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa2',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa2',
        items: [],
        PaymentStatus: {
            status: 'received',
            transactionId: 'xeN97BA1P6',
            amount: 10
        },
        Status: OrderStatus.RECEIVED
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa3',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa3',
        items: [],
        PaymentStatus: {
            status: 'received',
            transactionId: 'xeN97BA1P6',
            amount: 10
        },
        Status: OrderStatus.RETURNED
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa4',
        tableId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        items: [],
        PaymentStatus: {
            status: 'received',
            transactionId: 'xeN97BA1P6',
            amount: 10
        },
        Status: OrderStatus.RECEIVED
    }
];

const uniqueOrder = {
    _id: 'aaaaaaaaaaaaaaaaaaaaaa69',
    tableId: 'aaaaaaaaaaaaaaaaaaaaaaa0',
    items: [],
    PaymentStatus: {
        status: 'pending',
        transactionId: 'xeN97BA1P6',
        amount: 5
    },
    Status: OrderStatus.FINISHED
};

export const getUniqueOrder = () => {
    return uniqueOrder;
};

export const getTestOrderData = () => {
    return orderMockData;
};

export const getActiveOrders = () => {
    return orderMockData.filter(
        (order) =>
            order.Status === OrderStatus.RECEIVED ||
            order.Status === OrderStatus.IN_PROGRESS ||
            order.Status === OrderStatus.RETURNED
    );
};
