export const ALGORITHM = Symbol("ALGORITHM");
export const ALGORITHMS = Symbol("ALGORITHMS");

export enum PasswordHasherAlgorithms {
  PBKDF2 = "pbkdf2",
}

export enum PBKDF2Digest {
  sha512 = "sha512",
}
