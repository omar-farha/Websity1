import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-[#0fd8d7] tracking-widest uppercase">
        404
      </p>
      <h1 className="mt-4 text-3xl md:text-5xl font-medium tracking-tight">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 text-white/60 max-w-md">
        The page you&apos;re looking for may have been moved or removed.
        Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0fd8d7] hover:bg-[#0bc5c4] text-neutral-950 font-semibold h-12 px-6 transition-colors"
      >
        Back to homepage
      </Link>
    </div>
  );
}
