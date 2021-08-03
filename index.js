const {SMTPServer} = require("smtp-server");
const {simpleParser} = require("mailparser");
const {send} = require("./client");
const express = require("express");

const queue = [];

function log(message) {
  queue.push(message);
}

const smtp = new SMTPServer({
  onData(stream, session, callback) {
    stream.on("end", callback);
    simpleParser(stream, {}, async (err, parsed) => {
      if (err) {
        reject(err);
      }
      // console.log("Received!");
      const {from, to, subject, text} = parsed;
      const {value: [{address: sender}]} = from;
      const {value: [{address: receiver}]} = to;
      log(`Got mail!`);
      log(`From: ${sender}`);
      log(`To: ${receiver}`);
      log(`Sub: ${subject}`);
      log(`${text}`);

      const email = {
        from: "me@code.sgo.to",
        to: sender,
        subject: "pong",
        text: "pong"
      };

      const reply = await send(email);
      
      log(`Replying`);
      log(reply);
    })
  },
  disabledCommands: ['AUTH']
});

smtp.on("error", (e) => {
  log(e);
});

smtp.listen(25);

const http = express();

http.get("/", (req, res) => {
  res.send("log: " + queue.join("\n") + ". done.");
})

http.listen(80, () => {
})

console.log(`Listening to smtp and http.`);
