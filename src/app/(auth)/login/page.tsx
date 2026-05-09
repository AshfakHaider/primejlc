import { LoginForm } from "@/components/forms/login-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="premium-grid absolute inset-0" />
      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-7">
          <div className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
            Bangladesh to Japan study visa operations
          </div>
          <div className="max-w-2xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Prime Japanese Language Centre
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              A premium CRM for language batches, student recruitment, documents, COE, visa, payments, expenses, and partner school operations.
            </p>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {["COE pipeline", "Payment tracking", "Visa reporting"].map((item) => (
              <div key={item} className="rounded-lg border bg-card/80 p-4 text-sm font-medium shadow-sm backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
