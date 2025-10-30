import nodemailer from 'nodemailer';

export const sendEmail = async (to: String, subject: String, text: String) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: "xyeppubfbzjstxbl",
        },
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });
};

