import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema } from 'mongoose';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument } from './entities/menu.entity';
import { Status } from './enums/status.enum';

@Injectable()
export class MenusService {
    private readonly logger = new Logger(MenusService.name);
    constructor(@InjectModel('Menu') private menuModel: Model<MenuDocument>) {}

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
            if (error.code === 11000 && error.keyPattern.title) {
                this.logger.debug(
                    `Creating a menu (title = ${createMenuDto}) failed due to a conflict.`
                );
                throw new ConflictException(
                    'A menu with this name already exists'
                );
            }

            this.logger.error(
                `An error has occured while creating a new menu (${error})`
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
                this.logger.debug(
                    `Updating a menu (title = ${updateMenuDto}) failed due to a conflict.`
                );
                throw new ConflictException(
                    'A menu with this name already exists'
                );
            }
            this.logger.error(
                `An error has occured while updating a menu (${error})`
            );
            throw new InternalServerErrorException('Menu update failed');
        }

        if (!updatedMenu) throw new NotFoundException('Menu not found');

        if (updatedMenu.isActive) {
            this.logger.log(
                `Update of menu ${updatedMenu.title} has altered activation status`
            );
            await this.updateActivation(id);
        }
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

            this.logger.debug(
                `The menu (id = ${id}) has been deleted successfully.`
            );
            return;
        }

        // Soft delete
        const menu: MenuDocument = await this.menuModel.findByIdAndUpdate(id, {
            status: Status.DELETED,
            isActive: false
        });

        if (!menu) throw new NotFoundException();

        this.logger.debug(
            `The menu (id = ${id}) has been soft deleted successfully.`
        );

        return;
    }
}
