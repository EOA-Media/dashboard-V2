import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import EditModal from './EditModal';
import { updateLead, type UpdateLeadPayload } from '../lib/dataService';

interface EditLeadModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  initial: {
    name: string;
    phone: string;
    issue: string;
    address: string;
  };
  onSaved: (updated: UpdateLeadPayload) => void;
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
          rows={3}
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

export default function EditLeadModal({ open, onClose, leadId, initial, onSaved }: EditLeadModalProps) {
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

    const payload: UpdateLeadPayload = {
      name: fields.name || undefined,
      phone: fields.phone || undefined,
      issue: fields.issue || undefined,
      address: fields.address || undefined,
    };

    const { error: err } = await updateLead(leadId, payload);
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
    <EditModal title="Edit Caller Information" open={open} onClose={handleClose}>
      <div className="px-5 py-4 space-y-4">
        <Field label="Name" id="lead_name" value={fields.name} onChange={set('name')} placeholder="Caller name" />
        <Field label="Phone" id="lead_phone" value={fields.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
        <Field label="Issue / Service Needed" id="lead_issue" value={fields.issue} onChange={set('issue')} multiline placeholder="Describe the issue…" />
        <Field label="Address" id="lead_address" value={fields.address} onChange={set('address')} placeholder="123 Main St, City, State" />

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
