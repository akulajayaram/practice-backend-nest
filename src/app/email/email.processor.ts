import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('email')
export class EmailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('sendEmail')
  async handleSendEmail(job: Job): Promise<void> {
    const { to, subject, template, context } = job.data;
    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
}
