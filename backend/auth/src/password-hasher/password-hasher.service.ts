import {Inject, Injectable} from "@nestjs/common";
import {Algorithm} from "./algorithms/algorithm";
import {ALGORITHM, ALGORITHMS} from "./constants";

@Injectable()
export class PasswordHasherService {
  constructor(
    @Inject(ALGORITHM) private readonly alg: Algorithm,
    @Inject(ALGORITHMS) private readonly algs: Record<string, Algorithm>,
  ) {}

  hashPassword(password: string) {
    return this.alg.hashPassword(password);
  }

  passwordIsValid(password: string, storedPassword: string) {
    const alg = this.alg.parseAlgorithm(storedPassword);
    return this.algs[alg].passwordIsValid(password, storedPassword);
  }
}
