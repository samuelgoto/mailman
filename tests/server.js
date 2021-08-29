const {SMTPServer} = require("smtp-server");
const {simpleParser} = require("mailparser");
const nodemailer = require("nodemailer");

describe("server", () => {
  it.skip("sends and receives", async () => {

    const received = new Promise((resolve, reject) => {
      const server = new SMTPServer({
        onData(stream, session, callback) {
          stream.on("end", callback);
          simpleParser(stream, {}, (err, parsed) => {
            if (err) {
              reject(err);
            }
            
            server.close(() => {
              resolve(parsed);
            });
          })
        },
        disabledCommands: ['AUTH']
      });
      server.on("error", reject);
      server.listen(25);
    });

    const sent = new Promise((resolve, reject) => {
      const transporter = nodemailer.createTransport({
        host: "localhost",
        port: 25,
      });

      const email = {
        from: "sender@gmail.com",
        to: "relay@gmail.com",
        subject: "",
        text: `
> Forward to recipient@gmail.com
Hi!
`
      };

      transporter.sendMail(email, function(error, info){
        if (error) {
          reject();
        } else {
          resolve(info.response);
        }
      });
    });    
    
    const email = await received;
    await sent;

    const {from, to, subject, text} = email;
    const {value: [{address: sender}]} = from;
    const {value: [{address: receiver}]} = to;
    
    //console.log(`From: ${sender}`);
    //console.log(`To: ${receiver}`);
    //console.log(`Sub: ${subject}`);
    //console.log(`${text}`);

    
  });
});
