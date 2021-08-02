const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mailman-router.herokuapp.com",
  port: 4018,
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
    console.log(error);
  } else {
    console.log(info.response);
  }
});
    
