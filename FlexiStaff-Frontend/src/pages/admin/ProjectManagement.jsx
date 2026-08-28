import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  Users,
  Search,
  Filter,
  ArrowRight,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  FolderSearch,
  Flame,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

// --- INLINE REUSABLE COMPONENTS ---
const StatusBadge = ({ status = 'Active', type = 'status', size = 'sm' }) => {
  const normalized = String(status).toLowerCase().trim();
  let bg = 'bg-blue-50 text-blue-700 border-blue-200';

  if (type === 'priority') {
    if (['critical', 'urgent'].includes(normalized)) {
      bg = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    } else if (['high'].includes(normalized)) {
      bg = 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
    } else {
      bg = 'bg-slate-50 text-slate-600 border-slate-200';
    }
  } else {
    if (['completed', 'approved'].includes(normalized)) {
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (['in progress', 'planning'].includes(normalized)) {
      bg = 'bg-indigo-50 text-[#004ac6] border-indigo-200';
    } else if (['request', 'pending'].includes(normalized)) {
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${bg}`}>
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
      className="w-full rounded-xl border border-[#c3c6d7]/80 bg-white py-2 pl-9 pr-8 text-xs text-[#191b23] placeholder-slate-400 shadow-xs outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
    />
    {value && (
      <button type="button" onClick={() => onChange?.('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
          isFiltered ? 'border-[#2563eb] bg-blue-50/50 text-[#004ac6]' : 'border-[#c3c6d7]/80 bg-white text-[#434655] hover:bg-slate-50'
        }`}
      >
        <Filter size={13} className={isFiltered ? 'text-[#004ac6]' : 'text-slate-400'} />
        <span>{label}: <strong>{selectedOption?.label || 'All'}</strong></span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <div className="absolute left-0 z-30 mt-1 min-w-[160px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange?.(opt.value); setIsOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                  opt.value === value ? 'bg-blue-50 text-[#004ac6] font-bold' : 'text-[#434655] hover:bg-slate-100'
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

const DataTable = ({ columns = [], data = [], keyField = 'id', onRowClick }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#c3c6d7] bg-white/60 p-8 text-center my-4">
        <FolderSearch size={28} className="text-slate-400" />
        <h4 className="mt-2 text-sm font-bold text-[#191b23]">No projects found</h4>
        <p className="text-xs text-slate-500">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#c3c6d7]/70 bg-white shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs text-[#434655]">
          <thead className="border-b border-[#c3c6d7]/60 bg-[#f8f9fc] text-[11px] font-bold uppercase tracking-wider text-[#737686]">
            <tr>
              {columns.map((col, idx) => (
                <th key={col.accessor || idx} className="px-4 py-3.5">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rIdx) => (
              <tr key={row[keyField] || rIdx} onClick={() => onRowClick?.(row)} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={col.accessor || cIdx} className="px-4 py-3.5 align-middle text-[#191b23]">
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

const ProjectCard = ({ project, onClick }) => {
  const { id, title, client, stage, status, priority, budget, progress = 0, deadline, requiredSkills = [] } = project;

  return (
    <div onClick={() => onClick?.(project)} className="group flex flex-col justify-between rounded-xl border border-[#c3c6d7]/70 bg-white p-5 shadow-xs hover:border-[#2563eb]/40 hover:shadow-md transition-all cursor-pointer">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono font-semibold text-[#737686]">{id}</span>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={priority} type="priority" />
            <StatusBadge status={stage || status} />
          </div>
        </div>
        <h4 className="text-sm font-bold text-[#191b23] group-hover:text-[#004ac6] transition-colors line-clamp-1">{title}</h4>
        <p className="text-xs text-[#565e74] mt-0.5">Client: <strong className="text-[#191b23]">{client}</strong></p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#737686] mb-1">
            <span>Overall Progress</span>
            <span className="text-[#191b23]">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-[#2563eb]'}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {requiredSkills.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1">
            {requiredSkills.slice(0, 3).map((s, idx) => (
              <span key={idx} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">{s}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#737686]">
        <span className="font-bold text-[#191b23]">{budget}</span>
        <span className="text-[11px]">{deadline}</span>
      </div>
    </div>
  );
};

const Modal = ({ isOpen = false, onClose, title, subtitle, children, maxWidth = 'max-w-lg', showCloseButton = true }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8`}>
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div>
                {title && <h3 className="text-base font-bold text-[#191b23]">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-[#737686]">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const FormInput = ({ label, name, type = 'text', placeholder, register, error, required = false, options = [], className = '', disabled = false, ...rest }) => {
  const isError = Boolean(error);
  const inputBaseClasses = `w-full rounded-lg border text-xs text-[#191b23] placeholder-slate-400 transition-all outline-none ${
    isError ? 'border-rose-400 bg-rose-50/20' : 'border-[#c3c6d7] bg-white focus:border-[#004ac6]'
  } ${disabled ? 'bg-slate-100 text-slate-500' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[#434655]">
          <span>{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</span>
        </label>
      )}
      {type === 'select' ? (
        <select {...(register ? register(name) : {})} disabled={disabled} className={`${inputBaseClasses} px-3 py-2 bg-white`} {...rest}>
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

const projectFormSchema = yup.object().shape({
  title: yup.string().required('Project title is required'),
  client: yup.string().required('Client organization is required'),
  stage: yup.string().required('Initial workflow stage is required'),
  priority: yup.string().required('Priority level is required'),
  manager: yup.string().required('Assigned manager is required'),
  budget: yup.string().required('Budget amount is required'),
  deadline: yup.string().required('Target deadline date is required'),
  description: yup.string().required('Description is required').min(10, 'Provide a brief summary'),
  skills: yup.string().required('Enter comma-separated skill requirements'),
});

export const ProjectManagement = () => {
  const { projects, clients, managers, addProject, updateProjectStage, approveProject, rejectProject } = useData();
  const navigate = useNavigate();

  const [stageTab, setStageTab] = useState('all'); // 'all' | 'Pending Admin Approval' | 'Approved' | 'In Progress' | 'Rejected' | 'Completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Approval / Rejection Modals
  const [selectedProjectForApproval, setSelectedProjectForApproval] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [assignedManagerSelect, setAssignedManagerSelect] = useState('Alex Morgan');
  const [rejectionReason, setRejectionReason] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(projectFormSchema),
    defaultValues: {
      title: '',
      client: clients[0]?.name || '',
      stage: 'Pending Admin Approval',
      priority: 'High',
      manager: managers[0]?.name || 'Alex Morgan',
      budget: '$150,000',
      deadline: '2026-11-30',
      description: '',
      skills: 'Python, React, AWS, Docker',
    },
  });

  const managerOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Managers' },
      ...managers.map((m) => ({ value: m.name, label: m.name })),
    ];
  }, [managers]);

  const pendingApprovalCount = useMemo(() => {
    return projects.filter(
      (p) => p.status === 'Pending Admin Approval' || p.stage === 'Pending Admin Approval' || p.stage === 'Request'
    ).length;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((prj) => {
      let matchesTab = true;
      if (stageTab === 'all') matchesTab = true;
      else if (stageTab === 'Pending Admin Approval') {
        matchesTab = prj.status === 'Pending Admin Approval' || prj.stage === 'Pending Admin Approval' || prj.stage === 'Request';
      } else {
        matchesTab = prj.status === stageTab || prj.stage === stageTab;
      }

      const matchesSearch =
        prj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prj.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prj.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prj.requiredSkills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'all' || prj.priority?.toLowerCase() === priorityFilter.toLowerCase();

      const matchesManager =
        managerFilter === 'all' || prj.manager === managerFilter;

      return matchesTab && matchesSearch && matchesPriority && matchesManager;
    });
  }, [projects, stageTab, searchQuery, priorityFilter, managerFilter]);

  const handleApproveConfirm = () => {
    if (!selectedProjectForApproval) return;
    approveProject(selectedProjectForApproval.id, assignedManagerSelect);
    toast.success(`Approved "${selectedProjectForApproval.title || selectedProjectForApproval.name}" and assigned to ${assignedManagerSelect}!`);
    setIsApproveModalOpen(false);
    setSelectedProjectForApproval(null);
  };

  const handleRejectConfirm = (e) => {
    e.preventDefault();
    if (!selectedProjectForApproval) return;
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    rejectProject(selectedProjectForApproval.id, rejectionReason);
    toast.info(`Rejected "${selectedProjectForApproval.title || selectedProjectForApproval.name}". Feedback sent to client.`);
    setIsRejectModalOpen(false);
    setSelectedProjectForApproval(null);
    setRejectionReason('');
  };

  const onAddSubmit = (data) => {
    const skillsArray = data.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const clientObj = clients.find((c) => c.name === data.client);
    const managerObj = managers.find((m) => m.name === data.manager);

    const newPrj = addProject({
      title: data.title,
      client: data.client,
      clientId: clientObj?.id || 'cli-01',
      stage: data.stage,
      priority: data.priority,
      manager: data.manager,
      managerAvatar: managerObj?.avatar,
      budget: data.budget.startsWith('$') ? data.budget : `$${data.budget}`,
      deadline: data.deadline,
      description: data.description,
      requiredSkills: skillsArray,
      assignedResources: [],
    });

    toast.success(`Project "${newPrj.title}" created in stage "${data.stage}"!`);
    reset();
    setIsAddModalOpen(false);
    navigate(`/projects/${newPrj.id}`);
  };

  const handleStageChange = (e, projectId) => {
    e.stopPropagation();
    const newStage = e.target.value;
    updateProjectStage(projectId, newStage);
    toast.info(`Updated project stage to: ${newStage}`);
  };

  const columns = [
    {
      header: 'Project & ID',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <div>
          <span className="text-[10px] font-mono text-[#737686] block">{row.id}</span>
          <h4 className="font-bold text-[#191b23] hover:text-[#004ac6] transition-colors line-clamp-1">
            {row.title}
          </h4>
        </div>
      ),
    },
    {
      header: 'Client',
      accessor: 'client',
      sortable: true,
      render: (row) => <span className="font-semibold text-[#434655]">{row.client}</span>,
    },
    {
      header: 'Stage & Priority',
      accessor: 'stage',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={row.stage || row.status} size="sm" />
          <StatusBadge status={row.priority} type="priority" size="sm" />
        </div>
      ),
    },
    {
      header: 'Manager',
      accessor: 'manager',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.managerAvatar && (
            <img
              src={row.managerAvatar}
              alt={row.manager}
              className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200"
            />
          )}
          <span className="text-xs font-medium text-[#191b23]">{row.manager}</span>
        </div>
      ),
    },
    {
      header: 'Staffed Team',
      accessor: 'assignedResources',
      render: (row) => (
        <div className="flex items-center -space-x-1.5">
          {row.assignedResources?.length > 0 ? (
            row.assignedResources.slice(0, 3).map((res, i) => (
              <img
                key={i}
                src={res.avatar}
                alt={res.name}
                title={res.name}
                className="h-6 w-6 rounded-full border-2 border-white object-cover"
              />
            ))
          ) : (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Needs Staffing
            </span>
          )}
          {row.assignedResources?.length > 3 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600">
              +{row.assignedResources.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Progress',
      accessor: 'progress',
      sortable: true,
      render: (row) => (
        <div className="w-24">
          <div className="flex justify-between text-[10px] font-semibold text-[#191b23] mb-0.5">
            <span>{row.progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                row.progress === 100
                  ? 'bg-emerald-500'
                  : row.progress > 40
                  ? 'bg-[#2563eb]'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Deadline',
      accessor: 'deadline',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-[#737686] whitespace-nowrap">{row.deadline}</span>
      ),
    },
    {
      header: 'Actions & Decision',
      accessor: 'stageControl',
      render: (row) => {
        const isPendingApproval =
          row.status === 'Pending Admin Approval' ||
          row.stage === 'Pending Admin Approval' ||
          row.stage === 'Request';

        if (isPendingApproval) {
          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectForApproval(row);
                  setIsApproveModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all"
              >
                <Check size={11} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectForApproval(row);
                  setIsRejectModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-all"
              >
                <X size={11} />
                <span>Reject</span>
              </button>
            </div>
          );
        }

        return (
          <span className="text-[11px] font-semibold text-slate-500">
            {row.status || row.stage}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#191b23] tracking-tight">
            Central Project & Requirements Approval
          </h2>
          <p className="text-xs sm:text-sm text-[#737686]">
            Review client project requirement requests, authorize project approval, and assign Organization Managers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create Project Request</span>
        </button>
      </div>

      {/* Workflow Stage Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setStageTab('all')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            stageTab === 'all'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <FolderKanban size={15} />
          <span>All ({projects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setStageTab('Pending Admin Approval')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            stageTab === 'Pending Admin Approval'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <Clock size={15} />
          <span>
            Pending Approval ({pendingApprovalCount})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageTab('Approved')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            stageTab === 'Approved'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>
            Approved ({projects.filter((p) => p.status === 'Approved' || p.stage === 'Approved').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageTab('In Progress')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            stageTab === 'In Progress'
              ? 'bg-[#2563eb] text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <PlayCircle size={15} />
          <span>
            In Progress ({projects.filter((p) => p.status === 'In Progress' || p.stage === 'In Progress').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageTab('Rejected')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            stageTab === 'Rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <X size={15} />
          <span>
            Rejected ({projects.filter((p) => p.status === 'Rejected' || p.stage === 'Rejected').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStageTab('Completed')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            stageTab === 'Completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-[#565e74] hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>
            Completed ({projects.filter((p) => p.status === 'Completed' || p.stage === 'Completed').length})
          </span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c3c6d7]/70 shadow-xs">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search projects, client, ID, or required skills..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'Critical', label: 'Critical' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
          />

          <FilterDropdown
            label="Manager"
            value={managerFilter}
            onChange={setManagerFilter}
            options={managerOptions}
          />

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-[#c3c6d7]/80 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#004ac6]' : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#004ac6]' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content: Cards or Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((prj) => (
            <ProjectCard
              key={prj.id}
              project={prj}
              onClick={(p) => navigate(`/projects/${p.id}`)}
              onStageChange={(newStage) => updateProjectStage(prj.id, newStage)}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredProjects}
          keyField="id"
          onRowClick={(p) => navigate(`/projects/${p.id}`)}
          emptyTitle="No projects match your filter"
          emptyDescription="Try clearing filters or create a new staffing request."
        />
      )}

      {/* Create Project / Request Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Project / Staffing Request"
        subtitle="Initiate a staffing track or project milestone for an enterprise client."
        size="lg"
      >
        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          <FormInput
            label="Project Title"
            name="title"
            placeholder="e.g. Real-Time Fraud Detection Engine"
            register={register}
            error={errors.title}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormInput
              label="Client Organization"
              name="client"
              type="select"
              options={clients.map((c) => ({ value: c.name, label: c.name }))}
              register={register}
              error={errors.client}
              required
            />

            <FormInput
              label="Assigned Lead Manager"
              name="manager"
              type="select"
              options={managers.map((m) => ({ value: m.name, label: m.name }))}
              register={register}
              error={errors.manager}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <FormInput
              label="Initial Stage"
              name="stage"
              type="select"
              options={[
                { value: 'Request', label: '1. Staffing Request' },
                { value: 'Planning', label: '2. Planning Scope' },
                { value: 'In Progress', label: '3. In Progress (Active)' },
              ]}
              register={register}
              error={errors.stage}
              required
            />

            <FormInput
              label="Priority Level"
              name="priority"
              type="select"
              options={[
                { value: 'Critical', label: 'Critical' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              register={register}
              error={errors.priority}
              required
            />

            <FormInput
              label="Estimated Budget"
              name="budget"
              placeholder="$150,000"
              register={register}
              error={errors.budget}
              required
            />
          </div>

          <FormInput
            label="Target Project Deadline"
            name="deadline"
            type="date"
            register={register}
            error={errors.deadline}
            required
          />

          <FormInput
            label="Required Skills (Comma separated)"
            name="skills"
            placeholder="e.g. Python, PyTorch, React, Docker"
            register={register}
            error={errors.skills}
            helperText="Specify the technical stack required"
            required
          />

          <FormInput
            label="Project Scope & Summary"
            name="description"
            type="textarea"
            rows={3}
            placeholder="Describe technical objectives, team composition, key deliverables..."
            register={register}
            error={errors.description}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1d4ed8] active:scale-95 transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* APPROVE PROJECT MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isApproveModalOpen && selectedProjectForApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApproveModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/70">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Approve Project Requirement</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorize project and route to Organization Manager for workforce matching.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-2">
                  <span className="block text-[10px] font-bold text-blue-700 uppercase">Project Title</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedProjectForApproval.title || selectedProjectForApproval.name}</p>
                  <p className="text-xs text-slate-600">Client: <strong>{selectedProjectForApproval.client}</strong></p>
                  <p className="text-xs text-slate-600">Tech Stack: {selectedProjectForApproval.techStack || (selectedProjectForApproval.requiredSkills || []).join(', ')}</p>
                  <p className="text-xs text-slate-600">Headcount Needed: {selectedProjectForApproval.workforceRequired || 2} specialists • Duration: {selectedProjectForApproval.duration || '6 Months'}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign Organization Manager *
                  </label>
                  <select
                    value={assignedManagerSelect}
                    onChange={(e) => setAssignedManagerSelect(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#004ac6] bg-white font-medium"
                  >
                    {managers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    The assigned manager will receive this project in their <strong>Approved Projects</strong> track and can search & request workforce members.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsApproveModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveConfirm}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    Approve & Route to Manager
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* REJECT PROJECT MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isRejectModalOpen && selectedProjectForApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRejectModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/70">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Reject Project Requirement</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For {selectedProjectForApproval.title || selectedProjectForApproval.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRejectConfirm} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide specific feedback to the client regarding why this project requirement was rejected..."
                    required
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectManagement;
