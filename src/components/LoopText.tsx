import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

function useLoop(delay = 2200) {
  const [key, setKey] = useState(0);
  const inc = useCallback(() => setKey((p) => p + 1), []);
  useEffect(() => {
    const i = setInterval(inc, delay);
    return () => clearInterval(i);
  }, [delay, inc]);
  return { key };
}

export function LoopText({ words, className }: { words: string[]; className?: string }) {
  const { key } = useLoop();
  const current = useMemo(() => words[key % words.length], [words, key]);
  return (
    <span className={`inline-flex overflow-hidden align-bottom ${className ?? ""}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={key}
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="text-gradient inline-block whitespace-normal sm:whitespace-nowrap"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
