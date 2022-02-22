export abstract class Algorithm {
  public static readonly separator = "$";

  public abstract get name(): string;

  abstract hashPassword(password: string): string;

  abstract passwordIsValid(password: string, storedPassword: string): boolean;

  protected joinPassword(alg: string, ...args: (number | string)[]) {
    return [alg, ...args].join(Algorithm.separator);
  }

  protected parsePassword(storedPassword: string) {
    return storedPassword.split(Algorithm.separator);
  }

  public parseAlgorithm(storedPassword: string) {
    return this.parsePassword(storedPassword)[0];
  }
}
