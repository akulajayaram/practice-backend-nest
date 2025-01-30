import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SendResetPasswordOtpDto,
  SendRegistrationUrlDto,
} from '../auth/interfaces/send-mail.interface';
// import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(
    // private readonly mailerService: MailerService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    // Queue the email job
    await this.emailQueue.add('sendEmail', {
      to,
      subject: 'Welcome to Our Service',
      template: './welcome',
      context: { name },
    });

    // // Optional: Send email directly using MailerService if needed
    // await this.mailerService.sendMail({
    //   to,
    //   subject: 'Welcome to Our Service',
    //   template: './welcome',
    //   context: { name },
    // });
  }

  async sendRegistrationUrl(emailData: SendRegistrationUrlDto): Promise<void> {
    // Queue the email job
    await this.emailQueue.add('sendEmail', {
      to: emailData.to,
      subject: 'Account Activation',
      template: './otp',
      context: {
        name: emailData.context.name,
        activationUrl: emailData.context.activationUrl,
      },
    });
  }

  async sendResetPasswordOtp(
    emailData: SendResetPasswordOtpDto,
  ): Promise<void> {
    await this.emailQueue.add('sendEmail', {
      to: emailData.to,
      subject: 'Account Activation',
      template: './otp',
      context: {
        name: emailData.context.name,
        otp: emailData.context.otp,
      },
    });
  }
}
