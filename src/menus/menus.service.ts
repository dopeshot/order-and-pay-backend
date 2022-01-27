import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { PopulatedCategory } from '../categories/entities/category.entity';
import { DishesService } from '../dishes/dishes.service';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument, PopulatedMenu } from './entities/menu.entity';
import { Status } from './enums/status.enum';

@Injectable()
export class MenusService {
    constructor(
        @InjectModel('Menu') private menuModel: Model<MenuDocument>,
        private readonly categoriesService: CategoriesService,
        private readonly dishesService: DishesService
    ) {}

    async findAll(): Promise<Menu[]> {
        return await this.menuModel.find({ status: Status.ACTIVE }).lean();
    }

    async createMenu(createMenuDto: CreateMenuDto): Promise<MenuDocument> {
        try {
            const menu = await this.menuModel.create({
                ...createMenuDto
            });

            if (menu.isActive) {
                await this.updateActivation(menu._id);
            }

            // There is no other way remove unwanted fields without toObject()
            return menu.toObject() as MenuDocument;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.title)
                throw new ConflictException(
                    'A menu with this name already exists'
                );

            /* istanbul ignore next */ // Unable to test Internal server error here
            throw new InternalServerErrorException();
        }
    }

    async findOne(id: string): Promise<MenuDocument> {
        const menu: MenuDocument = await this.menuModel.findById(id).lean();

        if (!menu) {
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
            if (error.code === 11000 && error.keyPattern.title)
                throw new ConflictException(
                    'A menu with this name already exists'
                );
            else throw new InternalServerErrorException('Menu update failed');
        }

        if (!updatedMenu) throw new NotFoundException('Menu not found');

        if (updatedMenu.isActive) {
            await this.updateActivation(id);
        }

        return updatedMenu;
    }

    async updateActivation(excludeId: ObjectId) {
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

    async deleteMenu(
        id: Schema.Types.ObjectId,
        type: DeleteType
    ): Promise<void> {
        // Default to soft delete
        if (!type) type = DeleteType.SOFT;

        // Hard delete
        if (type === DeleteType.HARD) {
            // Coffee TODO: Maybe deleting the reference to this menu in dishes, categories, etc. should  be added as well
            const menu: MenuDocument = await this.menuModel.findByIdAndDelete(
                id
            );

            if (!menu) throw new NotFoundException();

            return;
        }

        // Soft delete
        const menu: MenuDocument = await this.menuModel.findByIdAndUpdate(id, {
            status: Status.DELETED,
            isActive: false
        });

        if (!menu) throw new NotFoundException();

        return;
    }

    async findAndPopulate(id: string): Promise<PopulatedMenu> {
        const menu: MenuDocument = await this.menuModel.findById(id).lean();

        if (!menu) throw new NotFoundException();

        const categories = await this.categoriesService.findByMenu(id);

        const populated: PopulatedCategory[] = [];
        for (const category of categories) {
            const dishes = await this.dishesService.findByCatgoryAndPopulate(
                category._id
            );
            populated.push({ ...category, dishes });
        }

        return { ...menu, categories: populated };
    }

    async getRefs(id: string) {
        return await this.categoriesService.findByMenu(id);
    }
}
