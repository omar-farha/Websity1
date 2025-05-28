import Image from "next/image";
import logo from "@/app/assets/images/weblogo.png";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#services" },
  { label: "Integrations", href: "#integrations" },
  { label: "FAQs", href: "#faqs" },
];

export default function Navbar() {
  return (
    <nav>
      <section className="py-4 lg:py-8">
        <div className="container sm:max-w-7xl md:max-w-4xl lg:max-w-5xl mx-auto md:px-8 px-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 border border-white/15 rounded-full p-2 px-4 md:pr-2 items-center">
            <div>
              <Image
                src={logo}
                alt="logo"
                className="h-10 md:h-15 w-auto"
                priority
              />
            </div>
            <div className="lg:flex justify-center items-center hidden">
              <nav className="flex gap-6 font-medium">
                {navLinks.map((link) => (
                  <a href={link.href} key={link.label}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex justify-end gap-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-menu md:hidden"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <button className="border border-white h-12 rounded-full px-6 font-medium hidden md:inline-flex items-center">
                Log In
              </button>
              <button className="border border-[#0fd8d7] bg-[#0fd8d7] text-neutral-950 h-12 rounded-full px-6 font-medium hidden md:inline-flex items-center">
                Sign up
              </button>
            </div>
          </div>
        </div>
      </section>
    </nav>
  );
}
