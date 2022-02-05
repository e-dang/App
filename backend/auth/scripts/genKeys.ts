import * as jose from "jose";
import fs from "fs";

async function genKeys(alg: string) {
  const {publicKey, privateKey} = await jose.generateKeyPair(alg, {crv: "Ed448"});
  const pkcs8Pem = await jose.exportPKCS8(privateKey);
  const spkiPem = await jose.exportSPKI(publicKey);
  fs.writeFileSync("access_token_private", pkcs8Pem);
  fs.writeFileSync("access_token_public", spkiPem);
}

async function genSecret(alg: string) {
  const secret = await jose.generateSecret(alg);
  const jwk = await jose.exportJWK(secret);
  fs.writeFileSync("refresh_token_secret", jwk.k);
}

/* eslint-disable no-void */
void genKeys("EdDSA");
void genSecret("HS512");
