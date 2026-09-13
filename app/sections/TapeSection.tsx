import { Sparkles } from "lucide-react";

const words = [
  "design",
  "Layout",
  "Content",
  "Hosting",
  "Domain",
  "SEO",
  "Marketing",
  "Analytics",
];

export default function TapeSection() {
  return (
    <div className="py-16 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-300 to-sky-400 overflow-hidden -rotate-3 scale-105 w-[102%] -mx-[1%]">
        <div className="flex [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
          <div className="flex flex-none gap-8 py-4 animate-infinite-scroll">
            {[...words, ...words].map((word, index) => (
              <div
                className="inline-flex gap-4 items-center shrink-0"
                key={`${word}-${index}`}
              >
                <span className="text-gray-900 uppercase font-extrabold text-lg whitespace-nowrap">
                  {word}
                </span>
                <Sparkles
                  className="size-6 text-gray-900 -rotate-12"
                  fill="black"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
