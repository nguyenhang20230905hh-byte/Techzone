/**
 * Gửi email xác nhận đăng ký newsletter.
 * - Có RESEND_API_KEY: gửi email thật qua Resend, trả về { sent: true }.
 * - Không có key: KHÔNG giả vờ đã gửi — trả về { sent: false, reason: "demo" } và
 *   backend vẫn lưu email vào database bình thường. Giao diện sẽ hiển thị đúng
 *   trạng thái "đã lưu, chế độ demo chưa gửi email thật" thay vì báo đã gửi mail.
 */
export async function sendNewsletterConfirmation(
  email: string
): Promise<{ sent: boolean; reason?: string }> {
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
        to: email,
        subject: "Xác nhận đăng ký bản tin TECHZONE",
        html: `<p>Cảm ơn bạn đã đăng ký nhận bản tin <strong>TECHZONE</strong> — "Công nghệ trong tầm tay".</p>
               <p>Từ nay bạn sẽ nhận được những tin công nghệ đáng chú ý nhất mỗi tuần.</p>`,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend lỗi ${res.status}: ${body}`);
    }
    return { sent: true };
  } catch (err) {
    console.error("[email.sendNewsletterConfirmation] gửi thất bại:", err);
    return { sent: false, reason: "error" };
  }
}
