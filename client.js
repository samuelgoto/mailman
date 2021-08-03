const nodemailer = require("nodemailer");
const dns = require("dns");

async function main() {

  const email = {
    from: "me@code.sgo.to",
    to: "samuelgoto@gmail.com",
    subject: "any chance this will work?",
    text: `
hello world! how is it going?
`
  };

  const domain = email.to.split("@")[1];

  const host = await new Promise((resolve, reject) => {
    dns.resolveMx(domain, (e, address) => {
      if (e) {
        reject(e);
      } else {
        resolve(address[0].exchange);
      }
    });
  });

  const transporter = nodemailer.createTransport({
    host: host,
    port: 25,
  });

  const result = await new Promise((resolve, reject) => {
    transporter.sendMail(email, function(error, info){
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });

  console.log(result);
}

main();


