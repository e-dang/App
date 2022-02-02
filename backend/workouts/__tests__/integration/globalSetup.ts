import * as jose from "jose";

export default async () => {
  // set NODE_ENV to test in case it was set to something else by Docker
  process.env.NODE_ENV = "test";

  // generate accessToken keys for integration testing
  const {publicKey, privateKey} = await jose.generateKeyPair("EdDSA", {crv: "Ed448"});
  const pkcs8Pem = await jose.exportPKCS8(privateKey);
  const spkiPem = await jose.exportSPKI(publicKey);
  process.env.accessTokenPrivateKey = pkcs8Pem;
  process.env.accessTokenPublic = spkiPem;
};
