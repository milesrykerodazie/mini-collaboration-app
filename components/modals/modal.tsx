"use client";

import { useCallback, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";

export default function Modal({ children }: { children: ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const onDismiss = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div ref={overlay} className="authmodal trans">
      <div className="flex items-center justify-center">
        <div ref={wrapper} className="modal_wrapper">
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-2 right-0 bg-white rounded-full"
          >
            <IoMdClose className="text-primary w-6 h-6" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
