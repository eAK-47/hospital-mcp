import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hospital-bg/80 p-4 backdrop-blur-sm">
      <section className="panel w-full max-w-lg p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="focus-ring rounded-md p-2 text-hospital-muted hover:text-white">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}
