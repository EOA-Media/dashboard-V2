import { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown, Check, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AdminUserFilter() {
  const { isAdmin, allClients, selectedUserIds, setSelectedUserIds } = useAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isAdmin) return null;

  const allSelected = selectedUserIds.length === 0;

  function toggleUser(id: string) {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((u) => u !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  }

  function selectAll() {
    setSelectedUserIds([]);
  }

  function getLabel() {
    if (allSelected) return 'All clients';
    if (selectedUserIds.length === 1) {
      const client = allClients.find((c) => c.id === selectedUserIds[0]);
      return client?.username ?? client?.email ?? '1 client';
    }
    return `${selectedUserIds.length} clients`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
          !allSelected
            ? 'bg-eoa-blue/10 border-eoa-blue/30 text-eoa-blue'
            : 'bg-eoa-card border-eoa-border text-eoa-text-secondary hover:border-eoa-border-light hover:text-eoa-text-primary'
        }`}
      >
        <Users className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
        <span className="truncate max-w-[120px]">{getLabel()}</span>
        {!allSelected && (
          <button
            onClick={(e) => { e.stopPropagation(); selectAll(); }}
            className="ml-0.5 text-eoa-blue/60 hover:text-eoa-blue transition-colors"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-eoa-surface border border-eoa-border rounded-2xl shadow-lg z-50 overflow-hidden animate-fade-in">
          <div className="p-1.5">
            <button
              onClick={selectAll}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors duration-100 ${
                allSelected
                  ? 'bg-eoa-blue/10 text-eoa-blue font-medium'
                  : 'text-eoa-text-secondary hover:bg-eoa-card hover:text-eoa-text-primary'
              }`}
            >
              <span>All clients</span>
              {allSelected && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
            </button>

            {allClients.length > 0 && (
              <div className="my-1 border-t border-eoa-border" />
            )}

            <div className="max-h-48 overflow-y-auto">
              {allClients.map((client) => {
                const isSelected = selectedUserIds.includes(client.id);
                const label = client.username ?? client.email ?? client.id.slice(0, 8);
                return (
                  <button
                    key={client.id}
                    onClick={() => toggleUser(client.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors duration-100 ${
                      isSelected
                        ? 'bg-eoa-blue/10 text-eoa-blue font-medium'
                        : 'text-eoa-text-secondary hover:bg-eoa-card hover:text-eoa-text-primary'
                    }`}
                  >
                    <span className="truncate text-left">{label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>

            {allClients.length === 0 && (
              <p className="px-3 py-2 text-xs text-eoa-text-muted">No clients found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
