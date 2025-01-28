import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"${configService.get<string>('MAIL_FROM_NAME')}" <${configService.get<string>('MAIL_FROM_ADDRESS')}>`,
        },
        template: {
          dir: process.cwd() + '/templates/',
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
