import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReaderAccess } from "@/lib/premium";
import { PAYMENT_SIMULATED, getPlan } from "@/lib/plans";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata = { title: "Thanh toán Premium — TECHZONE" };
export const revalidate = 0;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const plan = getPlan(searchParams.plan || "");
  if (!plan) redirect("/premium");

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/dang-nhap?callbackUrl=${encodeURIComponent(`/premium/thanh-toan?plan=${plan.id}`)}`);
  }

  if (!PAYMENT_SIMULATED) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-ink/70">Thanh toán hiện chưa khả dụng. Vui lòng quay lại sau.</p>
        <Link href="/premium" className="mt-4 inline-block text-electric hover:underline">
          ← Về trang gói Premium
        </Link>
      </div>
    );
  }

  const access = await getReaderAccess(session);
  const currentUntil = !access.isAdmin && access.canReadPremium ? access.premiumUntil : null;

  return (
    <div className="mx-auto max-w-lg py-10">
      <Link href="/premium" className="text-sm text-ink/50 hover:text-electric">
        ← Chọn gói khác
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold text-navy">Thanh toán</h1>
      <CheckoutForm plan={plan} currentUntil={currentUntil ? currentUntil.toISOString() : null} />
    </div>
  );
}
