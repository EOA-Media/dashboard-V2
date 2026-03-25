import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import EditModal from './EditModal';
import { updateCall, type UpdateCallPayload } from '../lib/dataService';

interface EditCallModalProps {
  open: boolean;
  onClose: () => void;
  callId: string;
  initial: {
    caller_name: string;
    phone: string;
    summary: string;
    outcome: string;
    transcript: string;
  };
  onSaved: (updated: UpdateCallPayload) => void;
}

function Field({
  label,
  id,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const base =
    'w-full bg-eoa-card border border-eoa-border rounded-xl px-3 py-2.5 text-sm text-eoa-text-primary placeholder:text-eoa-text-muted focus:outline-none focus:border-eoa-blue/50 focus:ring-1 focus:ring-eoa-blue/20 transition-colors resize-none';
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={base}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function EditCallModal({ open, onClose, callId, initial, onSaved }: EditCallModalProps) {
  const [fields, setFields] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof fields) {
    return (v: string) => setFields((f) => ({ ...f, [key]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: UpdateCallPayload = {
      caller_name: fields.caller_name || undefined,
      phone: fields.phone || undefined,
      summary: fields.summary || undefined,
      outcome: fields.outcome || undefined,
      transcript: fields.transcript || undefined,
    };

    const { error: err } = await updateCall(callId, payload);
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
    setFields({ ...initial });
    setError(null);
    setSuccess(false);
    onClose();
  }

  return (
    <EditModal title="Edit Call" open={open} onClose={handleClose}>
      <div className="px-5 py-4 space-y-4">
        <Field label="Caller Name" id="caller_name" value={fields.caller_name} onChange={set('caller_name')} placeholder="Unknown Caller" />
        <Field label="Phone" id="phone" value={fields.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
        <Field label="Summary / Reason for Call" id="summary" value={fields.summary} onChange={set('summary')} multiline />
        <Field label="Outcome" id="outcome" value={fields.outcome} onChange={set('outcome')} multiline />
        <Field label="Transcript" id="transcript" value={fields.transcript} onChange={set('transcript')} multiline />

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

      <div className="px-5 py-4 border-t border-eoa-border flex items-center justify-end gap-3 flex-shrink-0">
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
