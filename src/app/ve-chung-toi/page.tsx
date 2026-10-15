export const metadata = { title: "Về chúng tôi — TECHZONE" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold text-navy">Về TECHZONE</h1>
      <p className="mt-2 text-ink/60">"Công nghệ trong tầm tay"</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-navy">Sứ mệnh</h2>
        <p className="leading-relaxed text-ink/80">
          TECHZONE ra đời với mong muốn giúp người trẻ Việt Nam tiếp cận công nghệ một cách dễ hiểu,
          thực tế và đáng tin cậy. Chúng tôi tin rằng công nghệ không nên là thứ xa vời hay chỉ dành
          cho dân chuyên — mà là công cụ ai cũng có thể làm chủ để học tập, làm việc và sống tốt
          hơn mỗi ngày.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-navy">Đối tượng độc giả</h2>
        <p className="leading-relaxed text-ink/80">
          Học sinh, sinh viên và người trẻ Việt Nam trong độ tuổi 16–30 — những người đang hình
          thành thói quen sử dụng công nghệ, chọn thiết bị học tập/làm việc đầu tiên, và cần những
          lời khuyên công nghệ thực tế, không hàn lâm.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-navy">Các lĩnh vực nội dung</h2>
        <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-ink/80">
          <li>AI & Công nghệ — trí tuệ nhân tạo và cách nó thay đổi học tập, công việc.</li>
          <li>Thiết bị số — đánh giá, so sánh và hướng dẫn chọn thiết bị phù hợp túi tiền sinh viên.</li>
          <li>Kỹ năng số — kỹ năng cần thiết để làm chủ công cụ số trong học tập và nghề nghiệp.</li>
          <li>Xu hướng số — những thay đổi công nghệ đang định hình cách người trẻ sống và làm việc.</li>
          <li>Đời sống số — công nghệ trong đời sống hằng ngày, sức khoẻ số và cân bằng màn hình.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-navy">Quy trình biên tập</h2>
        <p className="leading-relaxed text-ink/80">
          Mọi bài viết trên TECHZONE đều được thành viên trong cộng đồng đóng góp và tự chịu trách
          nhiệm về nội dung đăng tải. Đội ngũ biên tập rà soát định kỳ, đánh dấu các bài chất lượng
          cao là "nổi bật", và có quyền gỡ bỏ nội dung sai sự thật hoặc vi phạm tiêu chuẩn cộng
          đồng. Đây là dự án học tập — mọi bài viết mẫu ban đầu đều được ghi chú rõ ràng, không
          tuyên bố là nội dung báo chí chính thức.
        </p>
      </section>

      <section id="chinh-sach" className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-navy">Chính sách bảo mật</h2>
        <p className="leading-relaxed text-ink/80">
          Chúng tôi chỉ thu thập thông tin cần thiết để vận hành tài khoản (tên, email, mật khẩu đã
          băm) và email đăng ký bản tin. Thông tin không được chia sẻ cho bên thứ ba ngoài mục đích
          vận hành website.
        </p>
      </section>

      <section id="dieu-khoan" className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-navy">Điều khoản sử dụng</h2>
        <p className="leading-relaxed text-ink/80">
          Người dùng chịu trách nhiệm về nội dung bài viết, bình luận do mình đăng tải. TECHZONE có
          quyền gỡ bỏ nội dung vi phạm pháp luật, thuần phong mỹ tục hoặc gây hiểu lầm nghiêm trọng.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold text-navy">Liên hệ</h2>
        <p className="leading-relaxed text-ink/80">
          Email: <a href="mailto:lienhe@techzone.vn" className="text-electric hover:underline">lienhe@techzone.vn</a>
        </p>
      </section>
    </div>
  );
}
