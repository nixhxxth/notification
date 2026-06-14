const twilio = require("twilio");
const nodemailer = require("nodemailer");

const {
  generateTicketId
} = require("../../utils/ticket");

exports.handler = async (event) => {

  try {

    const data =
      JSON.parse(event.body);

    const {
      phone,
      email,
      subject
    } = data;

    const ticketId =
      generateTicketId();

    const company =
      process.env.COMPANY_NAME;

    const twilioClient =
      twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

    const transporter =
      nodemailer.createTransport({

        host:
          process.env.SMTP_HOST,

        port:
          process.env.SMTP_PORT,

        secure:
          false,

        auth: {

          user:
            process.env.SMTP_USER,

          pass:
            process.env.SMTP_PASS

        }

      });

    const tasks = [];

    /*
     * WhatsApp
     */

    if (phone) {

      tasks.push(

        twilioClient.messages.create({

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

        })

      );

    }

    /*
     * SMS
     */

    if (phone) {

      tasks.push(

        twilioClient.messages.create({

          from:
            process.env.TWILIO_SMS_NUMBER,

          to:
            phone,

          body:
            `Thank you for contacting ${company}. Ticket: ${ticketId}. Subject: ${subject}`

        })

      );

    }

    /*
     * Email
     */

    if (email) {

      tasks.push(

        transporter.sendMail({

          from:
            `"${company}" <${process.env.SMTP_USER}>`,

          to:
            email,

          subject:
            `Acknowledgement - ${ticketId}`,

          html: `
            <h2>Thank You</h2>

            <p>We received your enquiry.</p>

            <p>
              <b>Subject:</b>
              ${subject}
            </p>

            <p>
              <b>Reference ID:</b>
              ${ticketId}
            </p>

            <p>
              Our team will contact you shortly.
            </p>
          `

        })

      );

    }

    await Promise.allSettled(tasks);

    return {

      statusCode: 200,

      body: JSON.stringify({

        success: true,
        ticketId

      })

    };

  } catch (err) {

    return {

      statusCode: 500,

      body: JSON.stringify({

        success: false,
        error: err.message

      })

    };

  }

};