/**
 * Tóm tắt bài viết bằng AI.
 * - Nếu có ANTHROPIC_API_KEY: gọi Claude thật, trả về isDemo=false.
 * - Nếu KHÔNG có key: trả về bản tóm tắt rút trích từ chính nội dung bài viết
 *   (không bịa dữ liệu), đánh dấu rõ isDemo=true để giao diện ghi chú cho người dùng biết
 *   đây là dữ liệu mô phỏng, không phải kết quả gọi AI thật.
 */

export type SummaryResult = {
  points: string[];
  conclusion: string;
  isDemo: boolean;
};

export async function summarizeArticle(title: string, content: string): Promise<SummaryResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return buildDemoSummary(title, content);
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // claude-3-5-haiku đã bị Anthropic ngừng (19/02/2026) — gọi model cũ luôn lỗi 404.
        // Đổi model bằng biến môi trường ANTHROPIC_MODEL mà không cần sửa code.
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Tóm tắt bài báo công nghệ tiếng Việt sau thành đúng định dạng JSON (không thêm chữ nào khác ngoài JSON):
{"points": ["ý chính 1", "ý chính 2", "ý chính 3"], "conclusion": "một câu kết luận"}
Yêu cầu: 3-5 ý chính, mỗi ý một câu ngắn gọn bằng tiếng Việt, và một câu kết luận.

Tiêu đề: ${title}

Nội dung:
${content.slice(0, 6000)}`,
          },
        ],
      }),
      // AI summary luôn gọi theo yêu cầu người dùng, không cache ở tầng fetch.
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Anthropic API lỗi: ${res.status}`);
    }
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    // Model hay bọc JSON trong ```json ... ``` — bóc ra phần {...} trước khi parse.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const parsed = JSON.parse(start !== -1 && end > start ? text.slice(start, end + 1) : text);
    if (!Array.isArray(parsed.points) || typeof parsed.conclusion !== "string") {
      throw new Error("Phản hồi AI không đúng định dạng.");
    }
    return { points: parsed.points.slice(0, 5), conclusion: parsed.conclusion, isDemo: false };
  } catch (err) {
    console.error("[ai.summarizeArticle] gọi API thật thất bại, dùng bản demo:", err);
    return buildDemoSummary(title, content);
  }
}

function buildDemoSummary(title: string, content: string): SummaryResult {
  const sentences = content
    .replace(/\r\n/g, " ")
    .replace(/##?\s?/g, "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 220);

  const picked = sentences.slice(0, 4);
  const points =
    picked.length > 0
      ? picked
      : [`Bài viết "${title}" chưa đủ nội dung để trích ý chính tự động.`];

  return {
    points,
    conclusion: `Đây là bản tóm tắt CHẾ ĐỘ DEMO, trích trực tiếp từ nội dung bài viết — chưa qua mô hình AI thật. Cấu hình ANTHROPIC_API_KEY để bật tóm tắt AI thật.`,
    isDemo: true,
  };
}
