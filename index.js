const {SMTPServer} = require("smtp-server");
const {simpleParser} = require("mailparser");

const server = new SMTPServer({
  onData(stream, session, callback) {
    stream.on("end", callback);
    simpleParser(stream, {}, (err, parsed) => {
      if (err) {
        reject(err);
      }

      // console.log("Received!");
      const {from, to, subject, text} = email;
      const {value: [{address: sender}]} = from;
      const {value: [{address: receiver}]} = to;

      console.log(`From: ${sender}`);
      console.log(`To: ${receiver}`);
      console.log(`Sub: ${subject}`);
      console.log(`${text}`);

      //server.close(() => {
      //  resolve(parsed);
      //});
    })
  },
  disabledCommands: ['AUTH']
});

server.on("error", (e) => {
  console.log(e);
});

server.listen(25);

console.log("Listening");
