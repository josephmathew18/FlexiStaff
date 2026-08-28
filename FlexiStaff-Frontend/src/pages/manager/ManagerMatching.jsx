import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Users,
  Award,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  FolderCheck,
  Clock,
  Send,
  Building2,
  User,
  Layers,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import {
  WorkforceCounter,
  WorkforceSelectionPanel,
  WorkforceRequestModal,
  WorkforceCard,
  WorkforceProfile,
  AssignmentRequestModal,
  StatusBadge,
} from '../../components/workflow';
import { toast } from 'react-toastify';

export const ManagerMatching = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    projects = [],
    partnerProjects = [],
    workforce = [],
    partnerWorkforce = [],
    managerAssignments = [],
    partnerWorkforceRequests = [],
    freelancerRequests = [],
    submitAssignmentRequest,
    sendPartnerWorkforceRequest,
    sendFreelancerWorkforceRequest,
  } = useData() || {};

  // Combine and deduplicate projects
  const availableProjects = useMemo(() => {
    const all = [...(projects || []), ...(partnerProjects || [])];
    const unique = [];
    const seen = new Set();
    all.forEach((p) => {
      if (p && p.id && !seen.has(p.id)) {
        seen.add(p.id);
        unique.push(p);
      }
    });
    return unique;
  }, [projects, partnerProjects]);

  const queryProjectId = searchParams.get('projectId');
  const initialProjectId =
    projectId ||
    queryProjectId ||
    availableProjects.find((p) => p.status === 'Approved' || p.stage === 'Approved')?.id ||
    availableProjects[0]?.id ||
    'PRJ-101';

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);

  useEffect(() => {
    if (projectId && projectId !== selectedProjectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId]);

  // Current active project
  const currentProject = useMemo(() => {
    return (
      availableProjects.find((p) => p.id === selectedProjectId) || {
        id: selectedProjectId || 'PRJ-101',
        name: 'Enterprise Project',
        title: 'Enterprise Project',
        client: 'Enterprise Client',
        duration: '6 Months',
        workforceRequired: 3,
        workforceAssigned: 0,
        requiredSkills: ['React.js', 'Node.js', 'PostgreSQL'],
        status: 'Approved',
      }
    );
  }, [availableProjects, selectedProjectId]);

  // Modals & Active Tab States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalTab, setRequestModalTab] = useState('partner');
  const [profileModalCandidate, setProfileModalCandidate] = useState(null);

  // Selected workforce squad for the current project (Strictly max 3)
  const [selectedSquad, setSelectedSquad] = useState([]);

  // Combined available talent pool (Partner Professionals + Freelancers)
  const candidatePool = useMemo(() => {
    const combined = [];
    const seen = new Set();

    // 1. Partner Professionals
    (partnerWorkforce || []).forEach((p) => {
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        combined.push({
          ...p,
          source: 'Partner Company',
          roleType: 'Professional',
          partnerName: p.partnerCompany || p.partner || 'Apex Digital Enterprises',
        });
      }
    });

    // 2. Freelancers
    (workforce || []).forEach((w) => {
      if (w && !seen.has(w.id)) {
        seen.add(w.id);
        combined.push({
          ...w,
          source: w.partnerCompany ? 'Partner Company' : 'Freelancer',
          roleType: w.partnerCompany ? 'Professional' : 'Freelancer',
          partnerName: w.partnerCompany || 'Independent Freelancer',
        });
      }
    });

    return combined;
  }, [partnerWorkforce, workforce]);

  // Toggle selection with strict 3-member limit
  const handleToggleSelect = (candidate) => {
    const alreadySelected = selectedSquad.some((s) => s.id === candidate.id);

    if (alreadySelected) {
      setSelectedSquad(selectedSquad.filter((s) => s.id !== candidate.id));
      toast.info(`Removed ${candidate.name || 'candidate'} from selection.`);
      return;
    }

    if (selectedSquad.length >= 3) {
      toast.error('Maximum 3 workforce members can be assigned to a project.');
      return;
    }

    setSelectedSquad([...selectedSquad, candidate]);
    toast.success(`Added ${candidate.name || 'candidate'} to staged squad.`);
  };

  // Submit Assignment Request to Company Admin
  const handleSubmitAssignmentRequest = (notes) => {
    if (selectedSquad.length === 0) {
      toast.error('Please select at least 1 candidate.');
      return;
    }
    if (selectedSquad.length > 3) {
      toast.error('Maximum 3 workforce members can be assigned to a project.');
      return;
    }

    if (submitAssignmentRequest) {
      submitAssignmentRequest(currentProject.id, selectedSquad, notes);
    }

    toast.success(
      `Assignment Request submitted to Company Admin with ${selectedSquad.length} specialist(s)!`
    );
    setSelectedSquad([]);
    navigate('/manager/assignments');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Header & Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Workforce Matching & Squad Staging
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#004ac6] border border-blue-200 text-xs font-bold">
              Organization Manager
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Request Professionals from Partner Companies or Freelancers from the independent pool. Select up to 3 specialists and submit an Assignment Request to Company Admin.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Active Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedSquad([]);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#004ac6] shadow-2xs"
          >
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} – {p.name || p.title} ({p.status || 'Approved'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Requirements Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {currentProject.id}
              </span>
              <StatusBadge status={currentProject.status || 'Approved'} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              {currentProject.name || currentProject.title}
            </h2>
            <p className="text-xs text-slate-500">
              Client: <strong>{currentProject.client || 'Enterprise Client'}</strong> | Duration: <strong>{currentProject.duration || '6 Months'}</strong>
            </p>
          </div>

          {/* Quick Request Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRequestModalTab('partner');
                setIsRequestModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-[#004ac6] hover:bg-blue-100 text-xs font-bold transition-colors"
            >
              <Building2 size={14} />
              <span>Request from Partner</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRequestModalTab('freelancer');
                setIsRequestModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors"
            >
              <User size={14} />
              <span>Request Freelancer</span>
            </button>
          </div>
        </div>

        {/* Required Technical Stack */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Required Technical Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(currentProject.requiredSkills)
              ? currentProject.requiredSkills
              : (currentProject.techStack || '').split(',')
            ).map((sk, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs"
              >
                {String(sk).trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Staging & Selection Panel (Enforcing Max 3 Limit) */}
      <WorkforceSelectionPanel
        project={currentProject}
        availableWorkforce={candidatePool}
        selectedWorkforce={selectedSquad}
        onToggleSelect={handleToggleSelect}
        onSubmitAssignment={handleSubmitAssignmentRequest}
      />

      {/* Workforce Request Modal (Partner & Freelancer Tabs) */}
      <WorkforceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        project={currentProject}
        defaultTab={requestModalTab}
        onCandidateSelected={(cand) => {
          handleToggleSelect(cand);
          setIsRequestModalOpen(false);
        }}
      />
    </div>
  );
};

export default ManagerMatching;
