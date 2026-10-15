/**
 * Gửi email qua Resend.
 * - Có RESEND_API_KEY: gửi email thật, trả về { sent: true }.
 * - Không có key: KHÔNG giả vờ đã gửi — trả về { sent: false, reason: "demo" }.
 *   Nơi gọi hàm này vẫn lưu dữ liệu vào database bình thường, chỉ việc gửi mail
 *   là không xảy ra ở chế độ demo.
 */
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  attachment?: { filename: string; content: string }; // content: base64
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "demo" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "TECHZONE <onboarding@resend.dev>",
        to: params.to,
        subject: params.subject,
        html: params.html,
        ...(params.attachment ? { attachments: [params.attachment] } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend lỗi ${res.status}: ${body}`);
    }
    return { sent: true };
  } catch (err) {
    console.error("[email.sendEmail] gửi thất bại:", err);
    return { sent: false, reason: "error" };
  }
}

/** Email xác nhận gửi cho người vừa đăng ký nhận bản tin. */
export async function sendNewsletterConfirmation(
  email: string
): Promise<{ sent: boolean; reason?: string }> {
  return sendEmail({
    to: email,
    subject: "Xác nhận đăng ký bản tin TECHZONE",
    html: `<p>Cảm ơn bạn đã đăng ký nhận bản tin <strong>TECHZONE</strong> — "Công nghệ trong tầm tay".</p>
           <p>Từ nay bạn sẽ nhận được những tin công nghệ đáng chú ý nhất mỗi tuần.</p>`,
  });
}

/**
 * Email thông báo cho admin khi có việc cần biết (user mới đăng ký, subscriber mới...).
 * Gửi tới ADMIN_NOTIFY_EMAIL nếu đã cấu hình; nếu không có biến này thì không gửi
 * (không coi là lỗi — đơn giản là admin chưa bật tính năng này).
 */
async function notifyAdmin(subject: string, html: string): Promise<{ sent: boolean; reason?: string }> {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) {
    return { sent: false, reason: "no-admin-email" };
  }
  return sendEmail({ to: adminEmail, subject, html });
}

/** Báo cho admin biết có thành viên mới vừa đăng ký tài khoản. */
export async function notifyAdminNewUser(user: { name: string; email: string }) {
  return notifyAdmin(
    "TECHZONE — Có thành viên mới đăng ký",
    `<p>Vừa có một tài khoản mới đăng ký trên TECHZONE:</p>
     <ul>
       <li><strong>Tên:</strong> ${escapeHtml(user.name)}</li>
       <li><strong>Email:</strong> ${escapeHtml(user.email)}</li>
     </ul>`
  );
}

/** Báo cho admin biết có người mới đăng ký nhận bản tin. */
export async function notifyAdminNewSubscriber(email: string) {
  return notifyAdmin(
    "TECHZONE — Có người đăng ký nhận bản tin",
    `<p>Có một email mới vừa đăng ký nhận bản tin TECHZONE: <strong>${escapeHtml(email)}</strong></p>`
  );
}

/** Gửi file CSV danh sách người dùng tới email admin (dùng từ trang /admin). */
export async function emailUsersCsv(to: string, csvContent: string) {
  return sendEmail({
    to,
    subject: "TECHZONE — Danh sách người dùng (xuất .csv)",
    html: `<p>File đính kèm là danh sách toàn bộ người dùng hiện có trên TECHZONE, xuất lúc ${new Date().toLocaleString(
      "vi-VN"
    )}.</p>`,
    attachment: {
      filename: "techzone-users.csv",
      content: Buffer.from(csvContent, "utf-8").toString("base64"),
    },
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
