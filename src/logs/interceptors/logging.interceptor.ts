import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Request, Response } from 'express';
import { LogsService } from '../logs.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private logsService: LogsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();

        const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
        const correlationId = req.headers['x-correlation-id'] as string | undefined;
        const startTime = Date.now();

        req['requestId'] = requestId;

        const userId = (req.user as { id?: string })?.id;
        const endpoint = `${req.method} ${req.path}`;
        const service = req.path.split('/')[2] ?? 'api';

        return next.handle().pipe(
            tap(() => {
                const statusCode = res.statusCode;
                const responseTimeMs = Date.now() - startTime;

                if (req.path.includes('/health')) return;

                this.logsService.createInternal({
                    level: statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO',
                    service,
                    message: `${endpoint} — ${statusCode} (${responseTimeMs}ms)`,
                    requestId,
                    correlationId,
                    userId,
                    endpoint,
                    statusCode,
                    metadata: { responseTimeMs, method: req.method },
                });
            }),
            catchError((error) => {
                const responseTimeMs = Date.now() - startTime;

                this.logsService.createInternal({
                    level: 'ERROR',
                    service,
                    message: `${endpoint} — ERRO: ${error.message}`,
                    requestId,
                    correlationId,
                    userId,
                    endpoint,
                    statusCode: error.status ?? 500,
                    metadata: {
                        responseTimeMs,
                        method: req.method,
                        errorName: error.name,
                    },
                });

                return throwError(() => error);
            }),
        );
    }
}