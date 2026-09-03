import React, { useRef, useState, ClipboardEvent } from "react";
import { motion } from "framer-motion";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split("").slice(0, length);
  const paddedDigits = [...digits, ...Array(length - digits.length).fill("")];

  const handleChange = (index: number, val: string) => {
    const newValue = [...digits];
    newValue[index] = val.slice(-1);
    const result = newValue.join("");
    onChange(result);
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (result.length === length && onComplete) {
      onComplete(result);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length);
    if (/^\d+$/.test(pasted)) {
      onChange(pasted);
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 justify-center" onPaste={handlePaste}>
      {paddedDigits.map((digit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, delay: index * 0.03 }}
        >
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled}
            className={`
              w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold rounded-xl border
              transition-all duration-200 bg-slate-50 text-slate-900
              ${focusedIndex === index
                ? "border-[#122E21] bg-white ring-4 ring-[#122E21]/10 shadow-xs"
                : digit
                ? "border-[#122E21] bg-emerald-50/50 text-[#122E21]"
                : "border-slate-200 hover:border-slate-300"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              focus:outline-none
            `}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </motion.div>
      ))}
    </div>
  );
};