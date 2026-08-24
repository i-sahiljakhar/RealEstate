const sendEmail = async (option) => {
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
    if (!BREVO_API_KEY) {
      console.error("missing BREVO_API_KEY in the .env file");
      throw new Error("Missing  Email Api Key");
    }
    const data = {
      sender: {
        name: "Real EState platform",
        email: process.env.EMAIL_USER,
      },
      to: [{ email: option.email }],
      subject: option.subject,
      htmlContent: option.message,
    };
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "Post",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.ok) {
      console.log("Email sent successfuly via brevo:", result.messageId);
    } else {
      console.error("Brevo APi Key Error:", result);
      throw new Error(result.message || "Could not send email via brevo");
    }
  } catch (error) {
    console.error("Brevo Error Email:", error.message);
    throw new Error("Could not send email via brevo");
  }
};

export default sendEmail;
