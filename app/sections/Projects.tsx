"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import por1 from "../assets/images/pro1.png";
import ne3ma from "../assets/images/ne3ma.png";
import ecom from "../assets/images/Screenshot (175).png";
import cell from "../assets/images/Screenshot (176).png";

const CardCarousel = () => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const cards = [
    {
      id: 1,
      image: por1,
      description: "Portfolio website showcasing projects and skills.",
      tags: ["Minimalist", "Clean"],
    },
    {
      id: 2,
      image: ne3ma,
      description: "Platform for connecting Donners with clients.",
      tags: ["Sleek", "Modern"],
    },
    {
      id: 3,
      image: ecom,
      description:
        "E-commerce platform with advanced features for better user experience.",
      tags: ["Elegant", "Professional"],
    },
    {
      id: 4,
      image: cell,
      description: "Dashboard for managing business operations.",
      tags: ["Elegant", "Professional"],
    },
  ];

  // Duplicate cards array for seamless scroll
  const repeatedCards = [
    ...cards,
    ...cards,
    ...cards,
    ...cards,
    ...cards,
    ...cards,
  ];

  // Measure width of all cards container on mount
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.scrollWidth / 2); // width of one set (cards only)
    }
  }, []);

  useEffect(() => {
    if (!containerWidth) return;

    controls.start({
      x: [0, -containerWidth],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 50,
          ease: "linear",
        },
      },
    });
  }, [controls, containerWidth]);

  // Slow down animation on hover instead of stop
  const handleMouseEnter = () => {
    controls.start({
      // x: [0, -containerWidth],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 60, // slower duration
          ease: "linear",
        },
      },
    });
  };

  const handleMouseLeave = () => {
    controls.start({
      // x: [0, -containerWidth],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear",
        },
      },
    });
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "backOut",
      },
    }),
    hover: {
      y: -10,
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const imageHoverVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const tagVariants = {
    hover: {
      y: -2,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      transition: { duration: 0.2 },
    },
  };

  return (
    <section className="services relative py-12 md:py-20" id="projects">
      <div className="container px-4 mx-auto">
        <motion.div
          className="services_titles"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Our Recent Projects
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-400">
            We transform your ideas into unique web projects that captivate both
            you and your customers.
          </p>
        </motion.div>
        <div
          className="relative w-full overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            className="flex gap-8 py-10 w-max"
            ref={containerRef}
            animate={controls}
            style={{ x: 0 }}
          >
            {repeatedCards.map((card, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-[360px] rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-4 shadow-lg cursor-pointer"
                custom={index % cards.length}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                variants={cardVariants}
              >
                <motion.div
                  className="relative w-full h-[240px] rounded-xl overflow-hidden bg-black"
                  variants={imageHoverVariants}
                >
                  <Image
                    src={card.image}
                    alt="Project"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </motion.div>

                <div className="mt-5 px-1">
                  <motion.p className="text-white text-lg font-semibold mb-3 leading-snug">
                    {card.description}
                  </motion.p>
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        className="text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
                        variants={tagVariants}
                        whileHover="hover"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CardCarousel;
