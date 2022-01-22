import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema } from 'mongoose';
import { DeleteType } from '../admin/enums/delete-type.enum';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument } from './entities/menu.entity';
import { Status } from './enums/status.enum';

@Injectable()
export class MenuService {
    constructor(@InjectModel('Menu') private menuModel: Model<MenuDocument>) {}

    async findAll(): Promise<Menu[]> {
        return await this.menuModel.find({ status: Status.ACTIVE }).lean();
    }

    async createMenu(createMenuDto: CreateMenuDto): Promise<MenuDocument> {
        try {
            const menu = await this.menuModel.create({
                ...createMenuDto
            });

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

    async updateMenu(
        id: ObjectId,
        updateMenuDto: UpdateMenuDto
    ): Promise<Menu> {
        let updatedMenu: Menu;

        try {
            updatedMenu = await this.menuModel
                .findByIdAndUpdate(
                    id,
                    {
                        ...updateMenuDto
                    },
                    {
                        new: true
                    }
                )
                .lean();
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.title)
                throw new ConflictException(
                    'A menu with this name already exists'
                );
            else throw new InternalServerErrorException('Menu update failed');
        }

        if (!updatedMenu) throw new NotFoundException('Menu not found');

        return updatedMenu;
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
            status: Status.DELETED
        });

        if (!menu) throw new NotFoundException();

        return;
    }
}
