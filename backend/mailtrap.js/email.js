// const { MailtrapClient } = require("mailtrap");
// const { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require("./emailTemplates.js");
// const { client, sender } = require("./mailtrap.config.js");

// const sendVerificationEmail = async (email, verificationToken) => {
//   const recipients = [{ email }];
  
//   try {
//     const response = await client.send({
//       from: sender,
//       to: recipients,
//       subject: "Verify your email",
//       html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
//       category: "email verification",
//     });
//     console.log("Email sent:", response);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send verification email");
//   }
// };
// const sendWelcomeEmail = async (email, name) => {
// 	const recipient = [{ email }];

// 	try {
// 		const response = await client.send({
// 			from: sender,
// 			to: recipient,
// 			template_uuid: "b8315770-8c3e-4c7c-839e-cb6352da83fc",
// 			template_variables: {
// 				company_info_name: "Demo Auth Company",
// 				name: name,
// 			},
// 		});

// 		console.log("Welcome email sent successfully", response);
// 	} catch (error) {
// 		console.error(`Error sending welcome email`, error);

// 		throw new Error(`Error sending welcome email: ${error}`);
// 	}
// };
// const sendPasswordResetEmail = async (email, url) => {
// 	const recipient = [{ email }];

// 	try {
// 		const response = await client.send({
// 			from: sender,
// 			to: recipient,
// 			subject : "Forget password",
//       html : PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", url),
//       category: "Password Reset",
// 		});

// 		console.log("Password Reset email sent successfully", response, url);
// 	} catch (error) {
// 		console.error(`Error sending Password Reset email`, error);

// 		throw new Error(`Error sending Password Reset email: ${error}`);
// 	}
// };
// const sendResetSuccessEmail = async (email, url) => {
// 	const recipient = [{ email }];

// 	try {
// 		const response = await client.send({
// 			from: sender,
// 			to: recipient,
// 			subject : "Password Reset successfull",
//       html : PASSWORD_RESET_SUCCESS_TEMPLATE,
//       category: "Password Reset successfull",
// 		});

// 		console.log("Password Reset successfull email sent successfully", response);
// 	} catch (error) {
// 		console.error(`Error sending Password Reset successfull email`, error);

// 		throw new Error(`Error sending Password Reset successfull email: ${error}`);
// 	}
// };

// module.exports = { sendVerificationEmail, sendWelcomeEmail , sendPasswordResetEmail, sendResetSuccessEmail};


const { transporter, sender } = require("./mailtrap.config.js");
const {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require("./emailTemplates.js");

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
    });
    console.log("✅ Verification email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const html = `
      <h1>Welcome, ${name}!</h1>
      <p>Thanks for joining <strong>Demo Auth Company</strong>.</p>
    `;

    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome to Demo Auth Company!",
      html,
    });

    console.log("✅ Welcome email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

const sendPasswordResetEmail = async (email, url) => {
  try {
    const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", url);

    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Reset your password",
      html,
    });

    console.log("✅ Password reset email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

const sendResetSuccessEmail = async (email) => {
  try {
    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("✅ Password reset success email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending password reset success email:", error);
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
};
