import { IsString, Length } from 'class-validator';

export class CreateLabelDto {
    @IsString()
    @Length(2, 20)
    title: string;

    @IsString()
    @Length(2, 50)
    icon: string;
}
