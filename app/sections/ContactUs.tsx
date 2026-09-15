"use client";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import bg from "../assets/images/footer-grid.svg";
import Linkedin from "../assets/images/vecteezy_linkedin-png-icon_16716470.png";
import Whats from "../assets/images/whatsap5.png";
import Insta from "../assets/images/pngwing.com.png";
import { submitLead, type LeadFormState } from "@/app/lib/leads";

export default function ContactUs({ categories }: { categories: string[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<LeadFormState>({});
  const [formKey, setFormKey] = useState(0);

  const socialMedia = [
    {
      id: 1,
      img: Insta,
      link: "https://www.instagram.com/websity_dev?igsh=aWFwNjduanZkeTVr&utm_source=qr",
    },
    {
      id: 2,
      img: Linkedin,
      link: "https://linkedin.com/company/websity-dev",
    },
    {
      id: 3,
      img: Whats,
      link: "https://wa.me/201141412551",
    },
  ];

  const fadeIn = {
    start: { opacity: 0 },
    end: { opacity: 1, transition: { duration: 0.7 } },
  };

  const fadeInUp = {
    start: { y: 30, opacity: 0 },
    end: { y: 0, opacity: 1, transition: { duration: 0.7 } },
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await submitLead(undefined, formData);
      setResult(res);
      if (res.success) setFormKey((k) => k + 1);
    });
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-200 focus:border-[#000319] outline-none transition bg-white text-neutral-900";

  return (
    <footer
      className="w-full pt-20 pb-10 text-white relative mx-auto sm:px-10 px-5"
      id="contact"
    >
      {/* background grid */}
      <div className="w-full absolute left-0 bottom-0 min-h-96 z-0">
        <Image
          src={bg}
          alt="grid"
          className="w-full h-full opacity-50"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className="flex flex-col items-center relative z-10">
        <motion.h1
          variants={fadeIn}
          initial="start"
          whileInView="end"
          viewport={{ once: true }}
          className="font-bold text-4xl md:text-5xl text-center lg:max-w-[45vw]"
        >
          Ready to take <span className="text-[#0fd8d7]">your</span> digital
          presence to the next level?
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          initial="start"
          whileInView="end"
          viewport={{ once: true }}
          className="text-white-200 md:mt-10 my-5 text-center"
        >
          Tell us a bit about your project and we&apos;ll get back to you.
        </motion.p>

        <div className="max-w-[720px] w-full px-4 flex justify-center z-10 mt-10">
          <form key={formKey} action={handleSubmit} className="w-full space-y-4">
            <motion.input
              variants={fadeInUp}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              type="text"
              name="name"
              placeholder="Your name"
              required
              className={inputClass}
            />
            <motion.input
              variants={fadeInUp}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              type="tel"
              name="phone"
              placeholder="Phone number"
              required
              className={inputClass}
            />
            <motion.select
              variants={fadeInUp}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              name="category"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>
                What kind of project is this?
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </motion.select>
            <motion.input
              variants={fadeInUp}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              type="text"
              name="budget"
              placeholder="Expected budget"
              required
              className={inputClass}
            />
            <motion.input
              variants={fadeInUp}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              type="text"
              name="monthly_clients"
              placeholder="Roughly how many clients do you handle per month?"
              required
              className={inputClass}
            />
            <motion.input
              variants={fadeInUp}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              type="text"
              name="timeline"
              placeholder="Expected timeline (e.g. 2-3 weeks)"
              required
              className={inputClass}
            />

            {result.success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-center"
              >
                Message sent successfully! We&apos;ll be in touch soon.
              </motion.p>
            )}
            {result.error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-center"
              >
                {result.error}
              </motion.p>
            )}

            <motion.button
              variants={fadeInUp}
              initial="start"
              whileInView="end"
              viewport={{ once: true }}
              type="submit"
              disabled={isPending}
              className={`mx-auto block border bg-[#0fd8d7] hover:bg-transparent hover:text-white cursor-pointer text-[#000319] font-semibold rounded-md px-6 py-2 shadow-md transition focus:outline-none ${
                isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPending ? "Sending..." : "Send Message"}
            </motion.button>
          </form>
        </div>
      </div>

      <div className="flex mt-16 md:flex-row flex-col justify-between items-center px-4">
        <p className="md:text-base text-sm font-light pb-5">
          Copyright © 2025{" "}
          <a href="/about" className="text-[#0fd8d7] hover:underline">
            Websity
          </a>
        </p>

        <div className="flex items-center md:gap-3 gap-6">
          {socialMedia.map((info) => (
            <div
              key={info.id}
              className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300"
            >
              <a href={info.link} target="_blank" rel="noopener noreferrer">
                {info.img && (
                  <Image src={info.img} alt="icons" width={20} height={20} />
                )}
              </a>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
