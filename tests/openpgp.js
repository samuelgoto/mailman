const openpgp = require("openpgp");
const Assert = require("assert");

const {
  createNewServiceKey,
  onion_public_key_from_expanded_key,
  onion_service_address_for_public_key,
  onion_service_public_key_form_id
} = require("p2pnap/lib/util.js")

describe("OpenPGP", () => {
  it.only("Send and receive", async () => {

    const password = "foobar";
    
    const result = await openpgp.generateKey({
      userIDs: [{
        name: "person",
        email: "person@somebody.com"
      }],
      curve: "ed25519",
      passphrase: password,
    });

    // console.log(result);
    
    const {publicKey, privateKey} = result;

    const message = `hello world`;

    // console.log(publicKey);
    
    const key = await openpgp.readKey({armoredKey: publicKey});

    //console.log(await key.getEncryptionKey());
    // console.log();
    const primaryKey = await key.getEncryptionKey();

    const signingKey = await primaryKey.mainKey.getSigningKey();

    //console.log(signingKey.getAlgorithmInfo());
    // https://github.com/openpgpjs/openpgpjs/blob/master/src/crypto/public_key/elliptic/curves.js#L212
    // https://github.com/openpgpjs/openpgpjs/blob/master/src/crypto/public_key/elliptic/curves.js#L193
    // Q is the Uint8Array containing the public key.
    // console.log(signingKey.keyPacket.publicParams.Q);

    // Removes the first 0x40 byte from the public key which PGP uses
    // as a prefix to indicate it isn't using point compression
    // (and thus becoming 33 bytes).
    // https://crypto.stackexchange.com/questions/66415/libsodium-vs-gnupg-curve25519-compatibility
    const bytes = signingKey.keyPacket.publicParams.Q.subarray(1);
    // console.log(bytes);

    const pKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: privateKey }),
      passphrase: password
    });

    console.log(pKey.getAlgorithmInfo());
    console.log(pKey.keyPacket.privateParams.seed);

    // const secretKey = createNewServiceKey();
    //console.log(secretKey);
    // const pubKey = onion_public_key_from_expanded_key(secretKey);
    // console.log(pubKey);
    const serviceId = onion_service_address_for_public_key(bytes);
    // console.log(serviceId);
    //console.log(onion_service_public_key_form_id(serviceId));
    // console.log(Buffer.from(bytes));
    Assert.deepEqual(
      Buffer.from(bytes),
      onion_service_public_key_form_id(serviceId));

    
    //console.log(signingKey.toPublic());
    
    //const str = signingKey.getFingerprint();
    //console.log(str.length);
    //const fingerprint = new Uint8Array(str.length);
    //for (let i = 0; i < str.length; i++) {
    //  fingerprint[i] = str.charCodeAt(i);
    //}
    // return result;
    //console.log(fingerprint);
    
    // https://datatracker.ietf.org/doc/html/rfc4880#section-3.3    
    //const keyId = primaryKey.keyPacket.keyID.write();
    //console.log(keyId.length);
    //const serviceId = onion_service_address_for_public_key(keyId);

    //console.log(serviceId);
    
    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({text: message}),
      encryptionKeys: await openpgp.readKey({armoredKey: publicKey}),
      signingKeys:  await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({
          armoredKey: privateKey }),
        passphrase: password
      })
    });

    const received = await openpgp.readMessage({
      armoredMessage: encrypted // parse armored message
    });

    const {data: decrypted, signatures} = await openpgp.decrypt({
      message: received,
      verificationKeys: await openpgp.readKey({armoredKey: publicKey}),
      decryptionKeys: await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({
          armoredKey: privateKey }),
        passphrase: password
      })
    });

    Assert.deepEqual(message, decrypted);

    // check signature validity (signed messages only)
    try {
      await signatures[0].verified; // throws on invalid signature
    } catch (e) {
      throw new Error('Signature could not be verified: ' + e.message);
    }
  });
});
