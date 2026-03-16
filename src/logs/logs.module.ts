import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
    controllers: [LogsController],
    providers: [LogsService, LoggingInterceptor],
    exports: [LogsService, LoggingInterceptor],
})
export class LogsModule { }