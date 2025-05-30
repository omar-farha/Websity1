"use client";
import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const Counter = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <div ref={ref} className="py-16 md:py-24 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* Stats Section */}
          <div className="w-full lg:w-auto flex-1 grid grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <h2 className="font-bold tabular-nums text-[#0fd8d7] text-4xl md:text-5xl lg:text-6xl">
                {inView ? <CountUp end={25} duration={2} /> : "0"}
                <span className="text-[#0fd8d7]">+</span>
              </h2>
              <p className="mt-3 text-neutral-300 text-sm md:text-base lg:text-lg">
                Happy Clients
              </p>
            </div>

            <div className="text-center">
              <h2 className="font-bold tabular-nums text-[#0fd8d7] text-4xl md:text-5xl lg:text-6xl">
                {inView ? <CountUp end={60} duration={2} /> : "0"}
                <span className="text-[#0fd8d7]">+</span>
              </h2>
              <p className="mt-3 text-neutral-300 text-sm md:text-base lg:text-lg">
                Projects Delivered
              </p>
            </div>

            <div className="text-center">
              <h2 className="font-bold tabular-nums text-[#0fd8d7] text-4xl md:text-5xl lg:text-6xl">
                {inView ? <CountUp end={100} duration={2} suffix="%" /> : "0%"}
              </h2>
              <p className="mt-3 text-neutral-300 text-sm md:text-base lg:text-lg">
                Satisfaction Rate
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-start">
            <p className="text-neutral-400 text-center lg:text-left text-lg md:text-xl leading-relaxed">
              Websity is an open-source website builder that empowers developers
              and creators to build stunning, fast, and responsive websites with
              ease.
            </p>

            <button className="mt-8 px-8 py-3 bg-[#0fd8d7] hover:bg-[#0bc5c4] text-neutral-950 font-semibold rounded-full transition-all duration-300 flex items-center gap-2 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 group-hover:rotate-12 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counter;
