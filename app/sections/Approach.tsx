"use client";
import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion } from "framer-motion";
import "react-vertical-timeline-component/style.min.css";
import SectionWrapper from "../hoc/SectionWrapper";

const experiences = [
  {
    title: "Planning & Strategy",
    company_name: "",
    icon: "1",
    iconBg: "#0fd8d7",
    date: "Stage",
    points: [
      "We'll collaborate to map out your website's goals, target audience, and key functionalities. We'll discuss things like site structure, navigation, and content requirements.",
    ],
  },
  {
    title: "Development & Progress Update",
    company_name: "",
    icon: "2",
    iconBg: "#0fd8d7",
    date: "Stage",
    points: [
      "Once we agree on the plan, I cue my lofi playlist and dive into coding. From initial sketches to polished code, I keep you updated every step of the way.",
    ],
  },
  {
    title: "Development & Launch",
    company_name: "",
    icon: "3",
    iconBg: "#0fd8d7",
    date: "Stage",
    points: [
      "This is where the magic happens! Based on the approved design, I'll translate everything into functional code, building your website from the ground up.",
    ],
  },
  {
    title: "Testing & Quality Assurance",
    company_name: "",
    icon: "4",
    iconBg: "#0fd8d7",
    date: "Stage",
    points: [
      "Before we go live, I rigorously test your website to ensure everything works flawlessly. This includes checking for bugs, optimizing performance, and ensuring a smooth user experience.",
    ],
  },
];
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

type ExperienceType = {
  title: string;
  company_name: string;
  icon: string;
  iconBg: string;
  date: string;
  points: string[];
};

type ExperienceCardProps = {
  experience: ExperienceType;
};

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  return (
    <VerticalTimelineElement
      contentStyle={{
        background: "#191919", // dark teal background
        color: "#fff",
        boxShadow: "0 3px #104f4f",
        fontSize: "20px",
      }}
      contentArrowStyle={{ borderRight: "7px solid #191919" }} // teal arrow
      date={experience.date}
      iconStyle={{ background: experience.iconBg, color: "#fff" }} // teal icon bg
      icon={
        <div className="flex justify-center items-center w-full h-full">
          <span className="w-[60%] h-[60%] object-contain text-[24px] flex justify-center items-center">
            {experience.icon}
          </span>
        </div>
      }
    >
      <div>
        <h3 className="text-white text-[24px] font-bold">{experience.title}</h3>
        <p
          className="text-gray-300 text-[16px] font-semibold"
          style={{ margin: 0 }}
        >
          {experience.company_name}
        </p>
      </div>

      <ul className="mt-5 list-disc ml-5 space-y-2">
        {experience.points.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className="text-gray-100 text-[14px] pl-1 tracking-wider"
          >
            {point}
          </li>
        ))}
      </ul>
    </VerticalTimelineElement>
  );
};

const Experience: React.FC = () => {
  return (
    <>
      <style>
        {`
          /* Teal timeline line */
          .vertical-timeline::before {
            background: #0fd8d7 !important;
          }
        `}
      </style>

      <div className="container px-4 mx-auto" id="Approach">
        <motion.div
          className="services_titles"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Our Approach
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-400">
            Building unique websites that align with your goals and connect
            meaningfully with your customers.
          </p>
        </motion.div>

        <div className="mt-20 flex flex-col">
          <VerticalTimeline>
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={`experience-${index}`}
                experience={experience}
              />
            ))}
          </VerticalTimeline>
        </div>
      </div>
    </>
  );
};

export default SectionWrapper(Experience, "work");
