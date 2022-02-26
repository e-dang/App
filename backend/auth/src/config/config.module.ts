import {DynamicModule, FactoryProvider, Module} from "@nestjs/common";
import fs from "fs";
import path from "path";

export interface ConfigModuleOptions {
  load: ConfigProviderFactory[];
  isGlobal: boolean;
  configDir: string;
}

export type ConfigProviderFactory = (config: Record<string, unknown>) => FactoryProvider;

@Module({})
export class ConfigModule {
  static forRoot(options: ConfigModuleOptions): DynamicModule {
    const configs = ConfigModule.getRawConfigs(options.configDir);
    const providers = options.load.map((factory) => factory(configs));
    const exports = providers.map((provider) => provider.provide);
    return {
      module: ConfigModule,
      global: options.isGlobal,
      providers,
      exports,
    };
  }

  private static readMountedConfigs(dirpath: string) {
    const configs: Record<string, unknown> = {};

    if (!fs.existsSync(dirpath)) {
      return configs;
    }

    const files = fs.readdirSync(dirpath, {encoding: "utf-8"});
    for (const file of files) {
      const filepath = path.join(dirpath, file);
      const fileStats = fs.lstatSync(filepath);
      if ((fileStats.isFile() || fileStats.isSymbolicLink()) && file.substr(0, 2) !== "..") {
        configs[file] = fs.readFileSync(filepath, {encoding: "utf-8"}).toString();
      }
    }

    return configs;
  }

  static getRawConfigs(dirpath: string) {
    return {...process.env, ...ConfigModule.readMountedConfigs(dirpath)};
  }
}
