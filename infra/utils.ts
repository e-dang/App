import {execSync} from 'child_process';

export function decryptSopsFile(filepath: string) {
    const output = execSync(`sops -d ${filepath}`).toString();
    return output;
}
