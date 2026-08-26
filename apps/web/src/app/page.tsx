import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-extrabold text-2xl tracking-tight text-blue-700 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl">T</span>
            TrialBridge AI
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/login" className="text-slate-600 font-medium hover:text-blue-600 transition-colors text-sm">
              Sign In
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-32 relative z-10">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm animate-fade-in-up">
              🚀 Next-Generation Clinical Matchmaking
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Accelerate Medical <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Breakthroughs</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Connecting patients with life-saving clinical trials using advanced genomic vector analysis and AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto transition-transform hover:-translate-y-1">
                  Find Your Trial
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/50 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white w-full sm:w-auto transition-transform hover:-translate-y-1">
                  Researcher Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white relative z-10 border-t border-slate-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Why TrialBridge AI?</h2>
              <p className="text-lg text-slate-500">Built for scale, privacy, and absolute precision.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 text-2xl shadow-inner">🧬</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Precision Matching</h3>
                <p className="text-slate-600 leading-relaxed">Our AI performs hyper-dimensional vector analysis on your genomic data to find the absolute perfect trial match.</p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 text-2xl shadow-inner">🔒</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Enterprise Security</h3>
                <p className="text-slate-600 leading-relaxed">Your health data is encrypted at rest and in transit. Fully anonymized matching ensures HIPAA-compliant privacy.</p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 text-2xl shadow-inner">⚡</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Accelerate Research</h3>
                <p className="text-slate-600 leading-relaxed">Researchers bypass traditional recruiting, instantly accessing a pipeline of hyper-qualified, pre-screened candidates.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 bg-slate-900 text-slate-400 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="font-bold text-xl text-white mb-4 flex items-center justify-center gap-2">
             <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs">T</span>
             TrialBridge AI
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} TrialBridge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
