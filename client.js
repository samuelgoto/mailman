const nodemailer = require("nodemailer");
const dns = require("dns");
const smime = require('nodemailer-smime');
var fs = require("fs");

// Creating SMIME certificates
// https://serverfault.com/questions/103263/can-i-create-my-own-s-mime-certificate-for-email-encryption

async function send(email) {
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

  // console.log(host);

  const transporter = nodemailer.createTransport({
    host: host,
    port: 25,
    // port: 465,
    // port: 587,
  });

  // console.log(fs.readFileSync("humble_coder.key", "utf8"));

  //transporter.use("stream", smime({
  //  cert: fs.readFileSync("humble_coder.crt", "utf8"),
  //  chain: [
  //    fs.readFileSync("ca.crt", "utf8")
  //  ],
  //  key: fs.readFileSync("humble_coder.key", "utf8")
  //}));
  
  const result = await new Promise((resolve, reject) => {
    transporter.sendMail(email, function(error, info){
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });

  return result;
}

module.exports = {
  send
};


