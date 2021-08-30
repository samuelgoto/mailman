const {
  createNewServiceKey,
  onion_public_key_from_expanded_key,
  onion_service_address_for_public_key,
  onion_service_public_key_form_id
} = require("p2pnap/lib/util.js")

const Assert = require("assert");

describe("onion", () => {
  it("v3 addresses", async () => {
    const secretKey = createNewServiceKey();
    //console.log(secretKey);
    const pubKey = onion_public_key_from_expanded_key(secretKey);
    // console.log(pubKey);
    const serviceId = onion_service_address_for_public_key(pubKey);
    Assert.deepEqual(
      pubKey,
      onion_service_public_key_form_id(serviceId));
  });
});
