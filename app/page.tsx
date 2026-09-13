import Approach from "./sections/Approach";
import ContactUs from "./sections/ContactUs";
import Counter from "./sections/Counter";
import Faqs from "./sections/Faqs";
import Hero from "./sections/Hero";
import Navbar from "./sections/Navbar";
import Projects from "./sections/Projects";
import TapeSection from "./sections/TapeSection";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Counter />
      <Projects />
      <Approach />
      <TapeSection />
      <Faqs />
      <ContactUs />
    </div>
  );
}
