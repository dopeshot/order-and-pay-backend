import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ENVGuard } from '../auth/strategies/env/environment.guard';
import { MailTestDto } from './dto/mail-test.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    // This is an endpoint sorely meant to be used for testing purposes.
    // Disable this once done testing or delete the controller enturely
    @Post()
    @UseGuards(ENVGuard)
    async sendMail(@Body('recipient') recipient: string) {
        return await this.mailService.sendMail<MailTestDto>(
            recipient,
            'test',
            { data: 'this is a dummy endpoint' } as MailTestDto,
            'test'
        );
    }
}
