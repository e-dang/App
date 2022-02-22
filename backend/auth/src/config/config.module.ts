import {DynamicModule, Module} from "@nestjs/common";
import {ClassConstructor} from "class-transformer";
import {register} from "./validate";

@Module({})
export class ConfigModule {
  static forFeature<T extends object>(configService: ClassConstructor<T>): DynamicModule {
    return {
      module: ConfigModule,
      providers: [register("", configService)],
      exports: [configService],
    };
  }
}
