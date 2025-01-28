import { SetMetadata } from '@nestjs/common';

export const SetMessage = (message: string) => SetMetadata('message', message);
