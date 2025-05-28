import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Video, Clock, User } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5" />
            <span>Tutoring Platform</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="#learning-options"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Learning Options
            </Link>
            <Link
              href="#certification"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Certification
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Flexible Learning Options for Every Student
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Choose from three distinct learning paths, all culminating
                    in recognized certification.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/signup">
                    <Button size="lg">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/signup?role=tutor">
                    <Button size="lg" variant="outline">
                      Become a Tutor
                    </Button>
                  </Link>
                </div>
              </div>
              <img
                src="/OIP.jpeg"
                width={550}
                height={550}
                alt="Tutoring Image"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Learning Options Section */}
        <section
          id="learning-options"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Our Learning Options
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Three distinct paths to achieve your educational goals
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Video className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Independent Learning</h3>
                <p className="text-center text-muted-foreground">
                  Self-paced courses with 24/7 access to materials. Learn at
                  your convenience with no live sessions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Group Sessions</h3>
                <p className="text-center text-muted-foreground">
                  Live online classes with fixed schedules. Mandatory attendance
                  and group collaboration.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <User className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">One-on-One Tutoring</h3>
                <p className="text-center text-muted-foreground">
                  Personalized sessions with flexible scheduling. Request
                  sessions as needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Certification Section */}
        <section id="certification" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Earn Recognized Certification
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  All successful participants receive certification upon
                  completion, regardless of learning path.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="h-12 w-12 text-primary" />
                <BookOpen className="h-12 w-12 text-primary" />
                <Users className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5" />
            <span>Tutoring Platform</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Tutoring Platform. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terms-and-conditions"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms and Conditions
            </Link>
            {/* <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
