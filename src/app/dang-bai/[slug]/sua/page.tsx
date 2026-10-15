import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/ArticleForm";

export const metadata = { title: "Sửa bài viết — TECHZONE" };
export const revalidate = 0;

export default async function EditArticlePage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/dang-nhap?callbackUrl=/dang-bai/${params.slug}/sua`);

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { slug: params.slug } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!article) notFound();

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (article.authorId !== userId && role !== "ADMIN") {
    redirect("/tai-khoan");
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-extrabold text-navy">Sửa bài viết</h1>
        <div className="mt-6">
          <ArticleForm
            categories={categories}
            initial={{
              slug: article.slug,
              title: article.title,
              summary: article.summary,
              content: article.content,
              coverImageUrl: article.coverImageUrl,
              categoryId: article.categoryId,
              isPremium: article.isPremium,
            }}
          />
        </div>
      </div>
    </div>
  );
}
