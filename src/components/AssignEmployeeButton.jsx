import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, UserCheck, Search, X, Check } from 'lucide-react';
import { useHRIS } from '../context/EmployeeContext';

/**
 * AssignEmployeeButton Component
 * 
 * Provides an interactive dropdown button to assign an employee from the HRIS directory
 * to a specific signature/approval slot or requester field.
 */
export function AssignEmployeeButton({
  currentValue = '',
  onSelect,
  onClear,
  label = 'Assign',
  slotTitle = '',
  align = 'right',
  className = ''
}) {
  const { employees = [], currentUser } = useHRIS();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key and autofocus search input
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isAssigned = Boolean(currentValue && currentValue.trim() !== '');

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = (emp.name || '').toLowerCase();
    const pos = (emp.position || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const nik = (emp.nik || '').toLowerCase();
    return name.includes(term) || pos.includes(term) || dept.includes(term) || nik.includes(term);
  });

  const handleSelect = (emp) => {
    if (onSelect) {
      onSelect(emp);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onSelect) {
      onSelect({ name: '', position: '', department: '', nik: '' });
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAssignSelf = () => {
    if (currentUser) {
      handleSelect(currentUser);
    }
  };

  const isCurrentSelf = currentUser && currentValue && 
    (currentValue.trim().toLowerCase() === (currentUser.name || '').trim().toLowerCase());

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all shadow-2xs active:scale-95 ${
          isAssigned
            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
        }`}
        title={`Klik untuk assign pegawai ke slot ${slotTitle || 'ini'}`}
      >
        {isAssigned ? (
          <>
            <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{label}</span>
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3 text-indigo-600 shrink-0" />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Popover Header */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">
                {slotTitle ? `Assign: ${slotTitle}` : 'Assign Pegawai'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, jabatan, NIK..."
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2 bg-slate-50/70 border-b border-slate-100 space-y-1 text-xs">
            {currentUser && (
              <button
                type="button"
                onClick={handleAssignSelf}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition ${
                  isCurrentSelf
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white hover:bg-indigo-50/60 border-slate-200 text-slate-700 hover:text-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px]">
                    🙋‍♂️
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-[11px] block truncate">
                      Assign ke Saya Sendiri
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {currentUser.name} ({currentUser.position || currentUser.role})
                    </span>
                  </div>
                </div>
                {isCurrentSelf && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded shrink-0">
                    Aktif
                  </span>
                )}
              </button>
            )}

            {isAssigned && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-1 px-2 py-1 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition"
              >
                <X className="w-3 h-3" />
                <span>Kosongkan / Reset Penugasan</span>
              </button>
            )}
          </div>

          {/* Employee Directory List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Direktori Pegawai</span>
              <span>{filteredEmployees.length} orang</span>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Tidak ada pegawai yang cocok dengan "{searchTerm}"
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelected = currentValue && 
                  (currentValue.trim().toLowerCase() === (emp.name || '').trim().toLowerCase());
                
                const initials = (emp.name || 'P')
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                const isEmpAdmin = emp.role === 'admin';
                const isEmpDirector = emp.role === 'director' || (emp.position && emp.position.toLowerCase().includes('direktur'));
                const isEmpManager = emp.role === 'manager' || (emp.position && emp.position.toLowerCase().includes('manager'));

                return (
                  <button
                    key={emp.id || emp.nik || emp.name}
                    type="button"
                    onClick={() => handleSelect(emp)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition group ${
                      isSelected
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar / Initials */}
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate text-slate-900 group-hover:text-indigo-600">
                            {emp.name}
                          </span>
                          {isEmpAdmin && (
                            <span className="text-[9px] px-1 py-0.2 bg-purple-100 text-purple-700 font-bold rounded">
                              Admin
                            </span>
                          )}
                          {isEmpDirector && (
                            <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-700 font-bold rounded">
                              Direktur
                            </span>
                          )}
                          {isEmpManager && (
                            <span className="text-[9px] px-1 py-0.2 bg-blue-100 text-blue-700 font-bold rounded">
                              HOD
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <span>{emp.position || 'Staff'}</span>
                          {emp.department && (
                            <>
                              <span>•</span>
                              <span>{emp.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="shrink-0 flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dipilih</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
