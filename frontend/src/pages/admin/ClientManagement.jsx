import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Building2,
  DollarSign,
  ExternalLink,
  MapPin,
  Search,
  X,
  ChevronDown,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  AlertCircle,
  FolderSearch,
  CheckCircle2,
  Clock,
  PlayCircle,
  Star,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

// --- INLINE REUSABLE COMPONENTS ---
const StatusBadge = ({ status = 'Active', size = 'sm' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (['inactive', 'onboarding'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${bg}`}>
      <span>{status}</span>
    </span>
  );
};

const SearchBar = ({ value = '', onChange, placeholder = 'Search...' }) => (
  <div className="relative flex items-center w-full">
    <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[#c3c6d7]/80 dark:border-white/15 bg-white dark:bg-[#1c1a36] py-2 pl-9 pr-8 text-xs text-[#191b23] dark:text-white placeholder-slate-400 shadow-xs outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
    />
    {value && (
      <button type="button" onClick={() => onChange?.('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <X size={14} />
      </button>
    )}
  </div>
);

const FilterDropdown = ({ label = 'Filter', options = [], value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const isFiltered = value && value !== 'all' && value !== '';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
          isFiltered ? 'border-[#2563eb] bg-blue-50/50 dark:bg-blue-950/40 text-[#004ac6] dark:text-blue-400' : 'border-[#c3c6d7]/80 dark:border-white/15 bg-white dark:bg-[#1c1a36] text-[#434655] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
        }`}
      >
        <Filter size={13} className={isFiltered ? 'text-[#004ac6] dark:text-blue-400' : 'text-slate-400'} />
        <span>{label}: <strong>{selectedOption?.label || 'All'}</strong></span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <div className="absolute left-0 z-30 mt-1 min-w-[160px] rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#14132b] p-1 shadow-lg shadow-black/30">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange?.(opt.value); setIsOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                  opt.value === value ? 'bg-blue-50 dark:bg-blue-900/40 text-[#004ac6] dark:text-blue-300 font-bold' : 'text-[#434655] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check size={13} />}
              </button>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DataTable = ({ columns = [], data = [], keyField = 'id', onRowClick, emptyTitle, emptyDescription }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#c3c6d7] dark:border-white/15 bg-white/60 dark:bg-[#14132b] p-8 text-center my-4">
        <FolderSearch size={28} className="text-slate-400" />
        <h4 className="mt-2 text-sm font-bold text-[#191b23] dark:text-white">{emptyTitle || "No records found"}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{emptyDescription || "Try adjusting your search criteria or filters."}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs text-[#434655] dark:text-slate-300">
          <thead className="border-b border-[#c3c6d7]/60 dark:border-white/10 bg-[#f8f9fc] dark:bg-[#1a1835] text-[11px] font-bold uppercase tracking-wider text-[#737686] dark:text-slate-400">
            <tr>
              {columns.map((col, idx) => (
                <th key={col.accessor || idx} className="px-4 py-3.5">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {data.map((row, rIdx) => (
              <tr key={row[keyField] || rIdx} onClick={() => onRowClick?.(row)} className="hover:bg-blue-50/40 dark:hover:bg-white/5 cursor-pointer transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={col.accessor || cIdx} className="px-4 py-3.5 align-middle text-[#191b23] dark:text-white">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProfileCard = ({ avatar, name, subtitle, status, location, metrics = [], onAction, actionLabel = 'View Profile' }) => (
  <div className="group flex flex-col justify-between rounded-xl border border-[#c3c6d7]/70 dark:border-white/10 bg-white dark:bg-[#14132b] p-5 shadow-xs hover:border-[#2563eb]/40 hover:shadow-md transition-all">
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'} alt={name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-white/10" />
          <div>
            <h4 className="text-sm font-bold text-[#191b23] dark:text-white group-hover:text-[#004ac6] dark:group-hover:text-blue-400 transition-colors">{name}</h4>
            {subtitle && <p className="text-xs text-[#565e74] dark:text-slate-400 font-medium">{subtitle}</p>}
          </div>
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      {location && (
        <div className="mt-3 flex items-center gap-1 text-xs text-[#737686] dark:text-slate-400">
          <MapPin size={13} className="text-slate-400" />
          <span>{location}</span>
        </div>
      )}
      {metrics.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-white/10 pt-3">
          {metrics.map((m, idx) => (
            <div key={idx} className="rounded-lg bg-slate-50 dark:bg-[#1c1a36] p-2 text-center">
              <span className="block text-[10px] font-semibold text-[#737686] dark:text-slate-400 uppercase tracking-wider">{m.label}</span>
              <span className="mt-0.5 block text-xs font-bold text-[#191b23] dark:text-white">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    {onAction && (
      <div className="mt-4 border-t border-slate-100 dark:border-white/10 pt-3">
        <button type="button" onClick={onAction} className="w-full rounded-lg bg-slate-100 dark:bg-white/10 py-2 text-xs font-semibold text-[#191b23] dark:text-white hover:bg-[#2563eb] hover:text-white transition-colors">
          {actionLabel}
        </button>
      </div>
    )}
  </div>
);

const Modal = ({ isOpen = false, onClose, title, subtitle, children, maxWidth = 'max-w-lg', showCloseButton = true }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white dark:bg-[#14132b] shadow-2xl border border-slate-200 dark:border-white/15 overflow-hidden my-8`}>
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50/50 dark:bg-[#1c1a36]">
              <div>
                {title && <h3 className="text-base font-bold text-[#191b23] dark:text-white">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-[#737686] dark:text-slate-400">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto text-slate-900 dark:text-white">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const FormInput = ({ label, name, type = 'text', placeholder, register, error, required = false, options = [], className = '', disabled = false, ...rest }) => {
  const isError = Boolean(error);
  const inputBaseClasses = `w-full rounded-lg border text-xs text-[#191b23] dark:text-white placeholder-slate-400 transition-all outline-none ${
    isError ? 'border-rose-400 bg-rose-50/20' : 'border-[#c3c6d7] dark:border-white/15 bg-white dark:bg-[#1c1a36] focus:border-[#004ac6]'
  } ${disabled ? 'bg-slate-100 dark:bg-white/5 text-slate-500' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655] dark:text-slate-300">
          <span>{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</span>
        </label>
      )}
      {type === 'select' ? (
        <select {...(register ? register(name) : {})} disabled={disabled} className={`${inputBaseClasses} px-3 py-2 bg-white dark:bg-[#1c1a36]`} {...rest}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input type={type} {...(register ? register(name) : {})} disabled={disabled} placeholder={placeholder} className={`${inputBaseClasses} px-3 py-2`} {...rest} />
      )}
      {isError && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
          <AlertCircle size={13} />
          <span>{error.message || error}</span>
        </div>
      )}
    </div>
  );
};



export const ClientManagement = () => {
  const { clients } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedClient, setSelectedClient] = useState(null);

  // Extract unique industries for filter
  const industryOptions = useMemo(() => {
    const unique = Array.from(new Set(clients.map((c) => c.industry)));
    return [
      { value: 'all', label: 'All Industries' },
      ...unique.map((ind) => ({ value: ind, label: ind })),
    ];
  }, [clients]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || client.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesIndustry =
        industryFilter === 'all' || client.industry === industryFilter;

      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [clients, searchQuery, statusFilter, industryFilter]);

  const columns = [
    {
      header: 'Client Organization',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.logo}
            alt={row.name}
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
          />
          <div>
            <h4 className="font-bold text-[#191b23] dark:text-white hover:text-[#004ac6] dark:hover:text-blue-400 transition-colors">
              {row.name}
            </h4>
            <p className="text-xs text-[#737686] dark:text-slate-400">{row.industry}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Primary Contact',
      accessor: 'contactPerson',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-[#191b23] dark:text-white">{row.contactPerson}</p>
          <p className="text-xs text-[#737686] dark:text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Tier & Status',
      accessor: 'status',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} size="sm" />
          <span className="block text-[11px] font-medium text-[#565e74] dark:text-slate-300">{row.tier}</span>
        </div>
      ),
    },
    {
      header: 'Active Projects',
      accessor: 'activeProjects',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-[#191b23] dark:text-white">
          {row.activeProjects} {row.activeProjects === 1 ? 'Project' : 'Projects'}
        </span>
      ),
    },
    {
      header: 'Total Spend',
      accessor: 'totalSpent',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#004ac6] dark:text-blue-400">{row.totalSpent}</span>
      ),
    },
    {
      header: 'Location',
      accessor: 'location',
      sortable: true,
      render: (row) => <span className="text-xs text-[#737686] dark:text-slate-400">{row.location}</span>,
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedClient(row);
          }}
          className="rounded-lg bg-slate-100 dark:bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#004ac6] dark:text-blue-400 hover:bg-[#2563eb] dark:hover:bg-blue-600 hover:text-white transition-colors"
        >
          Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#191b23] dark:text-white tracking-tight">
            Client Accounts & Organizations
          </h2>
          <p className="text-xs sm:text-sm text-[#737686] dark:text-slate-400">
            Manage enterprise clients, staffing agreements, active contracts, and billing tiers.
          </p>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#14132b] p-4 rounded-xl border border-[#c3c6d7]/70 dark:border-white/10 shadow-xs">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by client name, contact, or email..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Onboarding', label: 'Onboarding' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />

          <FilterDropdown
            label="Industry"
            value={industryFilter}
            onChange={setIndustryFilter}
            options={industryOptions}
          />

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-[#c3c6d7]/80 dark:border-white/15 bg-slate-100 dark:bg-[#1c1a36] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#2563eb] shadow-xs text-[#004ac6] dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2563eb] shadow-xs text-[#004ac6] dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content: Table or Grid */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredClients}
          keyField="id"
          onRowClick={(client) => setSelectedClient(client)}
          emptyTitle="No clients match your filter"
          emptyDescription="Try clearing filters or search for another keyword."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <ProfileCard
              key={client.id}
              avatar={client.logo}
              name={client.name}
              subtitle={client.industry}
              status={client.status}
              location={client.location}
              metrics={[
                { label: 'Active Projects', value: client.activeProjects },
                { label: 'Total Spend', value: client.totalSpent },
              ]}
              actionLabel="View Client Details"
              onAction={() => setSelectedClient(client)}
            />
          ))}
        </div>
      )}

      {/* Client Quick View Details Modal */}
      {selectedClient && (
        <Modal
          isOpen={Boolean(selectedClient)}
          onClose={() => setSelectedClient(null)}
          title={selectedClient.name}
          subtitle={`Client Account Overview • ${selectedClient.tier}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#1c1a36] p-3.5 rounded-xl border border-slate-100 dark:border-white/10">
              <img
                src={selectedClient.logo}
                alt={selectedClient.name}
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
              />
              <div>
                <h4 className="text-sm font-bold text-[#191b23] dark:text-white">{selectedClient.name}</h4>
                <p className="text-[#737686] dark:text-slate-400">{selectedClient.industry}</p>
                <div className="mt-1">
                  <StatusBadge status={selectedClient.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-[#1c1a36] p-3 rounded-lg border border-slate-100 dark:border-white/10">
                <span className="text-[10px] text-[#737686] dark:text-slate-400 uppercase font-bold">Active Projects</span>
                <p className="text-base font-bold text-[#191b23] dark:text-white">{selectedClient.activeProjects}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#1c1a36] p-3 rounded-lg border border-slate-100 dark:border-white/10">
                <span className="text-[10px] text-[#737686] dark:text-slate-400 uppercase font-bold">Total Invoiced</span>
                <p className="text-base font-bold text-[#004ac6] dark:text-blue-400">{selectedClient.totalSpent}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 dark:border-white/10 pt-3 text-[#434655] dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-[#737686] dark:text-slate-400">Contact Person:</span>
                <span className="font-semibold text-[#191b23] dark:text-white">{selectedClient.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737686] dark:text-slate-400">Email:</span>
                <span className="font-semibold text-[#191b23] dark:text-white">{selectedClient.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737686] dark:text-slate-400">Phone:</span>
                <span className="font-semibold text-[#191b23] dark:text-white">{selectedClient.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737686] dark:text-slate-400">Location:</span>
                <span className="font-semibold text-[#191b23] dark:text-white">{selectedClient.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737686] dark:text-slate-400">Onboarding Date:</span>
                <span className="font-semibold text-[#191b23] dark:text-white">{selectedClient.joinedDate}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientManagement;
