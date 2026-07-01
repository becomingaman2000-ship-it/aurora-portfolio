import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function HoverExpand({
  images,
  className,
}: {
  images: { src: string; alt: string; code: string }[];
  className?: string;
}) {
  const [active, setActive] = useState<number>(0);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={`relative w-full ${className ?? ""}`}
    >
      <div className="flex w-full items-center justify-center gap-1.5">
        {images.map((image, index) => (
          <motion.button
            key={index}
            className="relative shrink-0 cursor-pointer overflow-hidden rounded-3xl"
            initial={{ width: "3rem", height: "22rem" }}
            animate={{
              width: active === index ? "26rem" : "3.5rem",
              height: "22rem",
            }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onHoverStart={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
          >
            <AnimatePresence>
              {active === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {active === index && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1 }}
                  className="absolute inset-0 flex flex-col items-start justify-end p-5 text-left"
                >
                  <p className="text-xs uppercase tracking-widest text-white/70">
                    {image.code}
                  </p>
                  <p className="text-sm text-white/90">{image.alt}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <img
              src={image.src}
              className="h-full w-full object-cover"
              alt={image.alt}
              loading="lazy"
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
