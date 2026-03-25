import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import EditModal from './EditModal';
import { updateBooking, type UpdateBookingPayload } from '../lib/dataService';
import type { Booking } from '../types';

interface EditBookingModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  initial: {
    name: string;
    notes: string;
    booking_time: string;
    status: Booking['status'];
  };
  onSaved: (updated: UpdateBookingPayload) => void;
}

const STATUS_OPTIONS: { value: Booking['status']; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function toLocalDatetimeValue(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

function fromLocalDatetimeValue(localValue: string): string {
  if (!localValue) return '';
  return new Date(localValue).toISOString();
}

export default function EditBookingModal({ open, onClose, bookingId, initial, onSaved }: EditBookingModalProps) {
  const [fields, setFields] = useState({
    name: initial.name,
    notes: initial.notes,
    booking_time: toLocalDatetimeValue(initial.booking_time),
    status: initial.status,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = 'w-full bg-eoa-card border border-eoa-border rounded-xl px-3 py-2.5 text-sm text-eoa-text-primary placeholder:text-eoa-text-muted focus:outline-none focus:border-eoa-blue/50 focus:ring-1 focus:ring-eoa-blue/20 transition-colors resize-none';

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: UpdateBookingPayload = {
      name: fields.name || undefined,
      notes: fields.notes || undefined,
      booking_time: fields.booking_time ? fromLocalDatetimeValue(fields.booking_time) : undefined,
      status: fields.status,
    };

    const { error: err } = await updateBooking(bookingId, payload);
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }

    setSuccess(true);
    onSaved(payload);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 900);
  }

  function handleClose() {
    if (saving) return;
    setFields({
      name: initial.name,
      notes: initial.notes,
      booking_time: toLocalDatetimeValue(initial.booking_time),
      status: initial.status,
    });
    setError(null);
    setSuccess(false);
    onClose();
  }

  return (
    <EditModal title="Edit Booking" open={open} onClose={handleClose}>
      <div className="px-5 py-4 space-y-4">
        <div>
          <label htmlFor="b_name" className="block text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1.5">
            Contact Name
          </label>
          <input
            id="b_name"
            type="text"
            className={base}
            value={fields.name}
            onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
            placeholder="Caller name"
          />
        </div>

        <div>
          <label htmlFor="b_time" className="block text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1.5">
            Appointment Date & Time
          </label>
          <input
            id="b_time"
            type="datetime-local"
            className={base + ' [color-scheme:dark]'}
            value={fields.booking_time}
            onChange={(e) => setFields((f) => ({ ...f, booking_time: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1.5">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFields((f) => ({ ...f, status: opt.value }))}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-150 text-left ${
                  fields.status === opt.value
                    ? 'bg-eoa-blue/10 border-eoa-blue/40 text-eoa-blue'
                    : 'bg-eoa-card border-eoa-border text-eoa-text-secondary hover:border-eoa-border-light hover:text-eoa-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="b_notes" className="block text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1.5">
            Notes / Service
          </label>
          <textarea
            id="b_notes"
            rows={3}
            className={base}
            value={fields.notes}
            onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Service details, special instructions…"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-eoa-red/10 border border-eoa-red/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-eoa-red flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-xs text-eoa-red">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-eoa-green/10 border border-eoa-green/20 rounded-xl">
            <CheckCircle className="w-4 h-4 text-eoa-green flex-shrink-0" strokeWidth={2} />
            <p className="text-xs text-eoa-green">Saved successfully</p>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-eoa-border flex items-center justify-end gap-3">
        <button
          onClick={handleClose}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-medium text-eoa-text-secondary bg-eoa-card border border-eoa-border hover:border-eoa-border-light hover:text-eoa-text-primary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || success}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-gradient shadow-glow-blue hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving && <Loader className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </EditModal>
  );
}
