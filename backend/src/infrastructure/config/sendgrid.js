import sgMail from '@sendgrid/mail';
console.log ("SendGrid API Key:", process.env.SENDGRID_API_KEY); // Debug log
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default sgMail;
