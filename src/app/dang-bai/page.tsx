import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/ArticleForm";

export const metadata = { title: "Đăng bài viết — TECHZONE" };
export const revalidate = 0;

export default async function SubmitArticlePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/dang-bai");

  if ((session.user as any).role !== "ADMIN") {
    return (
      <div className="py-24 text-center">
        <h1 className="text-xl font-bold text-navy">Bạn không có quyền đăng bài</h1>
        <p className="mt-2 text-sm text-ink/60">
          Chỉ tài khoản quản trị viên mới đăng được bài viết. Nếu bạn cần đăng bài, hãy liên hệ
          quản trị viên của TECHZONE.
        </p>
      </div>
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-extrabold text-navy">Đăng bài viết mới</h1>
        <p className="mt-1 text-sm text-ink/60">
          Bài viết sẽ hiển thị công khai ngay sau khi đăng. Hệ thống tự nhận diện chuyên mục bạn
          chọn để xếp bài vào đúng khu vực tương ứng trên trang chủ.
        </p>
        <div className="mt-6">
          <ArticleForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
