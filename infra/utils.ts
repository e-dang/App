import * as pulumi from "@pulumi/pulumi";
import {execSync} from "child_process";
import {load} from "js-yaml";

interface RawDecryptedSecret {
  [x: string]: string;
}

// Work around of typescript stupidity
// https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function/64840774#answer-64840774
export const wrapperPulumiSecret = (val: pulumi.Input<string>) => pulumi.secret<string>(val);
export type PulumiSecret = ReturnType<typeof wrapperPulumiSecret>;

export interface DecryptedSecret {
  [x: string]: PulumiSecret;
}

export function decryptSopsFile<T extends DecryptedSecret>(filepath: string) {
  const yamlOutput = load(execSync(`sops -d ${filepath}`).toString()) as RawDecryptedSecret;
  const secretOutput: DecryptedSecret = {};
  for (const key of Object.keys(yamlOutput)) {
    secretOutput[key] = pulumi.secret(yamlOutput[key]);
  }
  return secretOutput as T;
}
