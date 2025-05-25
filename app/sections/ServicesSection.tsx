"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const services = [
  {
    number: "01",
    title: "Website Design & Development",
    description:
      "Crafting responsive, fast, and user-friendly websites tailored to your brand and business goals. From concept to deployment, we build stunning websites that convert.",
  },
  {
    number: "02",
    title: "Shopify Website Help",
    description:
      "Specialized in creating and optimizing Shopify stores. Whether you're starting from scratch or improving an existing one, we streamline your e-commerce presence for better performance and sales.",
  },
  {
    number: "03",
    title: "Dashboard Management",
    description:
      "We help you build or manage custom admin dashboards that simplify your workflow, including user analytics, product control, order tracking, and more—all in one place.",
  },
  {
    number: "04",
    title: "Website Maintenance & Fixes",
    description:
      "Ensure your website stays secure, up-to-date, and error-free. We provide ongoing maintenance services and quick bug fixes to keep your site running smoothly.",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
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

export default function ServicesSection() {
  const [active, setActive] = useState(0);

  const handleHover = (index: React.SetStateAction<number>) => {
    setActive(index);
  };
  const handleLeave = () => {
    setActive(0);
  };

  return (
    <section className="services relative py-12 md:py-20">
      <div className="container px-4 mx-auto">
        <motion.div
          className="services_titles"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Our Quality Services
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-400">
            We put your ideas and thus your wishes in the form of a unique web
            project that inspires you and your customers.
          </p>
        </motion.div>

        <motion.div
          className="services_menu mt-12 lg:px-10 xl:px-40"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className={`services_item ${
                active === index ? "sactive" : ""
              } relative`}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={handleLeave}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="left_s_box">
                <span className="text-lg md:text-xl font-bold">
                  {service.number}
                </span>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-medium">
                  {service.title}
                </h3>
              </div>
              <div className="right_s_box">
                <p className="text-sm md:text-base">{service.description}</p>
              </div>
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className="hidden md:block md:size-7"
              >
                <path d="M18.25 15.5a.75.75 0 0 1-.75-.75V7.56L7.28 17.78a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L16.44 6.5H9.25a.75.75 0 0 1 0-1.5h9a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75Z"></path>
              </svg>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
