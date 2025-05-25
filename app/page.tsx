import Counter from "./sections/Counter";
import Faqs from "./sections/Faqs";
import Hero from "./sections/Hero";
import Navbar from "./sections/Navbar";
import ServicesSection from "./sections/ServicesSection";
import TapeSection from "./sections/TapeSection";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Counter />
      <ServicesSection />
      <TapeSection />
      <Faqs />
    </div>
  );
}
