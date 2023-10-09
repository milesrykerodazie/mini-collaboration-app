"use client";

import { useRef, ReactNode } from "react";

export default function Modal({ children }: { children: ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  return (
    <div ref={overlay} className="authmodal trans">
      <div className="flex items-center justify-center">
        <div ref={wrapper} className="modal_wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
