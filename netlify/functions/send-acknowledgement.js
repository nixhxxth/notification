const twilio = require("twilio");
const nodemailer = require("nodemailer");
const { generateTicketId } = require("../../utils/ticket");

exports.handler = async (event) => {

  try {

    const data = JSON.parse(event.body);

    console.log("Incoming Payload:", data);

    const {
      phone,
      email,
      subject
    } = data;

    const ticketId =
      generateTicketId();

    const company =
      process.env.COMPANY_NAME || "NP Solutions";

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
          Number(
            process.env.SMTP_PORT
          ),

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

      console.log(
        "Sending WhatsApp..."
      );

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
              "2": subject || "General Enquiry",
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

      console.log(
        "Sending SMS..."
      );

      tasks.push(

        twilioClient.messages.create({

          from:
            process.env.TWILIO_SMS_NUMBER,

          to:
            phone,

          contentSid:
            "HX3a75d9de628c8333559c4c20b4535b87",

          contentVariables:
            JSON.stringify({

              "1": "Customer",
              "2": subject || "General Enquiry",
              "3": ticketId,
              "4": company

            })

        })

      );

    }

    /*
     * Email
     */

    if (email) {

      console.log(
        "Sending Email..."
      );

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

            <p>
              We have received your enquiry.
            </p>

            <hr>

            <p>
              <strong>Reference ID:</strong>
              ${ticketId}
            </p>

            <p>
              <strong>Subject:</strong>
              ${subject || "General Enquiry"}
            </p>

            <p>
              Our team will review your request and contact you shortly.
            </p>

            <br>

            <p>
              Regards,<br>
              ${company}
            </p>
          `

        })

      );

    }

    const results =
      await Promise.allSettled(
        tasks
      );

    console.log(
      "Results:",
      JSON.stringify(
        results,
        null,
        2
      )
    );

    return {

      statusCode: 200,

      body: JSON.stringify({

        success: true,
        ticketId,
        results

      })

    };

  } catch (err) {

    console.error(
      "ERROR:",
      err
    );

    return {

      statusCode: 500,

      body: JSON.stringify({

        success: false,
        error: err.message

      })

    };

  }

};