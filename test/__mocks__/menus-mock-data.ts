import { Status } from '../../src/menus/enums/status.enum';

export const getMenuSeeder = () => [
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa0',
        isActive: true,
        title: 'test0',
        description: 'The first menu',
        status: Status.ACTIVE
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa1',
        isActive: true,
        title: 'test1',
        description: 'The second menu',
        status: Status.ACTIVE
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa2',
        isActive: true,
        title: 'test2',
        description: 'The third menu',
        status: Status.ACTIVE
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa3',
        isActive: true,
        title: 'test3',
        description: 'The fourth menu',
        status: Status.ACTIVE
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa4',
        isActive: true,
        title: 'test4',
        description: 'The fifth menu',
        status: Status.ACTIVE
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa5',
        isActive: true,
        title: 'test5',
        description: 'another menu',
        status: Status.ACTIVE
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa6',
        isActive: true,
        title: 'test6',
        description: 'the seventh menu',
        status: Status.DELETED
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa7',
        isActive: false,
        title: 'test7',
        description: 'the eigth menu',
        status: Status.DELETED
    },
    {
        _id: 'aaaaaaaaaaaaaaaaaaaaaaa8',
        isActive: false,
        title: 'test8',
        description: 'this is also a menu',
        status: Status.ACTIVE
    }
];

export const getValidMenus = () => {
    return getMenuSeeder().filter((menu) => menu.status === Status.ACTIVE);
};

export const getCategoryForMenu = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaab',
    title: 'Burger',
    description: 'Bread with stuff in between',
    icon: 'burger',
    image: 'burger',
    menuId: getMenuSeeder()[0]._id
});

export const getDishForMenu = () => ({
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    title: 'Awesome Burger',
    description: 'Burger made by an awesome chef',
    price: 950,
    image: 'imagelink',
    isAvailable: true,
    categoryId: getCategoryForMenu()._id,
    allergenIds: ['aaaaaaaaaaaaaaaaaaaaaaca', 'aaaaaaaaaaaaaaaaaaaaaacb'],
    labelIds: ['aaaaaaaaaaaaaaaaaaaaaada', 'aaaaaaaaaaaaaaaaaaaaaadb']
});
