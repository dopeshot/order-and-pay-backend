import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { CategoryPopulated } from '../categories/entities/category.entity';
import { DishesService } from '../dishes/dishes.service';
import { DishPopulated } from '../dishes/entities/dish.entity';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument, MenuPopulated } from './entities/menu.entity';
import { Status } from './enums/status.enum';

@Injectable()
export class MenusService {
    private readonly logger = new Logger(MenusService.name);
    constructor(
        @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
        private readonly categoriesService: CategoriesService,
        private readonly dishesService: DishesService
    ) {}

    async findAll(): Promise<Menu[]> {
        return await this.menuModel.find({ status: Status.ACTIVE }).lean();
    }

    async createMenu(createMenuDto: CreateMenuDto): Promise<MenuDocument> {
        try {
            const menu = await this.menuModel.create(createMenuDto);

            if (menu.isActive) {
                await this.updateActivation(menu._id);
            }

            this.logger.debug(
                `The menu (id = ${menu._id}) has been created successfully.`
            );
            // There is no other way remove unwanted fields without toObject()
            return menu.toObject() as MenuDocument;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.title) {
                this.logger.warn(
                    `Creating a menu (title = ${createMenuDto}) failed due to a conflict.`
                );
                throw new ConflictException(
                    'A menu with this name already exists'
                );
            }

            /* istanbul ignore next */
            this.logger.error(
                `An error has occured while creating a new menu (${error})`
            );
            /* istanbul ignore next */ // Unable to test Internal server error here
            throw new InternalServerErrorException();
        }
    }

    async findOne(id: ObjectId): Promise<MenuDocument> {
        const menu: MenuDocument = await this.menuModel.findById(id).lean();

        if (!menu) {
            this.logger.debug(
                `A menu (id = ${id}) was requested but could not be found.`
            );
            throw new NotFoundException();
        }

        return menu;
    }

    async findCurrent(): Promise<MenuDocument> {
        const current = await this.menuModel.findOne({ isActive: true });

        if (!current) {
            throw new NotFoundException('No current menu found');
        }

        return current;
    }

    async updateMenu(
        id: ObjectId,
        updateMenuDto: UpdateMenuDto
    ): Promise<Menu> {
        let updatedMenu: Menu;

        try {
            updatedMenu = await this.menuModel
                .findByIdAndUpdate(id, updateMenuDto, {
                    new: true
                })
                .lean();
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.title) {
                this.logger.warn(
                    `Updating a menu (title = ${updateMenuDto}) failed due to a conflict.`
                );
                throw new ConflictException(
                    'A menu with this name already exists'
                );
            }

            /* istanbul ignore next */
            this.logger.error(
                `An error has occured while updating a menu (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException('Menu update failed');
        }

        if (!updatedMenu) {
            this.logger.warn(
                `Updating menu (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException('Menu not found');
        }
        if (updatedMenu.isActive) {
            this.logger.log(
                `Update of menu ${updatedMenu.title} has altered activation status`
            );
            await this.updateActivation(id);
        }

        this.logger.debug(
            `The menu (id = ${id}) has been created successfully.`
        );
        return updatedMenu;
    }

    async updateActivation(excludeId: ObjectId) {
        this.logger.debug(`Updating activation for menus`);
        //Disable all but the given Menu
        await this.menuModel.updateMany(
            {
                isActive: true,
                _id: { $ne: excludeId }
            },
            {
                isActive: false
            }
        );
    }

    async deleteMenu(id: ObjectId, type: DeleteType): Promise<void> {
        // Default to soft delete
        if (!type) type = DeleteType.SOFT;

        // Hard delete
        if (type === DeleteType.HARD) {
            const menu: MenuDocument = await this.menuModel.findByIdAndDelete(
                id
            );

            if (!menu) {
                this.logger.warn(
                    `Deleting menu (id = ${id}) failed as it could not be found.`
                );
                throw new NotFoundException();
            }
            this.logger.debug(
                `The menu (id = ${id}) has been deleted successfully.`
            );
            await this.categoriesService.recursiveRemoveByMenu(id);
            return;
        }

        // Soft delete
        const menu: MenuDocument = await this.menuModel.findByIdAndUpdate(id, {
            status: Status.DELETED,
            isActive: false
        });

        if (!menu) {
            this.logger.warn(
                `Deleting menu (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(
            `The menu (id = ${id}) has been soft deleted successfully.`
        );

        return;
    }

    async findAndPopulate(id: ObjectId): Promise<MenuPopulated> {
        const menu: MenuDocument = await this.menuModel.findById(id).lean();

        if (!menu) throw new NotFoundException();

        const categories = await this.categoriesService.findByMenu(id);

        const populated: CategoryPopulated[] = await Promise.all(
            categories.map(async (category) => {
                const dishes: DishPopulated[] = await (
                    await this.dishesService.findByCategoryAndPopulate(
                        category._id
                    )
                ).filter((dish) => dish.status !== Status.DELETED);
                return { ...category, dishes };
            })
        );

        return { ...menu, categories: populated || [] };
    }

    async findCategories(id: ObjectId) {
        return await this.categoriesService.findByMenu(id);
    }
}
