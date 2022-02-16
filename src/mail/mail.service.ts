import {
    Injectable,
    Logger,
    ServiceUnavailableException
} from '@nestjs/common';
import { render } from 'ejs';
import { readFile as _readFile } from 'fs';
import * as nodemailer from 'nodemailer';
import { promisify } from 'util';
import { LabelsService } from '../labels/labels.service';

const readFile = promisify(_readFile);

@Injectable()
export class MailService {
    mailTransport: nodemailer.Transporter<any>;
    maxRetries: number;
    errorDelay: number;
    private readonly logger = new Logger(LabelsService.name);

    constructor() {
        this.mailTransport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_HOST_PORT),
            pool: true,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
        this.maxRetries = parseInt(process.env.MAX_MAIL_RETRIES);
        this.errorDelay = parseInt(process.env.MAIL_ERROR_DELAY);
    }

    private async passToMailserver(
        recipient: string,
        subject: string,
        message: string
    ): Promise<void> {
        // Sleep helper func
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        let attempts = 0;
        while (attempts < this.maxRetries) {
            try {
                await this.mailTransport.sendMail({
                    to: recipient,
                    from: process.env.MAIL_ADRESS,
                    subject: subject,
                    html: message
                });
            } catch (e) {
                attempts++;
                await delay(this.errorDelay);
                continue;
            }
            // This might be a bit broad of a log, but this is the only log that does not contain sensitive data
            this.logger.debug(`An email has been send successfully`);
            return;
        }
        this.logger.error(
            `A connection to the mailserver could not be established`
        );
        // getting here means sending the mail is not possible => throw an error
        throw new ServiceUnavailableException(
            'Unable to connect to mailserver'
        );
    }

    async sendMail<T>(
        recipient: string,
        template: string,
        mailData: T,
        subject: string
    ): Promise<void> {
        const mailTemplate = await readFile(
            __dirname + '/templates/' + template + '.ejs',
            'utf-8'
        );
        const mailContent = render(mailTemplate, mailData as any);
        this.logger.debug(`Template: ${template} has been rendered`);
        await this.passToMailserver(recipient, subject, mailContent);
    }
}
