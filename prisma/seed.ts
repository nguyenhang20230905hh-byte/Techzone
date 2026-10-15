/**
 * Seed dữ liệu ban đầu cho TECHZONE.
 *
 * LƯU Ý QUAN TRỌNG: Nội dung 18 bài viết dưới đây do AI soạn thảo để có dữ liệu
 * mẫu chạy được ngay (đúng yêu cầu "không dùng Lorem Ipsum"), có cấu trúc rõ
 * ràng và đủ độ dài để đội biên tập chỉnh sửa thành bài gốc. Đây KHÔNG phải nội
 * dung báo chí chính thức do nhóm tự viết — hãy biên tập lại trước khi dùng
 * trong môi trường thực tế.
 *
 * Chạy: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify, estimateReadingMinutes } from "../src/lib/utils";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "AI & Công nghệ", slug: "ai-cong-nghe", order: 1, description: "Trí tuệ nhân tạo và cách nó thay đổi học tập, công việc, cuộc sống." },
  { name: "Thiết bị số", slug: "thiet-bi-so", order: 2, description: "Đánh giá, so sánh và hướng dẫn chọn thiết bị công nghệ phù hợp." },
  { name: "Kỹ năng số", slug: "ky-nang-so", order: 3, description: "Kỹ năng làm chủ công cụ số trong học tập và nghề nghiệp." },
  { name: "Xu hướng số", slug: "xu-huong-so", order: 4, description: "Những xu hướng công nghệ đang định hình cách người trẻ sống và làm việc." },
  { name: "Đời sống số", slug: "doi-song-so", order: 5, description: "Công nghệ trong đời sống hằng ngày và sự cân bằng với thế giới thực." },
  { name: "Góc nhìn", slug: "goc-nhin", order: 6, description: "Bài bình luận, phân tích chuyên sâu từ cộng đồng TECHZONE.", showOnHome: false },
  { name: "Video", slug: "video", order: 7, description: "Nội dung công nghệ dạng video.", showOnHome: false },
];

const AUTHORS = [
  { name: "Admin TECHZONE", email: "admin@techzone.vn", role: "ADMIN" as const, bio: "Quản trị nội dung TECHZONE." },
  { name: "Minh Khuê", email: "minhkhue@techzone.vn", role: "MEMBER" as const, bio: "Sinh viên CNTT, quan tâm AI và sản phẩm số." },
  { name: "Gia Bảo", email: "giabao@techzone.vn", role: "MEMBER" as const, bio: "Viết về thiết bị công nghệ và trải nghiệm người dùng." },
  { name: "Thuỳ Linh", email: "thuylinh@techzone.vn", role: "MEMBER" as const, bio: "Quan tâm kỹ năng số và năng suất học tập." },
];

type SeedArticle = {
  title: string;
  summary: string;
  category: string;
  author: string;
  tags: string[];
  isFeatured?: boolean;
  isPremium?: boolean;
  cover: string;
  content: string;
};

const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=70&auto=format&fit=crop`;

const ARTICLES: SeedArticle[] = [
  // ===== AI & Công nghệ (4) =====
  {
    title: "AI đang thay đổi cách sinh viên Việt Nam học tập và làm việc như thế nào?",
    summary:
      "Từ trợ lý viết luận đến gia sư cá nhân hoá, trí tuệ nhân tạo đang len lỏi vào từng góc học tập của sinh viên Việt Nam. Nhưng thay đổi này mang lại lợi ích thật sự hay những rủi ro âm thầm?",
    category: "ai-cong-nghe",
    author: "Minh Khuê",
    tags: ["AI", "sinh viên", "học tập"],
    isFeatured: true,
    cover: img("photo-1677442136019-21780ecad995"),
    content: `Hai năm trở lại đây, cụm từ "trí tuệ nhân tạo" không còn là chủ đề xa lạ trong các giảng đường đại học ở Việt Nam. Từ việc tóm tắt tài liệu, dịch thuật, đến hỗ trợ viết code hay luyện nói ngoại ngữ, AI đã trở thành một phần quen thuộc trong ba lô kỹ thuật số của sinh viên.

## Từ công cụ hỗ trợ đến người bạn đồng hành học tập

Khảo sát nhanh trong cộng đồng sinh viên các trường kỹ thuật tại Hà Nội và TP.HCM cho thấy phần lớn đã từng sử dụng ít nhất một công cụ AI trong học kỳ gần nhất. Phổ biến nhất là các trợ lý trò chuyện dùng để giải thích khái niệm khó, gợi ý dàn ý tiểu luận, hoặc kiểm tra lỗi ngữ pháp tiếng Anh. Với nhiều bạn, đây gần như một gia sư riêng hoạt động 24/7, sẵn sàng giải đáp bất cứ lúc nào mà không phán xét câu hỏi "ngớ ngẩn".

Không chỉ dừng ở việc trả lời câu hỏi, các mô hình AI hiện nay còn có thể đóng vai trò phản biện: sinh viên đưa ra lập luận, AI chỉ ra điểm yếu trong logic, gợi ý nguồn tham khảo để củng cố luận điểm. Cách học này đang dần thay đổi thói quen "học thuộc lòng" sang "học để hiểu và tranh luận" — một kỹ năng ngày càng được doanh nghiệp đánh giá cao.

## Mặt trái: phụ thuộc và mất kỹ năng tư duy độc lập

Tuy nhiên, không phải mọi tác động đều tích cực. Nhiều giảng viên bày tỏ lo ngại khi sinh viên sử dụng AI để làm bài tập thay vì công cụ hỗ trợ tư duy. Ranh giới giữa "dùng AI để học nhanh hơn" và "dùng AI để học hộ" đôi khi rất mong manh.

Một số trường đại học đã bắt đầu điều chỉnh cách ra đề và chấm điểm, chuyển từ bài luận viết tay thuần tuý sang các hình thức đánh giá kết hợp vấn đáp, thuyết trình hoặc bài tập thực hành — những dạng bài khó để AI "làm hộ" hoàn toàn.

## Vậy nên dùng AI như thế nào cho đúng?

- Dùng AI để hiểu sâu hơn một khái niệm, không dùng để thay thế việc tự tư duy.
- Luôn kiểm chứng lại thông tin AI đưa ra, đặc biệt với số liệu, trích dẫn hay sự kiện lịch sử.
- Ghi chú lại những gì đã học được sau khi trò chuyện với AI, thay vì chỉ copy-paste.
- Ưu tiên các công cụ có chính sách bảo mật dữ liệu rõ ràng khi nhập thông tin cá nhân hoặc bài làm.

Công nghệ AI chắc chắn sẽ còn len lỏi sâu hơn vào đời sống học thuật trong những năm tới. Câu hỏi quan trọng không phải là "có nên dùng AI hay không", mà là "dùng AI như thế nào để bản thân thực sự giỏi hơn, chứ không chỉ nhanh hơn".`,
  },
  {
    title: "5 công cụ AI đáng thử dành cho sinh viên",
    summary:
      "Giữa hàng trăm ứng dụng AI ra mắt mỗi tháng, đâu là những công cụ thực sự hữu ích cho việc học? TECHZONE tổng hợp 5 cái tên đáng thử, miễn phí hoặc có gói sinh viên.",
    category: "ai-cong-nghe",
    author: "Minh Khuê",
    tags: ["AI", "công cụ", "năng suất"],
    cover: img("photo-1591696331111-ef9586a5b17a"),
    content: `Không phải công cụ AI nào cũng đáng để cài vào máy. Dưới đây là 5 nhóm công cụ mà sinh viên có thể khai thác ngay trong học kỳ này, được chọn lọc dựa trên tính thực dụng và mức độ phổ biến trong cộng đồng sinh viên công nghệ.

## 1. Trợ lý trò chuyện đa năng

Đây là nhóm công cụ quen thuộc nhất — dùng để giải thích khái niệm, brainstorm ý tưởng, luyện phản biện trước khi viết tiểu luận. Điểm mạnh là tốc độ phản hồi nhanh và khả năng điều chỉnh độ khó theo trình độ người hỏi. Mẹo nhỏ: càng mô tả rõ ngữ cảnh (ví dụ "giải thích như với sinh viên năm nhất"), câu trả lời càng dễ hiểu.

## 2. Công cụ tóm tắt tài liệu dài

Với những môn học có khối lượng đọc lớn, công cụ tóm tắt PDF, bài báo khoa học giúp tiết kiệm đáng kể thời gian đọc lướt ban đầu. Tuy nhiên, bản tóm tắt chỉ nên là bước khởi động — với những phần quan trọng, vẫn cần đọc kỹ bản gốc để tránh hiểu sai ý tác giả.

## 3. Ứng dụng luyện nói ngoại ngữ bằng AI

Khác với ứng dụng học từ vựng truyền thống, các công cụ luyện nói bằng AI cho phép hội thoại mô phỏng tình huống thực tế, chỉnh sửa phát âm theo thời gian thực. Đây là lựa chọn tốt cho những bạn ngại giao tiếp trực tiếp nhưng vẫn muốn luyện phản xạ ngôn ngữ.

## 4. Công cụ hỗ trợ viết và sửa lỗi

Từ kiểm tra ngữ pháp đến gợi ý cách diễn đạt tự nhiên hơn, nhóm công cụ này đặc biệt hữu ích khi viết luận bằng tiếng Anh hoặc email xin thực tập. Lưu ý: không nên để AI viết lại toàn bộ đoạn văn, chỉ nên dùng gợi ý để tự chỉnh sửa, tránh mất đi giọng văn cá nhân.

## 5. Trợ lý lập trình

- Gợi ý hoàn thành đoạn code đang viết dở.
- Giải thích lỗi (debug) bằng ngôn ngữ dễ hiểu.
- Đề xuất cách tối ưu thuật toán.
- Tạo dữ liệu mẫu để kiểm thử nhanh.

Với sinh viên ngành kỹ thuật, đây có thể là công cụ tiết kiệm thời gian nhiều nhất, nhưng cũng là nơi dễ "ỷ lại" nhất — nhiều giảng viên khuyên nên tự giải quyết lỗi trước, chỉ hỏi AI khi đã thực sự bế tắc, để không bỏ lỡ cơ hội rèn tư duy debug.

## Lời khuyên chung

Hầu hết các công cụ trên đều có gói miễn phí đủ dùng cho nhu cầu học tập cơ bản. Trước khi trả phí, hãy tận dụng tối đa bản miễn phí và luôn đọc kỹ chính sách dữ liệu — đặc biệt nếu bạn nhập nội dung bài tập, luận văn có tính bảo mật.`,
  },
  {
    title: "Chatbot AI có thể thay thế gia sư truyền thống không?",
    summary:
      "Giá một buổi gia sư 1-kèm-1 có thể lên đến vài trăm nghìn đồng, trong khi chatbot AI gần như miễn phí và luôn sẵn sàng. Nhưng liệu nó có thực sự thay thế được con người?",
    category: "ai-cong-nghe",
    author: "Minh Khuê",
    tags: ["AI", "giáo dục", "gia sư"],
    isPremium: true,
    cover: img("photo-1596496181848-3091d4878b24"),
    content: `Câu hỏi "AI có thay thế được gia sư không" đang được tranh luận sôi nổi trong giới giáo dục, không chỉ ở Việt Nam mà trên toàn thế giới. Để trả lời công bằng, cần nhìn vào cả điểm mạnh lẫn giới hạn thực sự của công nghệ hiện tại.

## Điểm mạnh: luôn sẵn sàng, không giới hạn số lần hỏi

Khác với gia sư con người chỉ có thể dạy trong khung giờ cố định, chatbot AI hoạt động 24/7. Một học sinh có thể hỏi đi hỏi lại cùng một khái niệm mười lần vào lúc nửa đêm mà không sợ bị đánh giá. Khả năng lặp lại không giới hạn và kiên nhẫn vô hạn là lợi thế mà con người khó cạnh tranh được về mặt chi phí.

Ngoài ra, AI có thể điều chỉnh cách giải thích gần như ngay lập tức dựa trên phản hồi của người học — nếu một cách giải thích chưa rõ, chỉ cần yêu cầu "giải thích đơn giản hơn" hoặc "cho ví dụ thực tế" là có ngay phương án khác.

## Giới hạn: thiếu sự thấu hiểu và động lực cá nhân hoá thật sự

Tuy nhiên, một gia sư giỏi không chỉ truyền đạt kiến thức — họ quan sát biểu cảm, nhận ra khi nào học sinh đang nản lòng dù miệng vẫn nói "em hiểu rồi", và điều chỉnh phương pháp dạy theo tính cách từng người. Đây là năng lực cảm xúc mà AI hiện tại chưa thể mô phỏng trọn vẹn.

Bên cạnh đó, AI đôi khi đưa ra thông tin sai nhưng trình bày với giọng điệu rất tự tin — hiện tượng được giới chuyên môn gọi là "ảo giác" (hallucination). Với người học chưa đủ nền tảng để nhận ra sai sót, điều này có thể dẫn đến hiểu sai kiến thức mà không hề hay biết.

## Mô hình kết hợp: hướng đi thực tế nhất

Nhiều trung tâm giáo dục hiện áp dụng mô hình lai: dùng AI để luyện tập, ôn bài, giải đáp nhanh các câu hỏi cơ bản ngoài giờ học; còn gia sư con người tập trung vào việc xây dựng lộ trình học, động viên tinh thần và giải quyết những vấn đề học thuật phức tạp, mang tính hệ thống.

- AI phù hợp: ôn tập kiến thức đã học, luyện tập dạng bài quen thuộc, hỏi đáp nhanh.
- Gia sư con người phù hợp: xây dựng lộ trình dài hạn, xử lý lỗ hổng kiến thức sâu, hỗ trợ tâm lý học tập.

## Kết luận

AI chưa thể thay thế hoàn toàn gia sư truyền thống, nhưng chắc chắn đang thay đổi vai trò của gia sư — từ người truyền đạt kiến thức thuần tuý sang người đồng hành chiến lược học tập. Với sinh viên có ngân sách hạn chế, kết hợp cả hai là lựa chọn thông minh nhất hiện nay.`,
  },
  {
    title: "Cách nhận diện tin giả do AI tạo ra",
    summary:
      "Hình ảnh, video và bài viết do AI tạo ra ngày càng khó phân biệt với nội dung thật. Dưới đây là những dấu hiệu giúp bạn tỉnh táo hơn khi lướt mạng xã hội.",
    category: "ai-cong-nghe",
    author: "Thuỳ Linh",
    tags: ["AI", "tin giả", "an toàn mạng"],
    cover: img("photo-1557200134-90327ee9fafa"),
    content: `Chỉ vài năm trước, "deepfake" còn là khái niệm xa lạ với phần lớn người dùng mạng xã hội Việt Nam. Giờ đây, một bức ảnh giả do AI tạo ra có thể lan truyền hàng triệu lượt chia sẻ chỉ trong vài giờ, trước khi ai đó kịp xác minh tính xác thực.

## Vì sao tin giả do AI ngày càng khó nhận ra

Các mô hình tạo ảnh và video thế hệ mới có khả năng tái tạo ánh sáng, bóng đổ và chi tiết khuôn mặt với độ chân thực cao đến mức mắt thường khó phân biệt. Khác với ảnh chỉnh sửa thủ công trước đây thường để lại dấu vết rõ ràng (viền cắt ghép, màu da không đồng đều), nội dung do AI tạo sinh hoàn toàn từ đầu, không có "điểm nối" để soi.

## Những dấu hiệu đáng ngờ cần chú ý

## Với hình ảnh

- Bàn tay, ngón tay có số lượng bất thường hoặc hình dạng kỳ lạ — đây vẫn là điểm yếu phổ biến của nhiều mô hình AI tạo ảnh.
- Chi tiết nền (chữ viết, biển hiệu, hoa văn) bị nhoè hoặc vô nghĩa khi phóng to.
- Ánh sáng và bóng đổ không nhất quán giữa chủ thể và nền.
- Phụ kiện như kính, trang sức có hình dạng bất đối xứng kỳ lạ.

## Với video

Deepfake video thường lộ dấu hiệu ở vùng viền khuôn mặt khi người trong video quay đầu nhanh, chớp mắt với tần suất bất thường, hoặc khẩu hình miệng không khớp hoàn toàn với âm thanh.

## Với văn bản

Bài viết do AI tạo thường có cấu trúc câu rất "chuẩn" nhưng thiếu chi tiết đời thường cụ thể, hoặc lặp lại cùng một luận điểm bằng nhiều cách diễn đạt khác nhau mà không có thông tin mới.

## Thói quen kiểm chứng thông tin

1. Kiểm tra nguồn gốc: thông tin đến từ trang báo chính thống hay tài khoản ẩn danh mới lập?
2. Tìm kiếm chéo: cùng sự kiện đó, các báo uy tín khác có đưa tin không?
3. Dùng công cụ tìm kiếm ảnh ngược để kiểm tra xem bức ảnh đã từng xuất hiện ở ngữ cảnh khác chưa.
4. Cảnh giác với nội dung gây cảm xúc mạnh (phẫn nộ, sợ hãi) — đây thường là "mồi" để tin giả lan truyền nhanh hơn.

## Kết luận

Không có công cụ nào phát hiện deepfake chính xác 100%, kể cả các mô hình AI chuyên dụng. Kỹ năng tư duy phản biện và thói quen kiểm chứng trước khi chia sẻ vẫn là lớp phòng vệ quan trọng nhất — đặc biệt với thế hệ tiếp cận thông tin chủ yếu qua mạng xã hội như hiện nay.`,
  },

  // ===== Thiết bị số (4) =====
  {
    title: "Điện thoại thông minh đang thay đổi thói quen sử dụng công nghệ",
    summary:
      "Từ chiếc điện thoại chỉ để nghe gọi, smartphone giờ đây là trung tâm điều khiển cả đời sống số của người trẻ. Nhưng sự tiện lợi đó đi kèm những đánh đổi nào?",
    category: "thiet-bi-so",
    author: "Gia Bảo",
    tags: ["smartphone", "thói quen", "công nghệ"],
    cover: img("photo-1511707171634-5f897ff02aa9"),
    content: `Một khảo sát nội bộ trong cộng đồng sinh viên TECHZONE cho thấy trung bình mỗi người trẻ mở khoá điện thoại hơn 80 lần mỗi ngày. Con số này phản ánh một thực tế: smartphone không còn là thiết bị liên lạc đơn thuần, mà đã trở thành "cơ quan giác quan thứ sáu" trong đời sống số.

## Từ liên lạc đến trung tâm điều khiển cuộc sống

Ngày nay, một chiếc điện thoại thông minh đảm nhiệm vai trò của ví tiền (thanh toán không tiền mặt), bản đồ, sổ ghi chú, máy ảnh chuyên nghiệp, phòng tập gym (ứng dụng theo dõi sức khoẻ) và lớp học di động. Sự tích hợp này mang lại tiện lợi chưa từng có — chỉ cần một thiết bị, sinh viên có thể vừa học, vừa làm việc nhóm, vừa quản lý tài chính cá nhân.

## Mặt trái: phân mảnh sự tập trung

Tuy nhiên, chính sự tiện lợi đa năng đó cũng là con dao hai lưỡi. Mỗi thông báo đẩy — dù là tin nhắn, email hay cập nhật mạng xã hội — đều kéo sự chú ý ra khỏi công việc đang làm. Các nghiên cứu về tâm lý học nhận thức chỉ ra rằng não bộ cần trung bình vài phút để lấy lại trạng thái tập trung sâu sau mỗi lần bị gián đoạn.

## Thói quen sử dụng đang thay đổi ra sao

- Thế hệ trẻ có xu hướng đọc thông tin theo dạng "lướt nhanh" (scroll) thay vì đọc sâu một văn bản dài.
- Thời gian chú ý trung bình cho một nội dung có xu hướng ngắn lại, kéo theo sự phổ biến của video ngắn.
- Nhiều người hình thành phản xạ kiểm tra điện thoại ngay cả khi không có thông báo nào — một dạng thói quen vô thức.
- Ranh giới giữa thời gian học/làm việc và thời gian giải trí ngày càng mờ nhạt khi mọi thứ diễn ra trên cùng một màn hình.

## Làm sao để làm chủ thiết bị, thay vì bị thiết bị "làm chủ"

Một số giải pháp thực tế mà nhiều sinh viên đang áp dụng: tắt thông báo không cần thiết, dùng chế độ "không làm phiền" trong giờ học, đặt điện thoại ở phòng khác khi cần tập trung sâu, và dùng ứng dụng theo dõi thời gian sử dụng để nhận thức rõ hơn về thói quen của chính mình.

## Kết luận

Smartphone tự thân không tốt hay xấu — vấn đề nằm ở cách sử dụng. Hiểu rõ cơ chế mà các ứng dụng thiết kế để giữ chân người dùng (thông báo, cuộn vô hạn, phần thưởng ngẫu nhiên) là bước đầu tiên để lấy lại quyền kiểm soát thời gian và sự chú ý của chính mình.`,
  },
  {
    title: "Laptop mỏng nhẹ có thực sự phù hợp với mọi sinh viên?",
    summary:
      "Laptop mỏng nhẹ đang là xu hướng được săn đón, nhưng với sinh viên ngành kỹ thuật, thiết kế hay lập trình, liệu đây có phải lựa chọn tối ưu?",
    category: "thiet-bi-so",
    author: "Gia Bảo",
    tags: ["laptop", "thiết bị", "sinh viên"],
    cover: img("photo-1517336714731-489689fd1ca8"),
    content: `Laptop mỏng nhẹ, pin trâu, thiết kế sang trọng — đó là hình ảnh quảng cáo quen thuộc trên mọi gian hàng công nghệ mỗi mùa tựu trường. Nhưng "mỏng nhẹ" có đồng nghĩa với "phù hợp" cho mọi sinh viên hay không lại là câu chuyện khác.

## Ưu điểm không thể phủ nhận

Với sinh viên khối ngành xã hội, kinh tế, ngôn ngữ — những người chủ yếu dùng laptop để soạn thảo văn bản, lên lớp, thuyết trình — một chiếc máy mỏng nhẹ mang lại trải nghiệm di chuyển thoải mái, thời lượng pin đủ dùng cả ngày mà không cần mang theo sạc, và thiết kế gọn gàng dễ mang vào giảng đường.

## Khi nào laptop mỏng nhẹ lại là lựa chọn kém tối ưu

Sinh viên các ngành kỹ thuật, thiết kế đồ hoạ, dựng phim hay lập trình đòi hỏi cấu hình xử lý nặng lại đối mặt với một thực tế khác. Để đạt độ mỏng, nhà sản xuất thường phải đánh đổi: hệ thống tản nhiệt hạn chế khiến máy dễ bị giảm hiệu năng (thermal throttling) khi chạy tác vụ nặng trong thời gian dài, cổng kết nối ít hơn, và khả năng nâng cấp RAM/ổ cứng gần như không có.

Một bạn sinh viên ngành Khoa học máy tính chia sẻ: "Mình từng mua một chiếc máy mỏng nhẹ vì thấy đẹp, nhưng khi biên dịch project lớn, máy nóng rất nhanh và quạt kêu to, hiệu năng tụt rõ rệt so với lúc mới mua."

## Vậy nên chọn laptop theo tiêu chí nào?

1. Xác định tác vụ chính: soạn thảo văn bản, lập trình nhẹ, hay dựng phim/chơi game đồ hoạ nặng?
2. Với tác vụ nặng, ưu tiên máy có hệ thống tản nhiệt tốt hơn là độ mỏng.
3. Kiểm tra khả năng nâng cấp RAM, ổ cứng — nhiều dòng máy siêu mỏng hàn chết linh kiện, không thể nâng cấp sau này.
4. Cân nhắc pin thực tế khi sử dụng liên tục, không chỉ dựa vào thông số quảng cáo.
5. Đừng bỏ qua trọng lượng và độ bền nếu phải di chuyển nhiều giữa các toà nhà trong trường.

## Giải pháp cân bằng

Với ngân sách hạn chế, một lựa chọn thực tế là chọn máy có cấu hình vừa đủ cho nhu cầu hiện tại, cộng thêm một khoản dự phòng cho phụ kiện hỗ trợ (đế tản nhiệt, ổ cứng di động) thay vì cố mua một chiếc máy đắt tiền nhưng không khai thác hết tiềm năng.

## Kết luận

Không có chiếc laptop nào "tốt nhất cho mọi sinh viên" — chỉ có chiếc laptop phù hợp nhất với nhu cầu học tập cụ thể của từng người. Trước khi bị thu hút bởi vẻ ngoài mỏng nhẹ, hãy tự hỏi: mình sẽ dùng máy để làm gì nhiều nhất trong 4 năm đại học?`,
  },
  {
    title: "Tai nghe chống ồn có đáng để sinh viên đầu tư?",
    summary:
      "Giá tai nghe chống ồn chủ động ngày càng dễ tiếp cận hơn. Nhưng với ngân sách sinh viên, đây có phải khoản đầu tư xứng đáng hay chỉ là món đồ 'sang chảnh' không cần thiết?",
    category: "thiet-bi-so",
    author: "Gia Bảo",
    tags: ["tai nghe", "thiết bị", "học tập"],
    cover: img("photo-1484704849700-f032a568e944"),
    content: `Thư viện ồn ào, ký túc xá đông người, quán cà phê học nhóm náo nhiệt — không gian học tập lý tưởng đôi khi là thứ xa xỉ với nhiều sinh viên. Đây cũng là lý do tai nghe chống ồn chủ động (ANC) ngày càng được quan tâm như một công cụ học tập, chứ không chỉ để nghe nhạc.

## Công nghệ chống ồn chủ động hoạt động ra sao

Khác với tai nghe cách âm thụ động (chỉ chặn âm thanh bằng vật lý đệm tai), công nghệ ANC sử dụng micro thu âm tiếng ồn xung quanh, sau đó tạo ra sóng âm ngược pha để triệt tiêu tiếng ồn đó trước khi đến tai người nghe. Hiệu quả rõ rệt nhất với tiếng ồn đều đặn, tần số thấp như tiếng quạt, máy lạnh, tiếng ồn động cơ — nhưng kém hiệu quả hơn với tiếng nói chuyện hay âm thanh đột ngột.

## Lợi ích thực tế cho việc học

Nhiều sinh viên chia sẻ rằng việc đeo tai nghe chống ồn khi học giúp tạo ra một "vùng tập trung di động" — có thể ngồi học ở bất kỳ đâu, từ căng tin đến xe buýt, mà vẫn giữ được mức độ tập trung tương đối ổn định. Đây đặc biệt hữu ích với các bạn sống trong môi trường ký túc xá đông đúc, khó tìm không gian yên tĩnh riêng.

## Nhưng có thực sự cần thiết?

- Nếu môi trường học tập của bạn vốn đã yên tĩnh, khoản đầu tư này có thể chưa cấp thiết.
- Tai nghe chống ồn tốt thường có giá không hề rẻ — cần cân đối với các khoản chi tiêu ưu tiên khác.
- Một số bạn chỉ cần tai nghe nhét tai thông thường kết hợp nhạc không lời cũng đạt hiệu quả tập trung tương tự.
- Sử dụng tai nghe chống ồn quá lâu mỗi ngày cũng cần lưu ý đến sức khoẻ thính giác, nên tuân thủ nguyên tắc nghỉ ngơi định kỳ.

## Tiêu chí chọn mua nếu quyết định đầu tư

1. Thời lượng pin: nên chọn loại có thể dùng cả ngày học mà không cần sạc giữa chừng.
2. Độ thoải mái khi đeo lâu — ưu tiên thử trực tiếp trước khi mua nếu có thể.
3. Chế độ xuyên âm (transparency mode) để nghe thông báo quan trọng mà không cần tháo tai nghe.
4. Khả năng kết nối đa thiết bị nếu bạn thường chuyển qua lại giữa điện thoại và laptop.

## Kết luận

Tai nghe chống ồn không phải "đũa thần" giúp tập trung tuyệt đối, nhưng với đúng người, đúng nhu cầu, nó có thể là công cụ học tập đáng giá. Trước khi xuống tiền, hãy thử đánh giá môi trường học tập hiện tại của bản thân: vấn đề thực sự là tiếng ồn, hay là thói quen mất tập trung?`,
  },
  {
    title: "Chọn mua máy tính bảng cho việc học: những điều cần biết",
    summary:
      "Máy tính bảng ngày càng được nhiều sinh viên dùng để ghi chú, đọc tài liệu. Nhưng trước khi mua, có vài câu hỏi quan trọng cần tự trả lời.",
    category: "thiet-bi-so",
    author: "Gia Bảo",
    tags: ["máy tính bảng", "ghi chú", "thiết bị"],
    cover: img("photo-1544244015-0df4b3ffc6b0"),
    content: `Máy tính bảng kết hợp bút cảm ứng đang dần thay thế vở ghi chép truyền thống trong giảng đường của nhiều sinh viên. Khả năng viết tay tự nhiên, đồng bộ ghi chú lên đám mây và mang theo hàng nghìn trang tài liệu trong một thiết bị mỏng nhẹ là những lý do chính khiến xu hướng này ngày càng phổ biến.

## Máy tính bảng phù hợp với ai?

Nhóm hưởng lợi rõ rệt nhất là sinh viên các ngành cần ghi chú nhiều bằng hình vẽ, sơ đồ, công thức toán học — như y khoa, kiến trúc, kỹ thuật. Khả năng viết tay tự nhiên kết hợp chỉnh sửa linh hoạt (xoá, di chuyển, thu phóng) mang lại trải nghiệm vượt trội so với vở giấy truyền thống.

Ngược lại, nếu công việc chính là gõ văn bản dài, lập trình hay xử lý bảng tính phức tạp, máy tính bảng khó thay thế hoàn toàn laptop — đặc biệt khi chưa có bàn phím vật lý đi kèm.

## Những yếu tố cần cân nhắc trước khi mua

1. **Mục đích sử dụng chính**: ghi chú tay, đọc PDF, hay cả làm việc văn phòng nhẹ?
2. **Bút cảm ứng đi kèm**: độ trễ khi viết, độ nhạy áp lực, có cần mua riêng hay đã bao gồm trong giá máy?
3. **Dung lượng lưu trữ**: tài liệu PDF, video bài giảng có thể chiếm dung lượng lớn theo thời gian.
4. **Hệ sinh thái ứng dụng ghi chú**: một số ứng dụng hỗ trợ đồng bộ đa thiết bị tốt hơn những ứng dụng khác.
5. **Khả năng kết nối bàn phím rời**: nếu có ý định dùng thay thế một phần cho laptop.

## Những hiểu lầm phổ biến

Nhiều sinh viên nghĩ rằng mua máy tính bảng đắt tiền sẽ tự động cải thiện hiệu quả học tập. Thực tế, thiết bị chỉ là công cụ — thói quen ghi chú có hệ thống, ôn tập định kỳ mới là yếu tố quyết định kết quả học tập. Một chiếc máy tính bảng tầm trung kết hợp phương pháp ghi chú tốt vẫn hiệu quả hơn một chiếc máy cao cấp dùng tuỳ hứng.

## Mẹo tận dụng tối đa máy tính bảng trong học tập

- Tạo hệ thống thư mục ghi chú theo môn học ngay từ đầu kỳ để tránh lộn xộn về sau.
- Dùng tính năng tìm kiếm chữ viết tay (nếu có) để tra cứu nhanh ghi chú cũ.
- Sao lưu định kỳ lên đám mây, tránh mất dữ liệu khi thiết bị gặp sự cố.
- Kết hợp đọc PDF có chú thích trực tiếp thay vì in giấy để tiết kiệm chi phí và thân thiện môi trường hơn.

## Kết luận

Máy tính bảng là khoản đầu tư đáng cân nhắc nếu phù hợp với phong cách học tập của bạn, nhưng không phải là điều kiện bắt buộc để học tốt. Hãy thử mượn hoặc trải nghiệm thực tế trước khi quyết định chi một khoản tiền không nhỏ.`,
  },

  // ===== Kỹ năng số (4) =====
  {
    title: "Những kỹ năng số quan trọng trong thị trường lao động",
    summary:
      "Nhà tuyển dụng ngày càng đòi hỏi ứng viên không chỉ giỏi chuyên môn mà còn thành thạo công cụ số. Đâu là những kỹ năng nên ưu tiên trau dồi ngay từ khi còn là sinh viên?",
    category: "ky-nang-so",
    author: "Thuỳ Linh",
    tags: ["kỹ năng số", "việc làm", "sinh viên"],
    cover: img("photo-1552664730-d307ca884978"),
    content: `Một bản mô tả công việc (job description) ngày nay hiếm khi thiếu dòng yêu cầu "thành thạo tin học văn phòng" hoặc "có khả năng sử dụng công cụ số". Nhưng cụ thể đó là những kỹ năng gì, và tại sao chúng lại quan trọng đến vậy?

## Kỹ năng số không chỉ là biết dùng máy tính

Nhiều người vẫn nhầm lẫn kỹ năng số với việc đơn giản là "biết gõ Word, Excel". Thực tế, kỹ năng số bao gồm một phổ rộng hơn nhiều: từ khả năng tìm kiếm và đánh giá thông tin đáng tin cậy, sử dụng công cụ cộng tác trực tuyến, đến hiểu biết cơ bản về bảo mật dữ liệu cá nhân.

## Nhóm kỹ năng nhà tuyển dụng tìm kiếm

### Xử lý dữ liệu cơ bản

Khả năng đọc hiểu, phân tích và trình bày dữ liệu bằng bảng tính là kỹ năng nền tảng cho hầu hết công việc văn phòng, không chỉ riêng ngành tài chính hay phân tích dữ liệu. Biết dùng công thức cơ bản, tạo biểu đồ trực quan đã là một lợi thế đáng kể so với mặt bằng chung.

### Cộng tác trực tuyến

Làm việc từ xa và làm việc nhóm phân tán đã trở thành chuẩn mực mới. Thành thạo công cụ quản lý dự án, chia sẻ tài liệu đồng thời, và giao tiếp hiệu quả qua các kênh trực tuyến là yêu cầu gần như bắt buộc.

### Tư duy bảo mật cơ bản

Hiểu cách tạo mật khẩu an toàn, nhận diện email lừa đảo (phishing), và biết khi nào không nên chia sẻ thông tin nhạy cảm — đây là kỹ năng ngày càng được doanh nghiệp đánh giá cao, đặc biệt trong bối cảnh các vụ rò rỉ dữ liệu ngày càng phổ biến.

### Giao tiếp số hiệu quả

Viết email chuyên nghiệp, trình bày ý tưởng rõ ràng trong các cuộc họp trực tuyến, và biết cách tóm tắt thông tin súc tích — những kỹ năng tưởng chừng "mềm" này lại đóng vai trò quyết định trong môi trường làm việc số hoá.

## Làm sao để trau dồi những kỹ năng này khi còn là sinh viên?

- Chủ động làm quen với các công cụ văn phòng, cộng tác trực tuyến ngay trong quá trình làm bài tập nhóm.
- Tham gia các dự án, câu lạc bộ có yếu tố phối hợp từ xa để rèn kỹ năng giao tiếp số.
- Tự học qua các khoá học trực tuyến miễn phí về phân tích dữ liệu cơ bản.
- Thực hành thói quen bảo mật tốt ngay từ tài khoản cá nhân: mật khẩu mạnh, xác thực hai lớp.

## Kết luận

Kỹ năng chuyên môn vẫn là nền tảng, nhưng kỹ năng số chính là "chất xúc tác" giúp kiến thức đó được vận dụng hiệu quả trong môi trường làm việc hiện đại. Đầu tư thời gian trau dồi những kỹ năng này từ khi còn ngồi trên ghế giảng đường sẽ là lợi thế cạnh tranh rõ rệt khi bước vào thị trường lao động.`,
  },
  {
    title: "Những ứng dụng giúp sinh viên quản lý thời gian hiệu quả",
    summary:
      "Deadline chồng deadline, lịch học dày đặc — quản lý thời gian là kỹ năng sống còn với sinh viên. Dưới đây là cách tiếp cận đúng, không chỉ là danh sách ứng dụng.",
    category: "ky-nang-so",
    author: "Thuỳ Linh",
    tags: ["quản lý thời gian", "năng suất", "ứng dụng"],
    cover: img("photo-1506784983877-45594efa4cbe"),
    content: `"Mình có cả chục ứng dụng quản lý thời gian trong điện thoại nhưng vẫn luôn trễ deadline" — đây là tâm sự quen thuộc của không ít sinh viên. Vấn đề thường không nằm ở việc thiếu công cụ, mà ở cách tiếp cận quản lý thời gian chưa đúng.

## Công cụ chỉ là phương tiện, phương pháp mới là gốc rễ

Trước khi tìm ứng dụng phù hợp, cần hiểu rõ nguyên tắc quản lý thời gian cơ bản. Một trong những phương pháp phổ biến và dễ áp dụng là phân loại công việc theo mức độ quan trọng và khẩn cấp, giúp xác định đâu là việc cần làm ngay, đâu là việc có thể lên lịch sau.

## Nhóm ứng dụng theo nhu cầu

### Ứng dụng lập lịch và nhắc nhở

Giúp hình dung tổng quan lịch học, deadline bài tập, và các hoạt động ngoại khoá trong cùng một giao diện. Điểm mấu chốt không phải là chọn ứng dụng nào "xịn" nhất, mà là duy trì thói quen cập nhật lịch đều đặn — một lịch trình không được cập nhật thì vô dụng dù công cụ có tốt đến đâu.

### Ứng dụng quản lý công việc dạng danh sách

Phù hợp để chia nhỏ một dự án lớn (như làm đồ án tốt nghiệp) thành các đầu việc cụ thể, dễ theo dõi tiến độ. Kỹ thuật chia nhỏ công việc giúp giảm cảm giác choáng ngợp khi đối diện với deadline lớn.

### Ứng dụng theo dõi thời gian tập trung

Sử dụng kỹ thuật làm việc theo chu kỳ ngắn (tập trung cao độ 25 phút, nghỉ 5 phút) giúp duy trì sự tỉnh táo trong các phiên học dài. Nhiều sinh viên nhận thấy hiệu quả rõ rệt khi áp dụng kỹ thuật này cho các môn học đòi hỏi tư duy sâu như lập trình hay toán học.

## Những sai lầm phổ biến khi quản lý thời gian bằng ứng dụng

- Dành quá nhiều thời gian "tối ưu hoá" công cụ thay vì thực sự làm việc.
- Lên kế hoạch quá chi tiết, không có khoảng đệm cho những việc phát sinh.
- Không đánh giá lại kế hoạch cuối tuần để điều chỉnh cho tuần tiếp theo.
- Dùng quá nhiều ứng dụng cùng lúc khiến thông tin bị phân tán, khó theo dõi tổng thể.

## Xây dựng thói quen, không chỉ tải ứng dụng

Một nguyên tắc đơn giản nhưng hiệu quả: mỗi tối trước khi ngủ, dành 5-10 phút xem lại lịch trình ngày mai và xác định 3 việc quan trọng nhất cần hoàn thành. Thói quen nhỏ này, duy trì đều đặn, thường mang lại hiệu quả cao hơn việc sở hữu ứng dụng quản lý thời gian đắt tiền nhất.

## Kết luận

Không có ứng dụng nào tự động giúp bạn quản lý thời gian tốt hơn nếu thiếu kỷ luật cá nhân. Hãy chọn một công cụ đơn giản, phù hợp với thói quen hiện tại, và quan trọng nhất — kiên trì sử dụng đều đặn thay vì liên tục đổi sang ứng dụng mới mỗi khi cảm thấy chán.`,
  },
  {
    title: "Cách bảo vệ dữ liệu cá nhân khi sử dụng Wi-Fi công cộng",
    summary:
      "Wi-Fi miễn phí ở quán cà phê, thư viện tiện lợi nhưng tiềm ẩn rủi ro bảo mật. Đây là những bước đơn giản giúp bạn tự bảo vệ dữ liệu khi kết nối mạng công cộng.",
    category: "ky-nang-so",
    author: "Thuỳ Linh",
    tags: ["bảo mật", "Wi-Fi", "an toàn mạng"],
    cover: img("photo-1573164713988-8665fc963095"),
    content: `Wi-Fi miễn phí gần như là tiêu chuẩn mặc định tại các quán cà phê, thư viện, trung tâm thương mại. Nhưng ít ai để ý rằng mạng công cộng không mật khẩu hoặc dùng chung mật khẩu cho hàng trăm người lại là môi trường lý tưởng cho các hình thức tấn công mạng cơ bản.

## Vì sao Wi-Fi công cộng tiềm ẩn rủi ro

Trên một mạng Wi-Fi công cộng, dữ liệu truyền giữa thiết bị của bạn và router có thể bị người dùng khác trong cùng mạng "nghe lén" nếu kết nối không được mã hoá đúng cách. Một số kẻ xấu còn tạo ra các điểm phát Wi-Fi giả mạo mang tên giống hệt mạng thật (ví dụ "Cafe_Free_Wifi") để dụ người dùng kết nối nhầm, từ đó thu thập thông tin đăng nhập.

## Những dấu hiệu cảnh báo cần lưu ý

- Mạng Wi-Fi không yêu cầu mật khẩu nhưng vẫn hiện trang đăng nhập yêu cầu nhập thông tin cá nhân chi tiết bất thường.
- Trình duyệt cảnh báo chứng chỉ bảo mật không hợp lệ khi truy cập một trang web quen thuộc.
- Xuất hiện nhiều mạng Wi-Fi có tên gần giống nhau tại cùng một địa điểm.

## Các bước bảo vệ bản thân khi dùng mạng công cộng

1. **Tránh giao dịch nhạy cảm**: không đăng nhập ngân hàng, ví điện tử khi đang dùng Wi-Fi công cộng nếu có thể chờ đến khi dùng mạng tin cậy hơn.
2. **Ưu tiên trang web có HTTPS**: biểu tượng ổ khoá trên thanh địa chỉ cho biết dữ liệu được mã hoá khi truyền đi — dù vậy, đây không phải lớp bảo vệ tuyệt đối.
3. **Tắt tính năng tự động kết nối Wi-Fi**: tránh để thiết bị tự động kết nối vào các mạng từng dùng trước đó, kể cả mạng giả mạo cùng tên.
4. **Dùng mạng riêng ảo (VPN) đáng tin cậy** nếu thường xuyên phải làm việc trên mạng công cộng — đây là lớp mã hoá bổ sung giúp bảo vệ dữ liệu ngay cả khi mạng Wi-Fi không an toàn.
5. **Bật xác thực hai lớp** cho các tài khoản quan trọng, để dù mật khẩu có bị lộ, kẻ xấu vẫn khó đăng nhập được.
6. **Cập nhật phần mềm thiết bị thường xuyên** để vá các lỗ hổng bảo mật đã biết.

## Thói quen nhỏ, bảo vệ lớn

Phần lớn các rủi ro bảo mật không đến từ những cuộc tấn công phức tạp, mà từ những thói quen chủ quan: dùng chung một mật khẩu cho nhiều tài khoản, bỏ qua cảnh báo bảo mật của trình duyệt, hay kết nối vào bất kỳ mạng Wi-Fi miễn phí nào mà không kiểm tra.

## Kết luận

Wi-Fi công cộng không có nghĩa là nguy hiểm tuyệt đối, nhưng đòi hỏi người dùng có ý thức bảo mật cao hơn khi sử dụng. Những thói quen đơn giản kể trên, nếu được thực hành đều đặn, có thể giảm đáng kể rủi ro mất dữ liệu cá nhân trong đời sống số hằng ngày.`,
  },
  {
    title: "Làm chủ Google Workspace: kỹ năng văn phòng số cơ bản",
    summary:
      "Docs, Sheets, Slides — bộ công cụ miễn phí này gần như là ngôn ngữ chung của môi trường học tập và làm việc hiện đại. Đây là những tính năng sinh viên nên biết.",
    category: "ky-nang-so",
    author: "Thuỳ Linh",
    tags: ["Google Workspace", "kỹ năng văn phòng", "cộng tác"],
    cover: img("photo-1460925895917-afdab827c52f"),
    content: `Không cần cài đặt phần mềm, không tốn chi phí bản quyền, chỉ cần một tài khoản Google — đó là lý do bộ công cụ văn phòng trực tuyến trở thành lựa chọn phổ biến trong môi trường học thuật, từ làm bài tập nhóm đến thuyết trình đồ án tốt nghiệp.

## Cộng tác thời gian thực: thay đổi cách làm việc nhóm

Điểm khác biệt lớn nhất so với phần mềm văn phòng truyền thống là khả năng nhiều người cùng chỉnh sửa một tài liệu trong thời gian thực, thấy con trỏ và thay đổi của nhau ngay lập tức. Điều này giải quyết triệt để tình trạng "gửi file qua lại" từng gây ra vô số phiên bản trùng lặp, dễ nhầm lẫn.

## Những tính năng sinh viên nên khai thác

### Lịch sử phiên bản

Mọi thay đổi trên tài liệu đều được lưu lại tự động, cho phép xem lại hoặc khôi phục phiên bản cũ bất cứ lúc nào. Tính năng này đặc biệt hữu ích khi làm việc nhóm và cần xác định ai đã thay đổi phần nào, hoặc khi lỡ xoá nhầm nội dung quan trọng.

### Bình luận và đề xuất chỉnh sửa

Thay vì chỉnh sửa trực tiếp gây khó theo dõi, tính năng "đề xuất chỉnh sửa" cho phép góp ý mà không làm thay đổi nội dung gốc ngay lập tức — phù hợp khi giảng viên hoặc trưởng nhóm cần duyệt lại trước khi áp dụng thay đổi.

### Công thức và hàm trong bảng tính

Nắm vững các hàm cơ bản (tính tổng có điều kiện, tra cứu dữ liệu, xử lý văn bản) giúp xử lý dữ liệu khảo sát, bảng điểm, hay ngân sách cá nhân nhanh hơn đáng kể so với tính thủ công.

### Biểu mẫu khảo sát trực tuyến

Công cụ tạo biểu mẫu tích hợp sẵn cho phép thu thập dữ liệu khảo sát và tự động tổng hợp kết quả vào bảng tính — rất hữu ích cho các đề tài nghiên cứu nhỏ hoặc khảo sát phục vụ đồ án.

## Mẹo tổ chức tài liệu hiệu quả

- Đặt tên file có cấu trúc rõ ràng (môn học - tên đề tài - ngày cập nhật) để dễ tìm kiếm sau này.
- Tạo thư mục riêng cho từng môn học hoặc dự án, tránh để tài liệu rải rác.
- Phân quyền truy cập hợp lý: chỉ "xem" hoặc "bình luận" cho người ngoài nhóm, "chỉnh sửa" chỉ dành cho thành viên chính thức.
- Dùng tính năng gắn thẻ (@tên người dùng) trong bình luận để thông báo trực tiếp cho thành viên liên quan.

## Kết luận

Thành thạo các công cụ văn phòng trực tuyến không chỉ giúp việc học nhóm trôi chảy hơn, mà còn là kỹ năng nền tảng gần như bắt buộc khi bước vào môi trường làm việc thực tế, nơi cộng tác từ xa đã trở thành chuẩn mực phổ biến.`,
  },

  // ===== Xu hướng số (3) =====
  {
    title: "Mạng xã hội đang ảnh hưởng đến khả năng tập trung ra sao?",
    summary:
      "Video ngắn, thông báo liên tục, nội dung được cá nhân hoá tối đa — mạng xã hội hiện đại được thiết kế để giữ chân người dùng. Điều đó đang âm thầm định hình lại cách não bộ xử lý sự tập trung.",
    category: "xu-huong-so",
    author: "Minh Khuê",
    tags: ["mạng xã hội", "tập trung", "sức khoẻ tâm lý"],
    cover: img("photo-1611162617213-7d7a39e9b1d7"),
    content: `"Mình chỉ định lướt 5 phút trước khi học bài, mở mắt ra đã một tiếng trôi qua" — câu chuyện quen thuộc này không hoàn toàn do thiếu ý chí cá nhân, mà một phần đến từ cách các nền tảng mạng xã hội hiện đại được thiết kế.

## Cơ chế giữ chân người dùng hoạt động ra sao

Các nền tảng video ngắn và mạng xã hội sử dụng thuật toán đề xuất nội dung dựa trên hành vi tương tác trước đó, liên tục tinh chỉnh để đưa ra nội dung "vừa đủ hấp dẫn" để người dùng tiếp tục cuộn xuống. Cơ chế phần thưởng ngẫu nhiên — không biết nội dung tiếp theo sẽ thú vị hay nhàm chán — kích hoạt phản ứng tương tự như các trò chơi có yếu tố may rủi, khiến não bộ muốn "thử thêm một lần nữa".

## Tác động đến khả năng tập trung sâu

Các nhà nghiên cứu về nhận thức phân biệt hai dạng tập trung: tập trung nông (xử lý nhiều luồng thông tin ngắn, liên tục chuyển đổi) và tập trung sâu (duy trì sự chú ý liên tục vào một nhiệm vụ phức tạp trong thời gian dài). Việc tiếp xúc thường xuyên với nội dung dạng ngắn có thể khiến não bộ quen với nhịp độ kích thích nhanh, khiến các nhiệm vụ đòi hỏi tập trung sâu — như đọc sách, giải bài toán phức tạp — trở nên khó khăn hơn tương đối.

## Không phải ai cũng bị ảnh hưởng như nhau

Mức độ ảnh hưởng khác nhau tuỳ vào tần suất sử dụng, mục đích sử dụng (giải trí thụ động hay tìm kiếm thông tin có chủ đích), và khả năng tự điều chỉnh hành vi của mỗi người. Một số nghiên cứu cũng chỉ ra rằng vấn đề không chỉ nằm ở bản thân mạng xã hội, mà còn ở bối cảnh sử dụng — dùng mạng xã hội như một cách "trốn tránh" nhiệm vụ khó thường gây hại nhiều hơn so với sử dụng có kiểm soát trong thời gian nghỉ ngơi hợp lý.

## Một số cách giảm thiểu tác động

- Đặt giới hạn thời gian sử dụng ứng dụng bằng tính năng có sẵn trên điện thoại.
- Tắt thông báo đẩy không cần thiết, giữ lại duy nhất những thông báo thực sự quan trọng.
- Dành những khoảng thời gian cố định trong ngày để tập trung sâu, hoàn toàn không có thiết bị gây xao nhãng.
- Thay thế thói quen "lướt mạng khi rảnh" bằng một hoạt động khác không liên quan màn hình, dù chỉ trong vài phút.
- Luyện tập đọc sách giấy hoặc nội dung dài định kỳ để duy trì khả năng tập trung sâu.

## Kết luận

Mạng xã hội không phải "kẻ thù" cần loại bỏ hoàn toàn, nhưng hiểu rõ cách các nền tảng này được thiết kế để giữ chân sự chú ý là bước đầu tiên giúp người dùng trẻ chủ động hơn trong việc bảo vệ khả năng tập trung của chính mình — một kỹ năng ngày càng trở nên quý giá trong thời đại thông tin quá tải.`,
  },
  {
    title: "Những rủi ro bảo mật người dùng trẻ cần biết",
    summary:
      "Từ lừa đảo qua tin nhắn đến rò rỉ dữ liệu cá nhân trên mạng xã hội, người dùng trẻ đang đối mặt với nhiều rủi ro bảo mật mới. Nhận diện sớm là cách phòng vệ tốt nhất.",
    category: "xu-huong-so",
    author: "Thuỳ Linh",
    tags: ["bảo mật", "lừa đảo mạng", "an toàn số"],
    cover: img("photo-1563013544-824ae1b704d3"),
    content: `Người dùng trẻ — nhóm tiếp xúc công nghệ sớm và thường xuyên nhất — lại nghịch lý thay cũng là nhóm dễ trở thành mục tiêu của các hình thức lừa đảo trực tuyến ngày càng tinh vi. Hiểu rõ các hình thức phổ biến là bước đầu tiên để tự bảo vệ mình.

## Lừa đảo qua tin nhắn và cuộc gọi giả mạo

Hình thức phổ biến nhất hiện nay là giả danh ngân hàng, cơ quan chức năng hoặc sàn thương mại điện tử để yêu cầu cung cấp mã OTP, thông tin thẻ ngân hàng với lý do "xác minh tài khoản" hoặc "nhận quà trúng thưởng". Kẻ xấu thường tạo cảm giác khẩn cấp (tài khoản sắp bị khoá, ưu đãi sắp hết hạn) để nạn nhân mất cảnh giác và hành động vội vàng.

## Lừa đảo tuyển dụng và việc làm thêm

Sinh viên tìm việc làm thêm là nhóm mục tiêu đặc biệt dễ bị nhắm đến. Các chiêu trò phổ biến gồm yêu cầu đóng phí "giữ chỗ" trước khi nhận việc, hoặc dụ dỗ tham gia các mô hình đầu tư tài chính với lời hứa lợi nhuận cao bất thường trong thời gian ngắn.

## Rò rỉ thông tin cá nhân qua mạng xã hội

Nhiều người trẻ vô tình chia sẻ quá nhiều thông tin cá nhân công khai: ngày sinh, trường học, lịch trình di chuyển hằng ngày, thậm chí ảnh chụp giấy tờ tuỳ thân. Những mảnh thông tin tưởng chừng vô hại này, khi kẻ xấu ghép lại, có thể dùng để giả mạo danh tính hoặc trả lời chính xác các câu hỏi bảo mật tài khoản.

## Dấu hiệu nhận biết lừa đảo trực tuyến

- Yêu cầu cung cấp mã OTP, mật khẩu qua điện thoại hoặc tin nhắn — không tổ chức uy tín nào yêu cầu điều này.
- Tạo áp lực thời gian, yêu cầu quyết định ngay lập tức.
- Đường link rút gọn hoặc tên miền có lỗi chính tả nhỏ, giả mạo thương hiệu quen thuộc.
- Cơ hội "quá tốt để là thật": lợi nhuận cao bất thường, quà tặng giá trị lớn không rõ lý do.

## Cách tự bảo vệ bản thân

1. Không bao giờ chia sẻ mã OTP, mật khẩu cho bất kỳ ai, kể cả người tự xưng là nhân viên ngân hàng.
2. Xác minh thông tin qua kênh chính thức (gọi trực tiếp tổng đài, truy cập website chính thức) thay vì qua đường link được gửi đến.
3. Hạn chế công khai thông tin cá nhân nhạy cảm trên mạng xã hội, kiểm tra lại cài đặt quyền riêng tư định kỳ.
4. Cảnh giác với mọi lời mời làm việc yêu cầu đóng phí trước.
5. Báo cáo và chặn ngay các tài khoản, số điện thoại có dấu hiệu lừa đảo.

## Kết luận

Không có công nghệ nào bảo vệ người dùng tuyệt đối trước lừa đảo trực tuyến — nhận thức và sự cảnh giác cá nhân vẫn là lớp phòng vệ quan trọng nhất. Khi nghi ngờ, nguyên tắc an toàn nhất luôn là: dừng lại, xác minh, rồi mới hành động.`,
  },
  {
    title: "Làm việc từ xa và tương lai của không gian văn phòng",
    summary:
      "Làm việc từ xa không còn là giải pháp tạm thời mà đang định hình lại cách các công ty thiết kế văn phòng và tổ chức công việc. Thế hệ lao động trẻ sẽ bước vào một thị trường việc làm rất khác.",
    category: "xu-huong-so",
    author: "Gia Bảo",
    tags: ["làm việc từ xa", "xu hướng", "tương lai việc làm"],
    cover: img("photo-1521737711867-e3b97375f902"),
    content: `Khái niệm "đi làm" của thế hệ lao động trẻ hiện nay đã khác rất nhiều so với một thập kỷ trước. Mô hình làm việc kết hợp (hybrid) — một phần thời gian tại văn phòng, một phần làm việc từ xa — đang trở thành chuẩn mực mới tại nhiều công ty công nghệ và cả các ngành truyền thống.

## Từ giải pháp tình thế đến mô hình lâu dài

Ban đầu được xem như giải pháp ứng phó tạm thời, làm việc từ xa dần chứng minh được hiệu quả ở nhiều khía cạnh: tiết kiệm thời gian di chuyển, linh hoạt giờ giấc, và mở rộng phạm vi tuyển dụng không giới hạn địa lý. Nhiều công ty nhận ra rằng năng suất không nhất thiết gắn liền với việc có mặt vật lý tại văn phòng.

## Không gian văn phòng đang thay đổi ra sao

Thay vì hàng dãy bàn làm việc cố định, nhiều văn phòng hiện đại chuyển sang mô hình "hot-desking" — nhân viên không có chỗ ngồi cố định mà đặt chỗ theo nhu cầu từng ngày. Diện tích dành cho phòng họp, không gian làm việc nhóm được mở rộng, trong khi diện tích bàn làm việc cá nhân thu hẹp lại, phản ánh đúng thực tế rằng văn phòng giờ đây chủ yếu dùng cho hoạt động cộng tác, còn công việc tập trung cá nhân thường diễn ra tại nhà.

## Cơ hội và thách thức cho người lao động trẻ

### Cơ hội

- Tiếp cận cơ hội việc làm từ các công ty không giới hạn ở thành phố nơi mình sinh sống.
- Linh hoạt sắp xếp thời gian, phù hợp với những người có nhu cầu học thêm hoặc làm nhiều việc song song.
- Giảm chi phí và thời gian di chuyển, có thêm thời gian cho phát triển bản thân.

### Thách thức

- Khó xây dựng mạng lưới quan hệ nghề nghiệp (networking) tự nhiên như khi làm việc trực tiếp.
- Đòi hỏi kỹ năng tự quản lý thời gian và kỷ luật cá nhân cao hơn.
- Ranh giới giữa công việc và cuộc sống cá nhân dễ bị xoá nhoà khi làm việc tại nhà.
- Cơ hội được hướng dẫn, kèm cặp trực tiếp (mentorship) từ đồng nghiệp giàu kinh nghiệm có thể hạn chế hơn.

## Kỹ năng cần chuẩn bị cho thị trường lao động linh hoạt

Thành thạo công cụ cộng tác trực tuyến, khả năng giao tiếp rõ ràng bằng văn bản, và kỹ năng tự tạo động lực làm việc không cần giám sát trực tiếp sẽ là những yếu tố ngày càng được đánh giá cao, không kém gì kỹ năng chuyên môn thuần tuý.

## Kết luận

Thế hệ lao động trẻ hiện nay bước vào một thị trường việc làm linh hoạt hơn nhưng cũng đòi hỏi nhiều kỹ năng tự chủ hơn so với trước đây. Chuẩn bị sẵn sàng cho mô hình làm việc kết hợp ngay từ khi còn là sinh viên — qua các dự án nhóm trực tuyến, thực tập từ xa — sẽ là lợi thế không nhỏ khi chính thức gia nhập thị trường lao động.`,
  },

  // ===== Đời sống số (3) =====
  {
    title: "Cai nghiện mạng xã hội: những bước nhỏ tạo thay đổi lớn",
    summary:
      "Không cần xoá hết tài khoản mạng xã hội để lấy lại sự cân bằng. Đôi khi, chỉ vài điều chỉnh nhỏ trong thói quen hằng ngày đã tạo ra khác biệt rõ rệt.",
    category: "doi-song-so",
    author: "Thuỳ Linh",
    tags: ["cân bằng số", "sức khoẻ tâm lý", "thói quen"],
    cover: img("photo-1542751371-adc38448a05e"),
    content: `"Cai nghiện mạng xã hội" nghe có vẻ cực đoan — xoá hết ứng dụng, biến mất khỏi mọi nền tảng. Nhưng với phần lớn người trẻ, giải pháp thực tế hơn nhiều lại nằm ở việc điều chỉnh thói quen sử dụng, chứ không phải từ bỏ hoàn toàn.

## Vì sao "cai nghiện hoàn toàn" thường không bền vững

Mạng xã hội giờ đây gắn liền với nhiều khía cạnh đời sống: giữ liên lạc bạn bè, cập nhật thông tin, thậm chí là kênh tìm kiếm việc làm. Việc cắt đứt hoàn toàn thường dẫn đến cảm giác bị cô lập hoặc bỏ lỡ thông tin quan trọng (FOMO), khiến nhiều người quay lại sử dụng với cường độ còn mạnh hơn sau một thời gian ngắn kiêng cữ.

## Những bước nhỏ nhưng hiệu quả

### 1. Xác định mục đích trước khi mở ứng dụng

Thay vì mở mạng xã hội theo phản xạ vô thức, hãy tự hỏi: mình mở để làm gì cụ thể? Nếu không có câu trả lời rõ ràng, đó thường là dấu hiệu của thói quen tự động, không thực sự cần thiết.

### 2. Dọn dẹp danh sách theo dõi

Bỏ theo dõi những tài khoản khiến bạn cảm thấy tiêu cực, so sánh bản thân, hoặc không mang lại giá trị thực sự. Thuật toán đề xuất nội dung dựa trên những gì bạn tương tác — chủ động "huấn luyện" lại thuật toán bằng cách tương tác với nội dung tích cực, hữu ích hơn.

### 3. Tạo "vùng không màn hình"

Chỉ định một vài khung giờ cố định trong ngày hoàn toàn không dùng thiết bị điện tử — ví dụ: 30 phút đầu tiên sau khi thức dậy, hoặc một giờ trước khi ngủ. Khoảng thời gian này giúp não bộ có thời gian "reset" thay vì bị kích thích liên tục ngay từ sáng sớm.

### 4. Thay thế, đừng chỉ loại bỏ

Nếu chỉ cố gắng ngừng một thói quen mà không thay thế bằng hoạt động khác, khả năng tái nghiện rất cao. Chuẩn bị sẵn một hoạt động thay thế cụ thể (đọc sách, đi bộ, gọi điện cho bạn bè) cho những lúc cảm thấy muốn mở điện thoại theo quán tính.

## Những dấu hiệu cho thấy bạn nên điều chỉnh thói quen

- Cảm thấy lo lắng, bồn chồn khi không có điện thoại bên cạnh.
- So sánh cuộc sống bản thân với hình ảnh "hoàn hảo" trên mạng xã hội, dẫn đến cảm giác tự ti.
- Thời gian sử dụng mạng xã hội ảnh hưởng rõ rệt đến giấc ngủ hoặc kết quả học tập.
- Mở ứng dụng mạng xã hội mà không nhớ rõ lý do, chỉ đơn thuần theo phản xạ.

## Cân bằng, không phải loại bỏ

Mục tiêu cuối cùng không phải là tẩy chay công nghệ, mà là giành lại quyền chủ động: tự quyết định khi nào dùng, dùng để làm gì, thay vì để thuật toán quyết định thay mình. Đây là kỹ năng sống quan trọng trong một thế giới mà ranh giới giữa đời sống thực và đời sống số ngày càng mờ nhạt.

## Kết luận

Thay đổi thói quen sử dụng mạng xã hội không cần phải là một cuộc "đại tu" đột ngột. Những điều chỉnh nhỏ, kiên trì áp dụng mỗi ngày, thường mang lại hiệu quả bền vững hơn nhiều so với các đợt "cai nghiện" ngắn hạn rồi quay lại thói quen cũ.`,
  },
  {
    title: "Ứng dụng theo dõi sức khoẻ: công cụ hay con dao hai lưỡi?",
    summary:
      "Đếm bước chân, theo dõi giấc ngủ, nhịp tim — các ứng dụng sức khoẻ mang lại dữ liệu chi tiết chưa từng có. Nhưng liệu việc theo dõi quá sát sao có đang gây hại nhiều hơn lợi?",
    category: "doi-song-so",
    author: "Gia Bảo",
    tags: ["sức khoẻ số", "ứng dụng", "wearable"],
    isPremium: true,
    cover: img("photo-1576243345690-4e4b79b63288"),
    content: `Thiết bị đeo thông minh và ứng dụng sức khoẻ đã biến mỗi bước chân, mỗi giờ ngủ, mỗi nhịp tim thành dữ liệu có thể đo lường, theo dõi và phân tích. Với nhiều người, đây là công cụ tạo động lực mạnh mẽ để sống lành mạnh hơn. Nhưng với một số khác, chính những con số này lại trở thành nguồn gốc của lo âu.

## Mặt tích cực: dữ liệu tạo động lực thay đổi hành vi

Việc nhìn thấy số bước chân, calo tiêu thụ hay chất lượng giấc ngủ dưới dạng con số cụ thể giúp nhiều người nhận thức rõ hơn về thói quen sinh hoạt của bản thân — điều mà trước đây chỉ là cảm nhận mơ hồ. Hiệu ứng "được đo lường là được quản lý" (what gets measured gets managed) phát huy tác dụng rõ rệt: nhiều người có xu hướng vận động nhiều hơn khi biết mục tiêu bước chân hằng ngày của mình.

Với giấc ngủ, dữ liệu theo dõi chu kỳ ngủ giúp người dùng nhận ra những yếu tố ảnh hưởng tiêu cực (dùng điện thoại trước khi ngủ, uống caffeine muộn) mà trước đây khó tự nhận biết nếu không có số liệu cụ thể đối chiếu.

## Mặt trái: khi theo dõi trở thành ám ảnh

Tuy nhiên, giới chuyên môn về sức khoẻ tâm lý đã ghi nhận một hiện tượng đáng chú ý: một số người dùng phát triển mối quan hệ không lành mạnh với dữ liệu sức khoẻ của chính mình — liên tục kiểm tra số liệu, cảm thấy lo lắng quá mức khi "chưa đạt mục tiêu" trong ngày, hoặc đánh giá giá trị bản thân dựa hoàn toàn vào các con số trên ứng dụng.

Một vấn đề khác là độ chính xác của thiết bị đeo giá rẻ không phải lúc nào cũng đáng tin cậy — sai số trong đo nhịp tim hoặc chất lượng giấc ngủ có thể dẫn đến những kết luận sai lệch nếu người dùng quá phụ thuộc vào số liệu mà không đối chiếu với cảm nhận cơ thể thực tế.

## Dùng dữ liệu sức khoẻ số một cách lành mạnh

- Xem các con số là tham khảo, không phải thước đo tuyệt đối cho giá trị bản thân.
- Đặt mục tiêu thực tế, phù hợp với thể trạng cá nhân, thay vì so sánh với người khác.
- Nếu nhận thấy bản thân lo lắng quá mức vì chưa "đạt chỉ tiêu", cân nhắc tạm ngừng theo dõi một thời gian.
- Ưu tiên lắng nghe cảm nhận cơ thể thực tế (mệt mỏi, đau nhức) hơn là chỉ tin tuyệt đối vào số liệu trên màn hình.
- Tham khảo ý kiến chuyên gia y tế nếu có bất thường về sức khoẻ, thay vì tự chẩn đoán qua ứng dụng.

## Kết luận

Ứng dụng và thiết bị theo dõi sức khoẻ là công cụ hỗ trợ hữu ích khi được sử dụng đúng cách — cung cấp thông tin để đưa ra quyết định tốt hơn, chứ không phải để tạo áp lực hay thay thế hoàn toàn cảm nhận tự nhiên của cơ thể. Ranh giới giữa "công cụ hỗ trợ" và "nguồn gốc lo âu" đôi khi rất mong manh, tuỳ thuộc vào cách mỗi người tiếp cận dữ liệu của chính mình.`,
  },
  {
    title: "Thanh toán không tiền mặt đã thay đổi thói quen chi tiêu người trẻ",
    summary:
      "Quét mã QR, chạm thẻ, chuyển khoản trong vài giây — thanh toán không tiền mặt mang lại sự tiện lợi vượt trội. Nhưng nó cũng đang âm thầm thay đổi cách người trẻ cảm nhận về tiền bạc.",
    category: "doi-song-so",
    author: "Minh Khuê",
    tags: ["thanh toán số", "tài chính cá nhân", "thói quen chi tiêu"],
    cover: img("photo-1556742049-0cfed4f6a45d"),
    content: `Chỉ với một chiếc điện thoại, người trẻ ngày nay có thể mua một ly trà sữa, đóng tiền học phí, hay chia tiền ăn với bạn bè chỉ trong vài giây. Thanh toán không tiền mặt đã trở thành thói quen mặc định, nhưng ít ai dừng lại để nghĩ về cách nó đang thay đổi mối quan hệ của chúng ta với tiền bạc.

## Tiện lợi vượt trội, nhưng "cảm giác mất tiền" cũng biến mất

Các nhà nghiên cứu hành vi tiêu dùng từ lâu đã chỉ ra rằng việc thanh toán bằng tiền mặt tạo ra "nỗi đau trả tiền" (pain of paying) rõ rệt hơn so với thanh toán số — cảm giác vật lý khi nhìn thấy tiền rời khỏi ví khiến não bộ ghi nhận việc chi tiêu rõ ràng hơn. Khi thao tác chỉ còn là một cú chạm hoặc quét mã, cảm giác "mất tiền" trở nên mờ nhạt, dễ dẫn đến chi tiêu vượt kế hoạch mà không hề hay biết.

## Những thay đổi trong thói quen chi tiêu

### Chi tiêu nhỏ lẻ tích luỹ thành khoản lớn

Một ly cà phê, một đơn hàng giao đồ ăn, một lượt mua sắm trực tuyến nhỏ — mỗi khoản chi riêng lẻ có vẻ không đáng kể, nhưng khi thanh toán không tiền mặt loại bỏ rào cản tâm lý, tần suất các khoản chi nhỏ này có xu hướng tăng lên, cộng dồn thành con số đáng kể vào cuối tháng mà nhiều người không nhận ra cho đến khi xem lại sao kê.

### Khó hình dung tổng quan tài chính

Khi tiền "biến mất" qua nhiều kênh thanh toán khác nhau (ví điện tử, thẻ ngân hàng, ứng dụng mua trước trả sau), việc hình dung tổng thể dòng tiền trở nên khó khăn hơn so với thời kỳ chỉ dùng tiền mặt, nơi số dư trong ví là thước đo trực quan nhất.

## Làm sao để chi tiêu thông minh trong thời đại không tiền mặt

1. **Theo dõi chi tiêu định kỳ**: dùng ứng dụng quản lý tài chính cá nhân để tổng hợp chi tiêu từ nhiều nguồn thanh toán vào một nơi duy nhất.
2. **Đặt ngân sách theo danh mục**: phân bổ rõ ràng cho ăn uống, giải trí, học tập, tránh chi tiêu tuỳ hứng không kiểm soát.
3. **Tạo "khoảng dừng" trước khi mua**: với các khoản chi không thiết yếu, thử áp dụng quy tắc chờ 24 giờ trước khi quyết định mua, giúp hạn chế chi tiêu theo cảm xúc nhất thời.
4. **Xem lại sao kê hằng tuần** thay vì chỉ cuối tháng, để kịp thời điều chỉnh nếu chi tiêu đang vượt kế hoạch.
5. **Cẩn trọng với các hình thức mua trước trả sau**: tiện lợi trong ngắn hạn nhưng dễ tạo áp lực tài chính nếu không tính toán kỹ khả năng chi trả.

## Kết luận

Thanh toán không tiền mặt không phải là nguyên nhân trực tiếp gây ra thói quen chi tiêu thiếu kiểm soát, nhưng nó loại bỏ những rào cản tâm lý tự nhiên từng giúp con người cân nhắc kỹ hơn trước mỗi lần chi tiêu. Hiểu rõ cơ chế này là bước đầu tiên để người trẻ xây dựng thói quen tài chính lành mạnh trong một thế giới ngày càng không tiền mặt.`,
  },
];

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu TECHZONE...");

  // --- Chuyên mục ---
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        order: c.order,
        description: c.description,
        showOnHome: c.showOnHome ?? true,
      },
    });
  }
  console.log(`✓ ${CATEGORIES.length} chuyên mục`);

  // --- Tác giả ---
  const passwordHash = await bcrypt.hash("techzone2026", 10);
  for (const a of AUTHORS) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { name: a.name, email: a.email, role: a.role, bio: a.bio, passwordHash },
    });
  }
  console.log(`✓ ${AUTHORS.length} tài khoản tác giả (mật khẩu chung: techzone2026)`);

  // --- Bài viết ---
  let created = 0;
  for (const art of ARTICLES) {
    const existing = await prisma.article.findFirst({ where: { title: art.title } });
    if (existing) continue;

    const category = await prisma.category.findUniqueOrThrow({ where: { slug: art.category } });
    const author = await prisma.user.findUniqueOrThrow({
      where: { email: AUTHORS.find((a) => a.name === art.author)!.email },
    });

    const baseSlug = slugify(art.title);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.article.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const tagRecords = await Promise.all(
      art.tags.map((name) => {
        const tagSlug = slugify(name);
        return prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name, slug: tagSlug },
        });
      })
    );

    // Rải ngày đăng trong 30 ngày gần nhất để trang chủ/mới nhất có thứ tự tự nhiên.
    const daysAgo = Math.floor(Math.random() * 30);
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const viewCount = Math.floor(Math.random() * 4000) + 50;

    await prisma.article.create({
      data: {
        slug,
        title: art.title,
        summary: art.summary,
        content: art.content,
        coverImageUrl: art.cover,
        readingMinutes: estimateReadingMinutes(art.content),
        isFeatured: Boolean(art.isFeatured),
        isPremium: Boolean(art.isPremium),
        viewCount,
        publishedAt,
        authorId: author.id,
        categoryId: category.id,
        tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
      },
    });
    created += 1;
  }
  console.log(`✓ ${created} bài viết mới (tổng dữ liệu mẫu: ${ARTICLES.length})`);

  console.log("🌱 Seed hoàn tất.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
