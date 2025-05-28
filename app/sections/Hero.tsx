"use client";
import { useEffect, useState } from "react";
import Ballpit from "../components/Ballpit";
import { Cover } from "../components/cover";

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return (
    <section className="py-16  overflow-x-clip h-[80vh]">
      <div
        style={{
          position: "absolute",
          overflow: "hidden",
          minHeight: "70vh",
          maxHeight: "72%",
          width: "100%",
        }}
      >
        <Ballpit
          count={isMobile ? 80 : 120}
          gravity={isMobile ? 1.2 : 0.9}
          friction={isMobile ? 0.99 : 0.9975}
          wallBounce={0.95}
          followCursor={false}
          colors={[
            "#0fd8d7", // primary aqua
            "#0fcac8", // slightly darker aqua
            "#0fe4e1", // lighter aqua
            "#0f9fa5", // teal variant
            "#ffffff", // white for contrast
            "#1b1b1f", // deep neutral gray
          ]}
        />
      </div>
      <div className="container mx-auto relative ">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center mt-6 max-w-5xl  mx-auto">
          Build amazing websites at <Cover>warp speed</Cover>
        </h1>

        {/* <form className="flex border bg-black border-white/15 rounded-full p-2 mt-8 max-w-lg mx-5 md:mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="bg-transparent px-4 flex-1"
          />
          <button
            type="submit"
            className="border border-[#0fd8d7] bg-[#0fd8d7]  text-neutral-950 h-10 rounded-full px-6 font-medium   items-center whitespace-nowrap"
          >
            Subscribe
          </button>
        </form> */}
      </div>
    </section>
  );
}
