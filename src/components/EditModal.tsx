import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface EditModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function EditModal({ title, open, onClose, children }: EditModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg bg-eoa-surface border border-eoa-border rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up sm:animate-fade-in flex flex-col max-h-[92dvh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-eoa-border flex-shrink-0">
          <h2 className="text-sm font-bold text-eoa-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-eoa-card border border-eoa-border flex items-center justify-center text-eoa-text-muted hover:text-eoa-text-primary hover:border-eoa-border-light transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
