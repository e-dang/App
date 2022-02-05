/* eslint-disable no-console */
import * as jose from "jose";

async function genKeys(alg: string) {
  const {publicKey, privateKey} = await jose.generateKeyPair(alg, {crv: "Ed448"});
  const pkcs8Pem = await jose.exportPKCS8(privateKey);
  const spkiPem = await jose.exportSPKI(publicKey);
  console.log(pkcs8Pem);
  console.log(spkiPem);
}

genKeys("EdDSA").catch((err) => console.log(err));
