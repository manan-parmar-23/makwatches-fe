import Image from "next/image";

// Main content separated for clarity and reusability
function HeroContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-6 md:gap-8 items-start">
      {/* Left: Main image with button */}
      <div className="relative rounded-[22px] overflow-hidden min-h-[340px] md:min-h-[650px] w-full flex flex-col justify-end">
        <Image
          src="/hero-main.png"
          alt="Streetwear group"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
          <button className="bg-white text-[#531A1A] font-semibold rounded-full px-4 py-2 md:py-3 shadow-none border-none flex items-center gap-2 text-lg md:text-xl tracking-wide transition hover:bg-[#531A1A] hover:text-white">
            SHOP NOW
            <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#531A1A] flex items-center justify-center ml-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 16 16">
                <path
                  d="M5 8h6M9 6l2 2-2 2"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
      {/* Right: 2 stacked cards */}
      <div className="flex flex-col gap-2 md:gap-3 h-full">
        <div className="rounded-[22px] bg-[#531A1A] flex items-center justify-center min-h-[120px] md:min-h-[264px] h-[120px] md:h-[264px] w-full">
          <span className="text-white text-2xl md:text-4xl font-semibold tracking-tighter text-center">
            PEHNAW MUST
          </span>
        </div>
        <div className="relative rounded-[22px] bg-[#f5f5f5] flex flex-col justify-end min-h-[180px] md:min-h-[373px] w-full overflow-hidden border border-[#E0E0E0]">
          <span className="absolute top-3 left-3 md:top-4 md:left-4 text-[#531A1A] font-bold text-2xl md:text-4xl z-10">
            #TRENDING
          </span>
          <Image
            src="/hero-trending.png"
            alt="Trending T-shirt"
            fill
            className="object-cover object-top rounded-[22px]"
            style={{ zIndex: 0 }}
          />
        </div>
      </div>
    </div>
  );
}

const Hero = () => (
  <section className="w-full max-w-6xl mx-auto px-2 md:px-4 pt-4 pb-0">
    {/* Top grid */}
    <HeroContent />
    {/* Bottom text section */}
    <div className="mt-8 md:mt-12 w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
      <h2 className="text-[#531A1A] font-bold text-2xl md:text-3xl lg:text-[2.75rem] md:leading-[1.1] leading-tight text-left tracking-tighter m-0 flex-1">
        Our limit edition kit bundles all your rhode summer essentials in a baby
        rhode bubble.
      </h2>
      <button className="mt-4 md:mt-10 md:-ml-10 border-2 border-[#531A1A] rounded-full px-6 md:px-8 py-1.5 text-[#531A1A] font-normal text-lg md:text-xl transition hover:bg-[#531A1A] hover:text-white tracking-tight flex items-center justify-center h-[40px] md:h-[44px]">
        know us
      </button>
    </div>
  </section>
);

export default Hero;
