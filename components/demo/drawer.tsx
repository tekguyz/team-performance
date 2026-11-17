"use client";

import { useEffect, useId, useRef } from "react";
import { CloseIcon } from "@/components/demo/icons";

/**
 * A side drawer on a native modal <dialog>: the browser traps focus, Escape closes it,
 * and focus goes back to whatever opened it. Full screen under 768 px (globals.css).
 */
export function Drawer({
  open,
  onClose,
  title,
  sub,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handleClose = () => {
      onClose();
      const el = opener.current;
      if (el instanceof HTMLElement && el.isConnected) el.focus();
    };
    d.addEventListener("close", handleClose);
    return () => d.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      data-screen-ok="scroll-inside: a drawer scrolls its own long content, like a native sheet"
      ref={ref}
      className="drawer"
      aria-labelledby={titleId}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog itself.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      {open && (
        <div style={{ minHeight: "100%" }}>
          <div className="dhead">
            <div style={{ flex: 1 }}>
              <h2 id={titleId}>{title}</h2>
              {sub && <div className="sub">{sub}</div>}
            </div>
            <button type="button" className="close" onClick={() => ref.current?.close()}>
              <CloseIcon />
              Close
            </button>
          </div>
          <div className="dbody">{children}</div>
        </div>
      )}
    </dialog>
  );
}
