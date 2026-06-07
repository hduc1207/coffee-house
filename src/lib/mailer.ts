import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const hasSmtpConfig = !!smtpHost && !!smtpUser && !!smtpPass;

const transporter = hasSmtpConfig
    ? nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const subject = "Đặt lại mật khẩu - Coffee House";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #faf8f5; border-radius: 12px;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 16px;">Đặt lại mật khẩu</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                Nhấn nút bên dưới để tạo mật khẩu mới:
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #333; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                    Đặt lại mật khẩu
                </a>
            </div>
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
                Link này sẽ hết hạn sau 15 phút.<br/>
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
            <p style="color: #bbb; font-size: 11px;">Coffee House &copy; ${new Date().getFullYear()}</p>
        </div>
    `;

    if (transporter) {
        await transporter.sendMail({
            from: `"Coffee House" <${smtpUser}>`,
            to: email,
            subject,
            html,
        });
        console.log(`[mailer] Email sent to ${email}`);
    } else {
        console.log("─".repeat(60));
        console.log("[mailer] SMTP chưa cấu hình. Link đặt lại mật khẩu:");
        console.log(`  Email: ${email}`);
        console.log(`  URL:   ${resetUrl}`);
        console.log("─".repeat(60));
    }
}
