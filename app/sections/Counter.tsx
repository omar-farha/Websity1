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
    <div ref={ref} className="py-24">
      {/* Container for consistent padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-7 lg:gap-20">
          <div className="lg:col-span-4 flex justify-between lg:space-x-24 grow">
            <div className="text-center">
              <h2 className="tracking-[-0.02rem] font-bold tabular-nums text-[#0fd8d7] text-4xl md:text-5xl">
                {inView ? <CountUp end={25} duration={2} /> : "0"}
              </h2>
              <p className="mt-2 text-md md:text-lg">Clients</p>
            </div>
            <div className="text-center">
              <h2 className="tracking-[-0.02rem] font-bold tabular-nums text-[#0fd8d7] text-4xl md:text-5xl">
                {inView ? <CountUp end={60} duration={2} /> : "0"}
              </h2>
              <p className="mt-2 text-md md:text-lg">Websites Built</p>
            </div>
            <div className="text-center">
              <h2 className="tracking-[-0.02rem] font-bold tabular-nums text-[#0fd8d7] text-4xl md:text-5xl">
                Meta
              </h2>
              <p className="mt-2 text-md md:text-lg">Certificate</p>
            </div>
          </div>

          <div className="lg:col-span-3 mt-10 lg:mt-0">
            <p className="text-light text-lg leading-tight">
              Websity is an open-source website builder that empowers developers
              and creators to build stunning, fast, and responsive websites with
              ease.
            </p>
            <a
              href="/pro"
              className="inline-flex items-center justify-center mt-5 px-6 h-10 text-md font-bold rounded-full shadow-md text-[#0fd8d7] relative pro-button bg-neutral-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              Book Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counter;
