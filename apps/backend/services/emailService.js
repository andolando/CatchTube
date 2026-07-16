import transporter from "../config/nodeMailer.js";

export async function sendOTP(email, otp) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Votre code de connexion",
        html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
        </head>

        <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding:40px 20px;">

                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:10px;padding:40px;">

                            <tr>
                                <td align="center">

                                    <h2 style="margin:0;color:#1f2937;">
                                        Connexion sécurisée
                                    </h2>

                                    <p style="color:#555;font-size:16px;margin-top:20px;">
                                        Bonjour,
                                    </p>

                                    <p style="color:#555;font-size:16px;line-height:24px;">
                                        Utilisez le code suivant pour vous connecter à votre compte.
                                    </p>

                                    <div
                                        style="
                                            margin:30px auto;
                                            background:#2563eb;
                                            color:white;
                                            display:inline-block;
                                            padding:18px 40px;
                                            font-size:34px;
                                            letter-spacing:8px;
                                            border-radius:8px;
                                            font-weight:bold;
                                        ">
                                        ${otp}
                                    </div>

                                    <p style="font-size:15px;color:#666;">
                                        Ce code expire dans <strong>10 minutes</strong>.
                                    </p>

                                    <p style="font-size:14px;color:#888;line-height:22px;">
                                        Si vous n'êtes pas à l'origine de cette demande,
                                        vous pouvez ignorer cet email.
                                    </p>

                                    <hr style="margin:35px 0;border:none;border-top:1px solid #eee;">

                                    <p style="font-size:12px;color:#999;">
                                        Ne partagez jamais ce code avec qui que ce soit.
                                    </p>

                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        `,
    });
}