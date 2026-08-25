import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-blue-600">
            TrialBridge AI
          </div>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              Accelerate Medical Breakthroughs with AI-Driven Trial Matching
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              TrialBridge AI connects patients with life-saving clinical trials using advanced genomic and medical history analysis.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-lg">
                  Join as a Patient
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-white">
                  Join as a Researcher
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">Why TrialBridge AI?</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl font-bold">1</div>
                <h3 className="text-xl font-semibold mb-3">Precision Matching</h3>
                <p className="text-slate-600">Our AI analyzes your genomic data and medical history to find the perfect trial match.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl font-bold">2</div>
                <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                <p className="text-slate-600">Your health data is encrypted and strictly access-controlled with HIPAA-compliant standards.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl font-bold">3</div>
                <h3 className="text-xl font-semibold mb-3">Accelerate Research</h3>
                <p className="text-slate-600">Researchers can find eligible candidates faster, reducing the time to market for new treatments.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} TrialBridge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
