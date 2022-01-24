import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMenuDto } from './create-menu.dto';

export class UpdateMenuDto extends CreateMenuDto {
    @IsBoolean()
    @IsOptional()
    isAvailable: boolean;
}
