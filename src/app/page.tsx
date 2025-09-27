import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart3, Tag, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession();

  // If user is authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="relative px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
              Elegant task
              <br />
              <span className="text-muted-foreground">management</span>
            </h1>
          </div>

          <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Transform your productivity with TaskFlow's sophisticated approach
            to task organization. Clean, focused, and beautifully designed for
            the modern professional.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="group">
              <Link href="/register" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Thoughtfully designed features
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Every detail crafted for clarity, efficiency, and elegance
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl border bg-card p-8 transition-all hover:shadow-lg">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Task Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create, organize, and track tasks with intuitive priority levels
                and due dates. Clean interface that keeps you focused on what
                matters.
              </p>
            </div>

            <div className="group rounded-2xl border bg-card p-8 transition-all hover:shadow-lg">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Progress Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Beautiful dashboards and analytics help you understand your
                productivity patterns and celebrate your achievements.
              </p>
            </div>

            <div className="group rounded-2xl border bg-card p-8 transition-all hover:shadow-lg">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Smart Organization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Custom categories with color coding help you organize work by
                project, priority, or any system that works for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl border bg-card p-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ready to transform your workflow?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join TaskFlow today and experience task management designed for
              the modern professional.
            </p>
            <Button asChild size="lg" className="group">
              <Link href="/register" className="flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
