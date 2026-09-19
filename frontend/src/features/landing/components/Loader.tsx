import { motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-base"
    >
      <div className="w-[min(80vw,460px)]">
        <div className="mb-5 flex items-end justify-between">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[12px] font-medium tracking-[0.36em] text-fg"
          >
            SKILLEDLINK
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[10px] tracking-[0.32em] text-fg-4"
          >
            LOADING
          </motion.span>
        </div>

        <div className="relative h-px w-full overflow-hidden bg-elevated">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-[#2563EB] via-[#7AB0FF] to-[#2563EB]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-5 flex justify-between text-[10px] tracking-[0.28em] text-fg-4"
        >
          <span>DOUALA · YAOUNDÉ · MAROUA</span>
          <span>CAMEROON</span>
        </motion.div>
      </div>
    </motion.div>
  );
}