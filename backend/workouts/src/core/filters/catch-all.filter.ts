import {Catch, ArgumentsHost, Logger} from "@nestjs/common";
import {BaseExceptionFilter} from "@nestjs/core";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    this.logger.error(exception.message, exception.stack);

    // eslint-disable-next-line promise/valid-params
    super.catch(exception, host); // eslint being dumb and thinking this is promise...
  }
}
