import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Response} from "../types";

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((data: T) => ({data})));
  }
}
