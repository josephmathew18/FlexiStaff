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
    const decodedId = decodeURIComponent(selectedProjectId || '').trim();
    const normalizedId = decodedId.toLowerCase().replace(/[\s_]/g, '-');

    return (
      availableProjects.find((p) => {
        if (!p || !p.id) return false;
        const pidLower = String(p.id).toLowerCase().trim();
        const pidNormalized = pidLower.replace(/[\s_]/g, '-');
        return (
          pidLower === decodedId.toLowerCase() ||
          pidNormalized === normalizedId ||
          pidLower === selectedProjectId?.toLowerCase() ||
          pidLower.replace(/-/g, '') === normalizedId.replace(/-/g, '')
        );
      }) ||
      availableProjects[0] || {
        id: selectedProjectId || 'PRJ-NEW',
        name: 'Project Workspace',
        title: 'Project Workspace',
        client: 'Client Organization',
        duration: 'FlexiStaff Sprint',
        workforceRequired: 1,
        workforceAssigned: 0,
        requiredSkills: ['Full Stack', 'Software Engineering'],
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
    const seenIds = new Set();
    const seenNames = new Set();

    const addCandidate = (cand, defaultSource, defaultRoleType, defaultPartner) => {
      if (!cand) return;
      const cid = String(cand.id || '').trim();
      const nameKey = (cand.name || cand.pseudonym || '').toLowerCase().trim();

      if (cid && seenIds.has(cid)) return;
      if (nameKey && seenNames.has(nameKey)) return;

      if (cid) seenIds.add(cid);
      if (nameKey) seenNames.add(nameKey);

      combined.push({
        ...cand,
        source: cand.source || defaultSource,
        roleType: cand.roleType || defaultRoleType,
        partnerName: cand.partnerCompany || cand.partner || cand.partnerName || defaultPartner,
      });
    };

    (partnerWorkforce || []).forEach((p) =>
      addCandidate(p, 'Partner Company', 'Professional', 'Partner Organization')
    );
    (workforce || []).forEach((w) =>
      addCandidate(
        w,
        w.partnerCompany ? 'Partner Company' : 'Freelancer',
        w.partnerCompany ? 'Professional' : 'Freelancer',
        w.partnerCompany || 'Independent Freelancer'
      )
    );

    return combined;
  }, [partnerWorkforce, workforce]);

  // Toggle selection with strict capacity limit (Max 5 workforce members per project squad)
  const handleToggleSelect = (candidate) => {
    if (!candidate) return;
    const candName = (candidate.name || candidate.pseudonym || '').toLowerCase().trim();
    const candIdStr = candidate.id ? String(candidate.id).trim() : '';

    const normProjId = (val) => String(val || '').toLowerCase().replace(/[\s_]/g, '-').trim();
    const targetProjId = normProjId(currentProject?.id);
    const targetProjName = (currentProject?.name || currentProject?.title || '').toLowerCase().trim();

    // Check if candidate already has a pending or active assignment request for this project
    const existingAssignment = (managerAssignments || []).find((a) => {
      if (!a) return false;
      const aProj = normProjId(a.projectId);
      const aTitle = (a.projectName || '').toLowerCase().trim();
      const aName = (a.professionalName || '').toLowerCase().trim();
      const aId = a.professionalId ? String(a.professionalId).trim() : '';

      const isSameProj = (targetProjId && aProj === targetProjId) || (targetProjName && aTitle === targetProjName);
      const isSameCand = (candIdStr && aId && candIdStr === aId) || (candName && aName && candName === aName);

      return isSameProj && isSameCand && a.status !== 'Rejected' && a.status !== 'Declined';
    });

    if (existingAssignment) {
      const statusLabel =
        existingAssignment.status === 'Accepted' || existingAssignment.status === 'Working' || existingAssignment.status === 'In Progress'
          ? 'already active on'
          : 'has a pending recruitment request for';
      toast.warn(
        `Cannot select ${candidate.name || candidate.pseudonym || 'candidate'}: Candidate ${statusLabel} project "${currentProject.name || currentProject.title}".`
      );
      return;
    }

    const alreadySelected = selectedSquad.some((s) => {
      const sName = (s.name || s.pseudonym || '').toLowerCase().trim();
      const sIdStr = s.id ? String(s.id).trim() : '';
      return (candIdStr && sIdStr && candIdStr === sIdStr) || (candName && sName && candName === sName);
    });

    if (alreadySelected) {
      setSelectedSquad(selectedSquad.filter((s) => {
        const sName = (s.name || s.pseudonym || '').toLowerCase().trim();
        const sIdStr = s.id ? String(s.id).trim() : '';
        return !((candIdStr && sIdStr && candIdStr === sIdStr) || (candName && sName && candName === sName));
      }));
      toast.info(`Removed ${candidate.name || candidate.pseudonym || 'candidate'} from selection.`);
      return;
    }

    if (selectedSquad.length >= 5) {
      toast.error('Maximum 5 workforce members can be assigned to a project.');
      return;
    }

    setSelectedSquad([...selectedSquad, candidate]);
    toast.success(`Added ${candidate.name || candidate.pseudonym || 'candidate'} to staged squad.`);
  };

  // Submit Assignment Request to Company Admin
  const handleSubmitAssignmentRequest = (notes) => {
    if (selectedSquad.length === 0) {
      toast.error('Please select at least 1 candidate.');
      return;
    }
    if (selectedSquad.length > 5) {
      toast.error('Maximum 5 workforce members can be assigned to a project.');
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
              HR Manager
            </span>
          </div>
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
