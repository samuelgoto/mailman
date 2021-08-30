const openpgp = require("openpgp");
const Assert = require("assert");

const {
  createNewServiceKey,
  onion_public_key_from_expanded_key,
  onion_service_address_for_public_key,
  onion_service_public_key_form_id,
  onion_service_id_for_public_key,
} = require("p2pnap/lib/util.js")

async function publicKeyToEmail(publicKey) {
  const key = await openpgp.readKey({armoredKey: publicKey});
  
  // console.log(await key.getEncryptionKey());
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

  // pubKey
  const result = onion_service_id_for_public_key(bytes);

  Assert.deepEqual(
    Buffer.from(bytes),
    onion_service_public_key_form_id(result));

  return {name: result, email: result + "@dht.onion"};
}

async function keyPair(password) {
  const result = await openpgp.generateKey({
    userIDs: [{
      name: "TBD",
      email: "tbd@tbd.example"
    }],
    curve: "ed25519",
    passphrase: password,
  });
    
  // const {publicKey, privateKey} = result;
  
  const {name, email} = await publicKeyToEmail(result.publicKey);
    
  const pKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({
      armoredKey: result.privateKey}),
    passphrase: password
  });

  const {publicKey, privateKey} = await openpgp.reformatKey({
    privateKey: pKey,
    userIDs: [{
      name: name,
      email: email
    }],
    passphrase: password
  });

  return {
    publicKey: await openpgp.readKey({armoredKey: publicKey}),
    privateKey: await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: privateKey}),
      passphrase: password
    })
  };
}

async function descriptor({privateKey}) {
  const metadata = {
    hello: "world"
  };
  
  const message = await openpgp.createCleartextMessage({
    text: JSON.stringify(metadata, undefined, 2)
  });

  return await openpgp.sign({
    message: message,
    signingKeys: privateKey
  });
}

async function compose(from, to, message) {
  const {publicKey} = from;
  const {privateKey} = to;
  return await openpgp.encrypt({
    message: await openpgp.createMessage({text: message}),
    encryptionKeys: publicKey,
    signingKeys: privateKey
  });
}

async function read(message, from, to) {
  const {publicKey} = from;
  const {privateKey} = to;
  const received = await openpgp.readMessage({
    armoredMessage: message
  });
  
  const {data: decrypted, signatures} = await openpgp.decrypt({
    message: received,
    verificationKeys: publicKey,
    decryptionKeys: privateKey
  });

  if (signatures.length == 0) {
    return decrypted;
  }

  // check signature validity (signed messages only)
  try {
    await signatures[0].verified; // throws on invalid signature
  } catch (e) {
    throw new Error('Signature could not be verified: ' + e.message);
  }
  
  return decrypted;
}

describe("OpenPGP", () => {
  it.only("Send and receive", async () => {
    const alice = await keyPair("foo");
    const bob = await keyPair("bar");
    
    const entry = await descriptor(alice);

    const {data} = await openpgp.verify({
      message: await openpgp.readCleartextMessage({cleartextMessage: entry}),
      verificationKeys: alice.publicKey
    });

    Assert.deepEqual({"hello": "world"}, JSON.parse(data));
    
    const message = `hello world`;

    const email = await compose(alice, bob, message);

    const received = await read(email, bob, alice);

    Assert.deepEqual(message, received);

  });
});
