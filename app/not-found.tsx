import Link from "next/link";
import {ArrowLeft,CircleDot} from "lucide-react";
export default function NotFound(){
 return <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
  <Link href="/" className="mb-12 flex items-center gap-2 font-semibold"><CircleDot className="text-violet-600"/> signalboard.</Link>
  <div className="eyebrow text-violet-600">404 · LOST THE SIGNAL</div>
  <h1 className="mt-4 text-4xl font-semibold">This page isn’t here.</h1>
  <p className="mt-3 max-w-sm text-sm leading-6 muted">The link may be old, or this experiment may have moved on.</p>
  <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white"><ArrowLeft size={15}/> Back to SignalBoard</Link>
 </main>;
}