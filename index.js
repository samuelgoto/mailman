const express = require('express')
const app = express()
const port = process.env.PORT || 2525;
// const port = 3000
// const port = 25;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

console.log(`Listening to port ${port}.`);

/**
return;


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


const port = process.env.PORT || 2525;

server.listen(port);

console.log(`Listening to port ${port}.`);
**/
