import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
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

  async sendRegistrationOtp(emailData): Promise<void> {
    // Queue the email job
    await this.emailQueue.add('sendEmail', {
      to:emailData.to,
      subject: 'User Registration',
      template: './otp',
      context: { activationUrl },
    });
  }

  async sendForgotPasswordEmail(to: string, resetLink: string): Promise<void> {
    // Queue the email job
    await this.emailQueue.add('sendEmail', {
      to,
      subject: 'Password Reset Request',
      template: './forgot-password',
      context: { resetLink },
    });
  }
}
