import Ballpit from "../components/Ballpit";
import { Cover } from "../components/cover";

export default function Hero() {
  return (
    <section className="py-16  overflow-x-clip h-[80vh]">
      <div
        style={{
          position: "absolute",
          overflow: "hidden",
          //   minHeight: "70vh",
          maxHeight: "72%",
          width: "100%",
        }}
      >
        <Ballpit
          count={120}
          gravity={0.9}
          friction={0.9975}
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
        {/* <div className=" absolute -left-32 top-16">
          <Image src={design1} alt="design" className="" />
        </div>
        <div className=" absolute -right-64 -top-16">
          <Image src={design2} alt="design" />
        </div>
        <div className=" absolute">
          <Pointer />
        </div> */}

        <div className="flex justify-center ">
          {/* <div className=" inline-flex py-1 px-3 bg-gradient-to-r from-[#0fd8d7] to-[#ff8c42] rounded-full text-neutral-950 font-semibold">
            ✨Over 250 clients are pleased
          </div> */}
        </div>
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center mt-6 max-w-5xl  mx-auto">
          Build amazing websites at <Cover>warp speed</Cover>
        </h1>
        {/* <p className="text-center text-xl text-white/50 mt-8 max-w-2xl mx-5 md:mx-auto">
          Websity gives you everything you need to build fast, professional
          websites smart tools, sleek templates, and a workflow designed to save
          time and deliver results.
        </p> */}
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
