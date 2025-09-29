const nodemailer = require("nodemailer");

async function testMail() {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "testaishwarya4@gmail.com",
        pass: "ofjihgwnvlpdmvql",
      },
    });

    let info = await transporter.sendMail({
      from: '"Test" <testaishwarya4@gmail.com>',
      to: "aishwaryalakshmis77@gmail.com",
      subject: "Test Mail",
      text: "Hello from Node.js",
    });

    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.error("Mail sending failed:", err);
  }
}

testMail();
