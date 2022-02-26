// import config from "@config";
import {Module} from "@nestjs/common";
import {PasswordHasherConfig} from "@src/config/password-hasher.config";
import {Algorithm} from "./algorithms/algorithm";
import {PBKDF2} from "./algorithms/pbkdf2";
import {ALGORITHMS, ALGORITHM} from "./constants";
import {PasswordHasherService} from "./password-hasher.service";

@Module({
  providers: [
    {
      provide: ALGORITHMS,
      useFactory: (...algorithms: Algorithm[]) => {
        const algMap: Record<string, Algorithm> = {};

        algorithms.forEach((alg) => {
          algMap[alg.name] = alg;
        });

        return algMap;
      },
      inject: [PBKDF2],
    },
    {
      provide: ALGORITHM,
      useFactory: (algorithms: Record<string, Algorithm>, config: PasswordHasherConfig) => {
        return algorithms[config.passwordHasher];
      },
      inject: [ALGORITHMS, PasswordHasherConfig],
    },
    PasswordHasherService,
    PBKDF2,
  ],
  exports: [PasswordHasherService],
})
export class PasswordHasherModule {}
