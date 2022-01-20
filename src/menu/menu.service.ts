import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument } from './entities/menu.entity';
import { Status } from './enums/status.enum';

@Injectable()
export class MenuService {
    constructor(@InjectModel('Menu') private menuSchema: Model<MenuDocument>) {}

    async findAll(): Promise<Menu[]> {
        return await this.menuSchema.find({ status: Status.ACTIVE }).lean();
    }

    async createMenu(createMenuDto: CreateMenuDto): Promise<MenuDocument> {
        try {
            const menu = await this.menuSchema.create({
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
        id: Schema.Types.ObjectId,
        updateMenuDto: UpdateMenuDto
    ): Promise<Menu> {
        let updatedMenu: Menu;

        try {
            updatedMenu = await this.menuSchema
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
}
