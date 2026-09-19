import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
  speed?: number;
};

export default function Marquee({
  children,
  reverse = false,
  className = "",
  speed = 34,
}: Props) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`marquee-track ${reverse ? "rev" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}