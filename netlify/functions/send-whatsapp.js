const twilio = require("twilio");

function randomChar(chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function generateTicketId() {

  const year =
    new Date().getFullYear().toString().slice(-2);

  const hex =
    "0123456789ABCDEF";

  const alpha =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const vowel =
    "AEIOU";

  const alphanum =
    alpha + "0123456789";

  return (
    "NP-" +
    year +
    randomChar(hex) +
    randomChar(hex) +
    randomChar(alphanum) +
    randomChar(alphanum) +
    randomChar(vowel) +
    randomChar(alpha) +
    randomChar(alpha) +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10)
  );
}

exports.handler = async (event) => {

  try {

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const data =
      JSON.parse(event.body);

    const ticketId =
      generateTicketId();

    const phone =
      data.phone;

    const subject =
      data.subject || "General Enquiry";

    const company =
      process.env.COMPANY_NAME || "NP";

    const result =
      await client.messages.create({

        from:
          process.env.TWILIO_WHATSAPP_NUMBER,

        to:
          `whatsapp:${phone}`,

        contentSid:
          "HX3a75d9de628c8333559c4c20b4535b87",

        contentVariables:
          JSON.stringify({

            "1": "Customer",
            "2": subject,
            "3": ticketId,
            "4": company

          })

      });

    return {

      statusCode: 200,

      body: JSON.stringify({

        success: true,
        ticketId,
        sid: result.sid

      })

    };

  } catch (err) {

    console.error(err);

    return {

      statusCode: 500,

      body: JSON.stringify({

        success: false,
        error: err.message

      })

    };

  }

};