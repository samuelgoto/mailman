const {send} = require("./client.js");

async function main() {
  const result = await send({
    from: "me@code.sgo.to", 
    to: "samuelgoto@gmail.com", 
    text: "pong", 
    subject: "pong"
  });
  console.log(result);
}

main();
