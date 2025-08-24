import Image from "next/image";
import { motion } from "framer-motion";

function HeroContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-6 md:gap-8 items-start">
      {/* Left: Main image with button */}
      <motion.div
        className="relative rounded-[22px] overflow-hidden min-h-[340px] md:min-h-[650px] w-full flex flex-col justify-end"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Image
          src="/hero-main.png"
          alt="Streetwear group"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
          <motion.button
            className="bg-white text-[#531A1A] font-semibold rounded-full px-4 py-2 md:py-3 shadow-none border-none flex items-center gap-2 text-lg md:text-xl tracking-wide transition hover:bg-[#531A1A] hover:text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
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
          </motion.button>
        </div>
      </motion.div>
      {/* Right: 2 stacked cards */}
      <div className="flex flex-col gap-2 md:gap-3 h-full">
        <motion.div
          className="rounded-[22px] bg-[#531A1A] flex items-center justify-center min-h-[120px] md:min-h-[264px] h-[120px] md:h-[264px] w-full"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <motion.span
            className="text-white text-2xl md:text-4xl font-semibold tracking-tighter text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            PEHNAW MUST
          </motion.span>
        </motion.div>
        <motion.div
          className="relative rounded-[22px] bg-[#f5f5f5] flex flex-col justify-end min-h-[180px] md:min-h-[373px] w-full overflow-hidden border border-[#E0E0E0]"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <motion.span
            className="absolute top-3 left-3 md:top-4 md:left-4 text-[#531A1A] font-bold text-2xl md:text-4xl z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            #TRENDING
          </motion.span>
          <Image
            src="/hero-trending.png"
            alt="Trending T-shirt"
            fill
            className="object-cover object-top rounded-[22px]"
            style={{ zIndex: 0 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default HeroContent;
