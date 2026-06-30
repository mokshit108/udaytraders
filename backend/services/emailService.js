// Require the Brevo (Sendinblue) SDK
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Load environment variables
const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;
const MY_EMAIL = process.env.MY_EMAIL;

// Check if API key and email are available in the environment variables
if (!SENDINBLUE_API_KEY || !MY_EMAIL) {
  console.error('Sendinblue configuration is missing. Check your .env file.');
  process.exit(1);
}

// Configure API key authorization
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = SENDINBLUE_API_KEY;

// Create an instance of the transactional emails API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Function to send email
const sendEmail = async ({ recipient_email, OTP }) => {
  try {
    const sendSmtpEmail = {
      sender: { email: MY_EMAIL, name: 'Onestopbath' },
      to: [{ email: recipient_email }],
      subject: 'Password Reset OTP',
      textContent: `Your OTP for resetting your password is ${OTP}. This OTP will expire in 10 minutes.`,
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

// Export the function for usage in other parts of your application
module.exports = { sendEmail };
