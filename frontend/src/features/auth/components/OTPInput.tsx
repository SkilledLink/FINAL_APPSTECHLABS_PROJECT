import React, { useRef } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handles pasting alphanumeric strings (letters + digits)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData("text");
    // Extract letters and digits, preserving case and trimming to length
    const validChars = pastedData.replace(/[^a-zA-Z0-9]/g, "").slice(0, length);

    if (validChars.length > 0) {
      onChange(validChars);

      const targetIndex = Math.min(validChars.length - 1, length - 1);
      inputRefs.current[targetIndex]?.focus();

      if (validChars.length === length) {
        onComplete?.(validChars);
      }
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const char = rawVal.slice(-1);

    // Allow single alphanumeric character (letters & digits)
    if (char && !/^[a-zA-Z0-9]$/.test(char)) return;

    const valArray = value.split("");
    valArray[index] = char;
    const combinedValue = valArray.join("").slice(0, length);

    onChange(combinedValue);

    // Auto-advance focus to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (combinedValue.length === length) {
      onComplete?.(combinedValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className="w-10 h-12 sm:w-11 sm:h-12 text-center text-base font-bold bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
};