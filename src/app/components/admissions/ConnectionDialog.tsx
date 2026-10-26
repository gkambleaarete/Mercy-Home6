import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Trash2, AlertCircle, Pencil } from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface Participant {
  id: string;
  constituentType: 'Constituent' | 'Non-Constituent';
  constituentName: string;
  role: string;
  attended: string | null;
  reasonMissed: string;
  otherReasonDetail: string;
  isOrganizer: boolean;
}

interface AdvocateGoal {
  id: string;
  goal: string;
  comments: string;
}

interface AdvocateCopingSkill {
  id: string;
  skill: string;
  dateReported: string;
  reportedBy: string;
  relationshipToYouth: string;
  description: string;
  effectiveWhen: string;
}

interface AdvocateTrigger {
  id: string;
  trigger: string;
  dateReported: string;
  reportedBy: string;
  relationshipToYouth: string;
  description: string;
  presentWhen: string;
}

interface AdvocateStrength {
  id: string;
  strength: string;
  dateReported: string;
  reportedBy: string;
  relationshipToYouth: string;
  description: string;
  demonstratedWhen: string;
}

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  youthName?: string;
  youthId?: string;
  editMode?: boolean;
  existingConnection?: any;
}

const CONNECTION_TYPES = [
  "Advocate Meeting",
  "Annual Physical Appointment",
  "Admissions Clinical Assessment",
  "Admissions Shadow",
  "Admissions Wait List Group",
  "Care Planning Meeting",
  "Class Session",
  "Dentist Appointment",
  "Employee Site Visit",
  "Eye Doctor Appointment",
  "Family Event",
  "Family Partnership Meeting",
  "Group Info Session",
  "Individual Info Session",
  "Integrated Substance Use Assessment",
  "Milieu Meeting",
  "Staff Meeting",
  "Therapy Session",
  "Other Admissions Meeting",
];

const REASON_MISSED_OPTIONS = [
  "Youth Not Intended to Attend",
  "Program Conflict - Excused",
  "Sick - Excused",
  "On Pass - Excused",
  "Hospitalized - Excused",
  "Youth Schedule Conflict - Excused",
  "Suspended From Program - Excused",
  "Youth Refusal - Unexcused",
  "No Show - Unexcused",
  "AWOL - Unexcused",
  "Youth Asked To Leave - Unexcused",
  "Other",
  "Family Event - Youth Don't Attend",
  "Staff Not Intended to Attend",
  "Did not reply",
  "Rescheduled",
  "Supervisor reviewed note",
  "Cancelled but not Rescheduled (Admissions)",
  "Dropped Class/Final Class",
  "Youth Needs to Complete Homework",
  "Excused Program Staff Recommendation-Excused",
  "Youth Not Home From School-Excused",
  "Excused - In School",
  "Excused - Work",
];

const NON_CONSTITUENT_ROLES = [
  "Coordinator", "Director", "Manager", "Tutor", "Advisor", "Other Role",
  "Instructor", "MHBG Staff", "Youth", "Volunteer", "School Staff",
  "Contractor", "PSO Staff", "Case Manager", "Masters Level Administrative Staff",
  "Mental Health Professional", "Physical Health Professional", "Community Care Staff",
  "External Constituent", "Clinician", "Residential Program Authorization Agent",
  "Community Care Member", "Ridgeland Tenant", "Drivers Education instructor",
  "Community Care Scholar", "Friends First Mentee", "Friends First Mentor",
  "Friends First MSR", "Friends First Coordinator", "Nurse",
  "Community Care Employment", "Med Leader", "Community Care Housing",
  "Community Care Therapy", "Community Care-Care Management",
];

const TREATMENT_TARGETS = [
  "Caregiver System Engagement",
  "Assessment & Psychoeducation",
  "Routines, Rituals, & Care Vision",
  "Calm (Caregiver Affect Management)",
  "Connect (Caregiver Attachment)",
  "Effective Caregiving Response",
  "Reflection (Affect Identification)",
  "Modulation",
  "Self-Discipline & Problem Solving (Executive Functions)",
  "Identity & Purpose",
  "Relational Engagement & Self Expression",
  "Resilience (Trauma Experience Integration)",
  "Resilience (Skill Coaching)",
];

const MOCK_YOUTH_GOALS = [
  "Improve emotional regulation skills",
  "Develop healthy peer relationships",
  "Strengthen family communication",
  "Build academic performance",
  "Develop independent living skills",
  "Reduce substance use behaviors",
];

const MOCK_COPING_SKILLS = [
  "Deep breathing exercises",
  "Journaling",
  "Physical exercise",
  "Mindfulness meditation",
  "Talking to a trusted adult",
  "Creative expression (art/music)",
];

const MOCK_TRIGGERS = [
  "Conflict with peers",
  "Academic pressure",
  "Family visits",
  "Transitions and changes",
  "Loud or crowded environments",
  "Reminders of past trauma",
];

const MOCK_STRENGTHS = [
  "Strong sense of humor",
  "Artistic abilities",
  "Athletic skills",
  "Empathy towards others",
  "Problem-solving ability",
  "Leadership qualities",
];

const slds = {
  bg: 'var(--slds-g-color-background-base)',
  bgAlt: 'var(--slds-g-color-background-alt)',
  border: 'var(--slds-g-color-border-base-1)',
  textDefault: 'var(--slds-g-color-text-default)',
  textWeak: 'var(--slds-g-color-text-weak)',
  neutral95: 'var(--slds-g-color-neutral-95)',
};

const fieldStyle = { backgroundColor: slds.bg, border: `1px solid ${slds.border}`, color: slds.textDefault };
const labelClass = "block text-[11px] font-semibold mb-1.5 uppercase tracking-wide";

export function ConnectionDialog({
  open,
  onOpenChange,
  youthName,
  youthId,
  editMode = false,
  existingConnection,
}: ConnectionDialogProps) {
  // ── Connection tab state ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'connection' | 'details'>('connection');
  const [connectionType, setConnectionType] = useState('Advocate Meeting');
  const [transitionRelated, setTransitionRelated] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [homeVisit, setHomeVisit] = useState(false);
  const [serviceCoordination, setServiceCoordination] = useState(false);
  const [showServiceMessage, setShowServiceMessage] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  // ── Participant state ─────────────────────────────────────────────────
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [showAttendanceWarning, setShowAttendanceWarning] = useState(false);
  const [finalizeAfterWarning, setFinalizeAfterWarning] = useState(false);

  // ── Details tab — Advocate Meeting state ─────────────────────────────
  const [advocateGoals, setAdvocateGoals] = useState<AdvocateGoal[]>([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AdvocateGoal | null>(null);
  const [goalForm, setGoalForm] = useState({ goal: '', comments: '' });

  const [advocateCopingSkills, setAdvocateCopingSkills] = useState<AdvocateCopingSkill[]>([]);
  const [copingSkillModalOpen, setCopingSkillModalOpen] = useState(false);
  const [editingCopingSkill, setEditingCopingSkill] = useState<AdvocateCopingSkill | null>(null);
  const [copingSkillForm, setCopingSkillForm] = useState({
    skill: '', dateReported: '', reportedBy: 'Current User', relationshipToYouth: 'Advocate',
    description: '', effectiveWhen: '',
  });

  const [advocateTriggers, setAdvocateTriggers] = useState<AdvocateTrigger[]>([]);
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<AdvocateTrigger | null>(null);
  const [triggerForm, setTriggerForm] = useState({
    trigger: '', dateReported: '', reportedBy: 'Current User', relationshipToYouth: 'Advocate',
    description: '', presentWhen: '',
  });

  const [advocateStrengths, setAdvocateStrengths] = useState<AdvocateStrength[]>([]);
  const [strengthModalOpen, setStrengthModalOpen] = useState(false);
  const [editingStrength, setEditingStrength] = useState<AdvocateStrength | null>(null);
  const [strengthForm, setStrengthForm] = useState({
    strength: '', dateReported: '', reportedBy: 'Current User', relationshipToYouth: 'Advocate',
    description: '', demonstratedWhen: '',
  });

  const [selectedTreatmentTargets, setSelectedTreatmentTargets] = useState<string[]>([]);
  const [goalDiscussionSummary, setGoalDiscussionSummary] = useState('');
  const [meetingSummary, setMeetingSummary] = useState('');
  const [themesAddressed, setThemesAddressed] = useState('');
  const [summary, setSummary] = useState('');

  // ── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open && !editMode) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);
      setConnectionType('Advocate Meeting');
      setTransitionRelated(false);
      setStartDate(dateStr);
      setStartTime(timeStr);
      setEndDate(dateStr);
      setEndTime('');
      setLocation('');
      setHomeVisit(false);
      setServiceCoordination(false);
      setShowServiceMessage(false);
      setIsFinalized(false);
      setSelectedParticipants([]);
      setAdvocateGoals([]);
      setAdvocateCopingSkills([]);
      setAdvocateTriggers([]);
      setAdvocateStrengths([]);
      setSelectedTreatmentTargets([]);
      setGoalDiscussionSummary('');
      setMeetingSummary('');
      setThemesAddressed('');
      setSummary('');
      setActiveTab('connection');

      const organizer: Participant = {
        id: 'organizer-1', constituentType: 'Constituent',
        constituentName: 'Current User (You)', role: 'Organizer',
        attended: null, reasonMissed: '', otherReasonDetail: '', isOrganizer: true,
      };
      const initial: Participant[] = [organizer];
      if (youthName && youthId) {
        initial.push({
          id: youthId, constituentType: 'Constituent',
          constituentName: youthName, role: 'Youth',
          attended: null, reasonMissed: '', otherReasonDetail: '', isOrganizer: false,
        });
      }
      setParticipants(initial);
    } else if (open && editMode && existingConnection) {
      setConnectionType(existingConnection.type || 'Advocate Meeting');
      setIsFinalized(existingConnection.finalized || false);
    }
  }, [open, editMode, youthName, youthId, existingConnection]);

  useEffect(() => {
    if (serviceCoordination) setShowServiceMessage(true);
  }, [serviceCoordination]);

  // ── Participant handlers ──────────────────────────────────────────────
  const handleAddParticipant = () => {
    setParticipants(prev => [...prev, {
      id: `participant-${Date.now()}`, constituentType: 'Constituent',
      constituentName: '', role: '', attended: null,
      reasonMissed: '', otherReasonDetail: '', isOrganizer: false,
    }]);
  };

  const handleRemoveParticipants = () => {
    setParticipants(prev => prev.filter(p => !selectedParticipants.includes(p.id) || p.isOrganizer));
    toast.success(`${selectedParticipants.length} participant(s) removed`);
    setSelectedParticipants([]);
  };

  const handleMassSetAttended = (value: 'Yes' | 'No') => {
    setParticipants(prev => prev.map(p =>
      selectedParticipants.includes(p.id)
        ? { ...p, attended: value, reasonMissed: value === 'Yes' ? '' : p.reasonMissed }
        : p
    ));
    toast.success(`Attendance set to "${value}" for ${selectedParticipants.length} participant(s)`);
    setSelectedParticipants([]);
  };

  const handleParticipantChange = (id: string, field: keyof Participant, value: any) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleParticipantSelection = (id: string) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  // ── Goals handlers ────────────────────────────────────────────────────
  const openGoalModal = (goal?: AdvocateGoal) => {
    setEditingGoal(goal || null);
    setGoalForm(goal ? { goal: goal.goal, comments: goal.comments } : { goal: '', comments: '' });
    setGoalModalOpen(true);
  };

  const handleSaveGoal = () => {
    if (!goalForm.goal) { toast.error('Goal is required'); return; }
    if (editingGoal) {
      setAdvocateGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...g, ...goalForm } : g));
      toast.success('Goal updated');
    } else {
      setAdvocateGoals(prev => [...prev, { id: `goal-${Date.now()}`, ...goalForm }]);
      toast.success('Goal added');
    }
    setGoalModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    setAdvocateGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal removed from meeting');
  };

  // ── Coping Skills handlers ────────────────────────────────────────────
  const openCopingSkillModal = (skill?: AdvocateCopingSkill) => {
    setEditingCopingSkill(skill || null);
    const today = new Date().toISOString().split('T')[0];
    setCopingSkillForm(skill
      ? { skill: skill.skill, dateReported: skill.dateReported, reportedBy: skill.reportedBy, relationshipToYouth: skill.relationshipToYouth, description: skill.description, effectiveWhen: skill.effectiveWhen }
      : { skill: '', dateReported: today, reportedBy: 'Current User', relationshipToYouth: 'Advocate', description: '', effectiveWhen: '' }
    );
    setCopingSkillModalOpen(true);
  };

  const handleSaveCopingSkill = () => {
    if (!copingSkillForm.skill || !copingSkillForm.dateReported) { toast.error('Coping Skill and Date Reported are required'); return; }
    if (editingCopingSkill) {
      setAdvocateCopingSkills(prev => prev.map(s => s.id === editingCopingSkill.id ? { ...s, ...copingSkillForm } : s));
      toast.success('Coping skill updated');
    } else {
      setAdvocateCopingSkills(prev => [...prev, { id: `cs-${Date.now()}`, ...copingSkillForm }]);
      toast.success('Coping skill added');
    }
    setCopingSkillModalOpen(false);
  };

  const handleDeleteCopingSkill = (id: string) => {
    setAdvocateCopingSkills(prev => prev.filter(s => s.id !== id));
    toast.success('Coping skill removed from meeting');
  };

  // ── Triggers handlers ─────────────────────────────────────────────────
  const openTriggerModal = (trigger?: AdvocateTrigger) => {
    setEditingTrigger(trigger || null);
    const today = new Date().toISOString().split('T')[0];
    setTriggerForm(trigger
      ? { trigger: trigger.trigger, dateReported: trigger.dateReported, reportedBy: trigger.reportedBy, relationshipToYouth: trigger.relationshipToYouth, description: trigger.description, presentWhen: trigger.presentWhen }
      : { trigger: '', dateReported: today, reportedBy: 'Current User', relationshipToYouth: 'Advocate', description: '', presentWhen: '' }
    );
    setTriggerModalOpen(true);
  };

  const handleSaveTrigger = () => {
    if (!triggerForm.trigger || !triggerForm.dateReported) { toast.error('Trigger and Date Reported are required'); return; }
    if (editingTrigger) {
      setAdvocateTriggers(prev => prev.map(t => t.id === editingTrigger.id ? { ...t, ...triggerForm } : t));
      toast.success('Trigger updated');
    } else {
      setAdvocateTriggers(prev => [...prev, { id: `tr-${Date.now()}`, ...triggerForm }]);
      toast.success('Trigger added');
    }
    setTriggerModalOpen(false);
  };

  const handleDeleteTrigger = (id: string) => {
    setAdvocateTriggers(prev => prev.filter(t => t.id !== id));
    toast.success('Trigger removed from meeting');
  };

  // ── Strengths handlers ────────────────────────────────────────────────
  const openStrengthModal = (strength?: AdvocateStrength) => {
    setEditingStrength(strength || null);
    const today = new Date().toISOString().split('T')[0];
    setStrengthForm(strength
      ? { strength: strength.strength, dateReported: strength.dateReported, reportedBy: strength.reportedBy, relationshipToYouth: strength.relationshipToYouth, description: strength.description, demonstratedWhen: strength.demonstratedWhen }
      : { strength: '', dateReported: today, reportedBy: 'Current User', relationshipToYouth: 'Advocate', description: '', demonstratedWhen: '' }
    );
    setStrengthModalOpen(true);
  };

  const handleSaveStrength = () => {
    if (!strengthForm.strength || !strengthForm.dateReported) { toast.error('Strength and Date Reported are required'); return; }
    if (editingStrength) {
      setAdvocateStrengths(prev => prev.map(s => s.id === editingStrength.id ? { ...s, ...strengthForm } : s));
      toast.success('Strength updated');
    } else {
      setAdvocateStrengths(prev => [...prev, { id: `st-${Date.now()}`, ...strengthForm }]);
      toast.success('Strength added');
    }
    setStrengthModalOpen(false);
  };

  const handleDeleteStrength = (id: string) => {
    setAdvocateStrengths(prev => prev.filter(s => s.id !== id));
    toast.success('Strength removed from meeting');
  };

  // ── Save / Finalize ───────────────────────────────────────────────────
  const validateDateTime = () => {
    if (!startDate || !startTime || !endDate) {
      toast.error('Please fill in all required date and time fields');
      return false;
    }
    const start = new Date(`${startDate}T${startTime}`);
    const end = endTime ? new Date(`${endDate}T${endTime}`) : null;
    if (end && end < start) {
      toast.error('End Date and Time cannot be before Start Date and Time');
      return false;
    }
    return true;
  };

  const checkAllAttendanceBlank = () =>
    participants.every(p => p.attended === null || p.attended === '');

  const handleSaveConnection = () => {
    if (!validateDateTime()) return;
    if (checkAllAttendanceBlank()) { setFinalizeAfterWarning(false); setShowAttendanceWarning(true); return; }
    proceedWithSave(false);
  };

  const handleFinalizeAndSubmit = () => {
    if (!validateDateTime()) return;
    if (checkAllAttendanceBlank()) { setFinalizeAfterWarning(true); setShowAttendanceWarning(true); return; }
    proceedWithSave(true);
  };

  const proceedWithSave = (finalize: boolean) => {
    if (finalize) {
      setIsFinalized(true);
      toast.success('Advocate Meeting finalized and submitted');
    } else {
      toast.success('Connection saved as draft');
    }
    onOpenChange(false);
    setShowAttendanceWarning(false);
  };

  const isReadOnly = editMode && isFinalized;

  // ── Reusable sub-components ───────────────────────────────────────────
  const SectionHeader = ({ label, onAdd, addLabel = 'Add' }: { label: string; onAdd: () => void; addLabel?: string }) => (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[13px] font-semibold" style={{ color: slds.textDefault }}>{label}</h3>
      {!isReadOnly && (
        <Button
          type="button" onClick={onAdd}
          className="h-7 px-3 rounded-full text-[12px]"
          style={{ backgroundColor: '#145F33', color: 'white' }}
        >
          <Plus className="w-3 h-3 mr-1" />{addLabel}
        </Button>
      )}
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: slds.border }}>
      <p className="text-[13px]" style={{ color: slds.textWeak }}>{message}</p>
    </div>
  );

  const tableClass = "border rounded-lg overflow-hidden";
  const thClass = "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide";
  const tdClass = "px-4 py-3 text-[13px]";

  return (
    <>
      {/* ── Main Connection Dialog ── */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          style={{ backgroundColor: slds.bg, border: `1px solid ${slds.border}` }}
          aria-describedby="connection-dialog-desc"
        >
          <DialogHeader className="pb-0">
            <DialogTitle className="text-[16px] font-semibold" style={{ color: slds.textDefault }}>
              {editMode ? 'Edit Connection' : 'New Connection / Interaction'}
              {isFinalized && (
                <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e6f4ea', color: '#145F33' }}>
                  Finalized
                </span>
              )}
            </DialogTitle>
            <DialogDescription id="connection-dialog-desc" className="text-[13px]" style={{ color: slds.textWeak }}>
              {editMode ? 'Update connection details and participant information.' : 'Create a new connection or interaction record.'}
            </DialogDescription>
          </DialogHeader>

          {/* ── Tabs (AC2) ── */}
          <div className="border-b -mx-6 px-6" style={{ borderColor: slds.border }}>
            <div className="flex gap-6">
              {(['connection', 'details'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-1 py-3 text-[13px] font-medium transition-colors relative capitalize"
                  style={{ color: activeTab === tab ? '#145F33' : slds.textDefault }}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t" style={{ backgroundColor: '#145F33' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="flex-1 overflow-y-auto py-4">

            {/* ════ CONNECTION TAB ════ */}
            {activeTab === 'connection' && (
              <div className="space-y-5">

                {/* Type (AC3, AC53) */}
                <div>
                  <Label htmlFor="conn-type" className={labelClass} style={{ color: slds.textWeak }}>
                    Type <span className="text-red-600">*</span>
                  </Label>
                  {editMode ? (
                    <Input
                      id="conn-type" value={connectionType} disabled
                      className="h-9 text-[13px] rounded"
                      style={{ backgroundColor: slds.neutral95, border: `1px solid ${slds.border}`, color: slds.textDefault, cursor: 'not-allowed' }}
                    />
                  ) : (
                    <Select value={connectionType} onValueChange={setConnectionType}>
                      <SelectTrigger className="h-9 text-[13px] rounded" style={fieldStyle}>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {CONNECTION_TYPES.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Transition Related (AC4) */}
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="transition-related"
                    checked={transitionRelated}
                    onCheckedChange={v => setTransitionRelated(v as boolean)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="transition-related" className="text-[13px] cursor-pointer" style={{ color: slds.textDefault }}>
                    Transition Related
                  </Label>
                </div>

                {/* Start Date / Time (AC5, AC6) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date" className={labelClass} style={{ color: slds.textWeak }}>
                      Start Date <span className="text-red-600">*</span>
                    </Label>
                    <DateInput id="start-date"
value={isoToMdy(startDate)}
                      onChange={(v) => (e => setStartDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                      disabled={isReadOnly}
                      className="h-9 text-[13px] rounded" style={fieldStyle}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-time" className={labelClass} style={{ color: slds.textWeak }}>
                      Start Time <span className="text-red-600">*</span>
                    </Label>
                    <Input id="start-time" type="time" value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      disabled={isReadOnly}
                      className="h-9 text-[13px] rounded" style={fieldStyle}
                    />
                  </div>
                </div>

                {/* End Date / Time (AC7, AC8, AC9) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="end-date" className={labelClass} style={{ color: slds.textWeak }}>
                      End Date <span className="text-red-600">*</span>
                    </Label>
                    <DateInput id="end-date"
value={isoToMdy(endDate)}
                      onChange={(v) => (e => setEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
                      disabled={isReadOnly}
                      className="h-9 text-[13px] rounded" style={fieldStyle}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className={labelClass} style={{ color: slds.textWeak }}>
                      End Time <span className="text-red-600">*</span>
                    </Label>
                    <Input id="end-time" type="time" value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      disabled={isReadOnly}
                      className="h-9 text-[13px] rounded" style={fieldStyle}
                    />
                  </div>
                </div>

                {/* Location (AC10) */}
                <div>
                  <Label htmlFor="location" className={labelClass} style={{ color: slds.textWeak }}>Location</Label>
                  <Input id="location" type="text" value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Enter location"
                    disabled={isReadOnly}
                    className="h-9 text-[13px] rounded" style={fieldStyle}
                  />
                </div>

                {/* Home Visit (AC11) */}
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="home-visit"
                    checked={homeVisit}
                    onCheckedChange={v => setHomeVisit(v as boolean)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="home-visit" className="text-[13px] cursor-pointer" style={{ color: slds.textDefault }}>
                    Home Visit
                  </Label>
                </div>

                {/* Service Coordination (AC12) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id="service-coordination"
                      checked={serviceCoordination}
                      onCheckedChange={v => setServiceCoordination(v as boolean)}
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="service-coordination" className="text-[13px] cursor-pointer" style={{ color: slds.textDefault }}>
                      Service Coordination
                    </Label>
                  </div>
                  {showServiceMessage && serviceCoordination && (
                    <div className="flex items-start gap-2 p-3 rounded" style={{ backgroundColor: '#e6f4ea', border: '1px solid #34a853' }}>
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#145F33' }} />
                      <p className="flex-1 text-[13px]" style={{ color: '#145F33' }}>
                        Add the Referral Organization as a Participant.
                      </p>
                      <button onClick={() => setShowServiceMessage(false)} className="p-0.5 rounded hover:bg-white transition-colors">
                        <X className="w-3.5 h-3.5" style={{ color: '#145F33' }} />
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Participant Management (AC13–AC21) ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className={labelClass} style={{ color: slds.textWeak }}>Participants</Label>
                    {!isReadOnly && (
                      <Button type="button" onClick={handleAddParticipant}
                        className="h-7 px-3 rounded-full text-[12px]"
                        style={{ backgroundColor: '#145F33', color: 'white' }}
                      >
                        <Plus className="w-3 h-3 mr-1" />Add Participant
                      </Button>
                    )}
                  </div>

                  {/* Mass Actions (AC15) */}
                  {selectedParticipants.length > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: slds.bgAlt, border: `1px solid ${slds.border}` }}>
                      <span className="text-[12px] font-medium" style={{ color: slds.textDefault }}>
                        {selectedParticipants.length} selected:
                      </span>
                      <Button type="button" onClick={handleRemoveParticipants}
                        className="h-6 px-2 text-[11px] rounded-full"
                        style={{ backgroundColor: '#c23934', color: 'white' }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />Remove
                      </Button>
                      <Button type="button" onClick={() => handleMassSetAttended('Yes')}
                        className="h-6 px-2 text-[11px] rounded-full"
                        style={{ backgroundColor: '#2e7d32', color: 'white' }}
                      >
                        Set as Attended
                      </Button>
                      <Button type="button" onClick={() => handleMassSetAttended('No')}
                        className="h-6 px-2 text-[11px] rounded-full"
                        style={{ backgroundColor: '#c23934', color: 'white' }}
                      >
                        Set as Not Attended
                      </Button>
                    </div>
                  )}

                  {/* Participants Table */}
                  <div className="rounded overflow-hidden" style={{ border: `1px solid ${slds.border}` }}>
                    <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                      <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: slds.bgAlt, zIndex: 1 }}>
                          <tr>
                            <th className="px-2 py-2.5" style={{ borderBottom: `1px solid ${slds.border}`, width: 36 }}>
                              <Checkbox
                                checked={
                                  participants.filter(p => !p.isOrganizer).length > 0 &&
                                  selectedParticipants.length === participants.filter(p => !p.isOrganizer).length
                                }
                                onCheckedChange={checked =>
                                  setSelectedParticipants(checked ? participants.filter(p => !p.isOrganizer).map(p => p.id) : [])
                                }
                              />
                            </th>
                            {['Type', 'Name', 'Role', 'Attended', 'Reason Missed'].map(h => (
                              <th key={h} className="px-2 py-2.5 text-left text-[11px] font-semibold"
                                style={{ color: slds.textDefault, borderBottom: `1px solid ${slds.border}` }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((p, idx) => (
                            <React.Fragment key={p.id}>
                              <tr style={{ borderBottom: idx < participants.length - 1 ? `1px solid ${slds.border}` : 'none' }}>
                                <td className="px-2 py-2">
                                  {!p.isOrganizer && (
                                    <Checkbox
                                      checked={selectedParticipants.includes(p.id)}
                                      onCheckedChange={() => toggleParticipantSelection(p.id)}
                                    />
                                  )}
                                </td>
                                {/* Constituent Type (AC16) */}
                                <td className="px-2 py-2" style={{ minWidth: 130 }}>
                                  <Select
                                    value={p.constituentType}
                                    onValueChange={v => handleParticipantChange(p.id, 'constituentType', v)}
                                    disabled={p.isOrganizer || isReadOnly}
                                  >
                                    <SelectTrigger className="h-8 text-[12px]" style={fieldStyle}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Constituent">Constituent</SelectItem>
                                      <SelectItem value="Non-Constituent">Non-Constituent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                {/* Name */}
                                <td className="px-2 py-2" style={{ minWidth: 160 }}>
                                  <Input
                                    type="text" value={p.constituentName}
                                    onChange={e => handleParticipantChange(p.id, 'constituentName', e.target.value)}
                                    placeholder={p.constituentType === 'Constituent' ? 'Search constituent...' : 'Enter name...'}
                                    disabled={p.isOrganizer || isReadOnly}
                                    className="h-8 text-[12px]" style={fieldStyle}
                                  />
                                </td>
                                {/* Role (AC17, AC21) */}
                                <td className="px-2 py-2" style={{ minWidth: 140 }}>
                                  {p.constituentType === 'Non-Constituent' ? (
                                    <Select value={p.role} onValueChange={v => handleParticipantChange(p.id, 'role', v)} disabled={isReadOnly}>
                                      <SelectTrigger className="h-8 text-[12px]" style={fieldStyle}>
                                        <SelectValue placeholder="Select role..." />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[280px]">
                                        {NON_CONSTITUENT_ROLES.map(r => (
                                          <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input type="text" value={p.role}
                                      onChange={e => handleParticipantChange(p.id, 'role', e.target.value)}
                                      placeholder={p.isOrganizer ? 'Organizer' : 'Role...'}
                                      disabled={p.isOrganizer || isReadOnly}
                                      className="h-8 text-[12px]" style={fieldStyle}
                                    />
                                  )}
                                </td>
                                {/* Attended (AC18) */}
                                <td className="px-2 py-2" style={{ minWidth: 100 }}>
                                  <Select
                                    value={p.attended || ''}
                                    onValueChange={v => handleParticipantChange(p.id, 'attended', v)}
                                    disabled={isReadOnly}
                                  >
                                    <SelectTrigger className="h-8 text-[12px]" style={fieldStyle}>
                                      <SelectValue placeholder="—" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Yes">Yes</SelectItem>
                                      <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                {/* Reason Missed (AC19) */}
                                <td className="px-2 py-2" style={{ minWidth: 180 }}>
                                  <Select
                                    value={p.reasonMissed}
                                    onValueChange={v => handleParticipantChange(p.id, 'reasonMissed', v)}
                                    disabled={p.attended !== 'No' || isReadOnly}
                                  >
                                    <SelectTrigger className="h-8 text-[12px]" style={fieldStyle}>
                                      <SelectValue placeholder={p.attended === 'No' ? 'Select reason...' : 'N/A'} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[280px]">
                                      {REASON_MISSED_OPTIONS.map(r => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                              </tr>
                              {/* AC20 — "Other" extra text field */}
                              {p.attended === 'No' && p.reasonMissed === 'Other' && (
                                <tr style={{ borderBottom: idx < participants.length - 1 ? `1px solid ${slds.border}` : 'none', backgroundColor: '#fafafa' }}>
                                  <td colSpan={2} />
                                  <td colSpan={4} className="px-2 pb-2">
                                    <Input
                                      type="text"
                                      value={p.otherReasonDetail}
                                      onChange={e => handleParticipantChange(p.id, 'otherReasonDetail', e.target.value)}
                                      placeholder="Please describe the reason... (required)"
                                      className="h-8 text-[12px]"
                                      style={{ ...fieldStyle, borderColor: '#c23934' }}
                                      disabled={isReadOnly}
                                    />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                          {participants.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-2 py-6 text-center text-[13px]" style={{ color: slds.textWeak }}>
                                No participants added yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ DETAILS TAB ════ */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* ── Advocate Meeting Details (AC22) ── */}
                {connectionType === 'Advocate Meeting' ? (
                  <>
                    {/* Goals Table (AC23–AC27) */}
                    <section>
                      <SectionHeader label="Goals" onAdd={() => openGoalModal()} />
                      {advocateGoals.length > 0 ? (
                        <div className={tableClass} style={{ borderColor: slds.border }}>
                          <table className="w-full">
                            <thead style={{ backgroundColor: slds.bgAlt }}>
                              <tr>
                                <th className={thClass} style={{ color: slds.textWeak, width: '40%' }}>Goal</th>
                                <th className={thClass} style={{ color: slds.textWeak }}>Comments</th>
                                <th className={thClass + ' text-right'} style={{ color: slds.textWeak, width: 90 }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: slds.border }}>
                              {advocateGoals.map(g => (
                                <tr key={g.id}>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{g.goal}</td>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{g.comments}</td>
                                  <td className={tdClass + ' text-right'}>
                                    <button onClick={() => openGoalModal(g)} disabled={isReadOnly}
                                      className="p-1.5 rounded hover:bg-gray-100 transition-colors mr-1" title="Modify">
                                      <Pencil className="h-3.5 w-3.5" style={{ color: '#0176d3' }} />
                                    </button>
                                    <button onClick={() => handleDeleteGoal(g.id)} disabled={isReadOnly}
                                      className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">
                                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState message='No goals added yet. Click "Add" to add a goal.' />
                      )}
                    </section>

                    {/* Text summaries (AC32) */}
                    <section className="space-y-4">
                      {[
                        { id: 'goal-discussion', label: 'Goal Discussion Summary', value: goalDiscussionSummary, onChange: setGoalDiscussionSummary, placeholder: 'Summarize the goal discussion...' },
                        { id: 'meeting-summary', label: 'Meeting Summary', value: meetingSummary, onChange: setMeetingSummary, placeholder: 'Summarize the meeting...' },
                        { id: 'themes', label: 'Themes Addressed', value: themesAddressed, onChange: setThemesAddressed, placeholder: 'Describe themes addressed...' },
                      ].map(field => (
                        <div key={field.id}>
                          <Label htmlFor={field.id} className={labelClass} style={{ color: slds.textWeak }}>{field.label}</Label>
                          <Textarea id={field.id} value={field.value} onChange={e => field.onChange(e.target.value)}
                            placeholder={field.placeholder} rows={3}
                            disabled={isReadOnly}
                            className="text-[13px] rounded resize-none" style={fieldStyle}
                          />
                        </div>
                      ))}
                    </section>

                    {/* Treatment Targets (AC33–AC34) */}
                    <section>
                      <h3 className="text-[13px] font-semibold mb-3" style={{ color: slds.textDefault }}>Treatment Targets</h3>
                      <div className="border rounded-lg p-4 grid grid-cols-2 gap-y-2 gap-x-6" style={{ borderColor: slds.border }}>
                        {TREATMENT_TARGETS.map(target => (
                          <div key={target} className="flex items-center gap-2">
                            <Checkbox
                              id={`tt-${target}`}
                              checked={selectedTreatmentTargets.includes(target)}
                              onCheckedChange={checked => {
                                setSelectedTreatmentTargets(prev =>
                                  checked ? [...prev, target] : prev.filter(t => t !== target)
                                );
                              }}
                              disabled={isReadOnly}
                            />
                            <Label htmlFor={`tt-${target}`} className="text-[13px] cursor-pointer leading-snug" style={{ color: slds.textDefault }}>
                              {target}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Coping Skills Table (AC35–AC40) */}
                    <section>
                      <SectionHeader label="Coping Skills" onAdd={() => openCopingSkillModal()} />
                      {advocateCopingSkills.length > 0 ? (
                        <div className={tableClass} style={{ borderColor: slds.border }}>
                          <table className="w-full">
                            <thead style={{ backgroundColor: slds.bgAlt }}>
                              <tr>
                                <th className={thClass} style={{ color: slds.textWeak }}>Coping Skill</th>
                                <th className={thClass} style={{ color: slds.textWeak, width: 120 }}>Date Reported</th>
                                <th className={thClass} style={{ color: slds.textWeak, width: 150 }}>Reported By</th>
                                <th className={thClass + ' text-right'} style={{ color: slds.textWeak, width: 90 }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: slds.border }}>
                              {advocateCopingSkills.map(s => (
                                <tr key={s.id}>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{s.skill}</td>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{s.dateReported}</td>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{s.reportedBy}</td>
                                  <td className={tdClass + ' text-right'}>
                                    <button onClick={() => openCopingSkillModal(s)} disabled={isReadOnly}
                                      className="p-1.5 rounded hover:bg-gray-100 transition-colors mr-1" title="Edit">
                                      <Pencil className="h-3.5 w-3.5" style={{ color: '#0176d3' }} />
                                    </button>
                                    <button onClick={() => handleDeleteCopingSkill(s.id)} disabled={isReadOnly}
                                      className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">
                                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState message='No coping skills added yet. Click "Add" to add a coping skill.' />
                      )}
                    </section>

                    {/* Triggers Table (AC41–AC44) */}
                    <section>
                      <SectionHeader label="Triggers" onAdd={() => openTriggerModal()} />
                      {advocateTriggers.length > 0 ? (
                        <div className={tableClass} style={{ borderColor: slds.border }}>
                          <table className="w-full">
                            <thead style={{ backgroundColor: slds.bgAlt }}>
                              <tr>
                                <th className={thClass} style={{ color: slds.textWeak }}>Trigger</th>
                                <th className={thClass} style={{ color: slds.textWeak, width: 120 }}>Date Reported</th>
                                <th className={thClass} style={{ color: slds.textWeak, width: 150 }}>Reported By</th>
                                <th className={thClass + ' text-right'} style={{ color: slds.textWeak, width: 90 }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: slds.border }}>
                              {advocateTriggers.map(t => (
                                <tr key={t.id}>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{t.trigger}</td>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{t.dateReported}</td>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{t.reportedBy}</td>
                                  <td className={tdClass + ' text-right'}>
                                    <button onClick={() => openTriggerModal(t)} disabled={isReadOnly}
                                      className="p-1.5 rounded hover:bg-gray-100 transition-colors mr-1" title="Edit">
                                      <Pencil className="h-3.5 w-3.5" style={{ color: '#0176d3' }} />
                                    </button>
                                    <button onClick={() => handleDeleteTrigger(t.id)} disabled={isReadOnly}
                                      className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">
                                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState message='No triggers added yet. Click "Add" to add a trigger.' />
                      )}
                    </section>

                    {/* Strengths Table (AC45–AC47) */}
                    <section>
                      <SectionHeader label="Strengths" onAdd={() => openStrengthModal()} />
                      {advocateStrengths.length > 0 ? (
                        <div className={tableClass} style={{ borderColor: slds.border }}>
                          <table className="w-full">
                            <thead style={{ backgroundColor: slds.bgAlt }}>
                              <tr>
                                <th className={thClass} style={{ color: slds.textWeak }}>Strength</th>
                                <th className={thClass} style={{ color: slds.textWeak, width: 120 }}>Date Reported</th>
                                <th className={thClass} style={{ color: slds.textWeak, width: 150 }}>Reported By</th>
                                <th className={thClass + ' text-right'} style={{ color: slds.textWeak, width: 90 }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: slds.border }}>
                              {advocateStrengths.map(s => (
                                <tr key={s.id}>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{s.strength}</td>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{s.dateReported}</td>
                                  <td className={tdClass} style={{ color: slds.textDefault }}>{s.reportedBy}</td>
                                  <td className={tdClass + ' text-right'}>
                                    <button onClick={() => openStrengthModal(s)} disabled={isReadOnly}
                                      className="p-1.5 rounded hover:bg-gray-100 transition-colors mr-1" title="Edit">
                                      <Pencil className="h-3.5 w-3.5" style={{ color: '#0176d3' }} />
                                    </button>
                                    <button onClick={() => handleDeleteStrength(s.id)} disabled={isReadOnly}
                                      className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">
                                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState message='No strengths added yet. Click "Add" to add a strength.' />
                      )}
                    </section>
                  </>
                ) : (
                  /* Other connection types — generic summary (AC22) */
                  <div>
                    <Label htmlFor="summary" className={labelClass} style={{ color: slds.textWeak }}>Summary</Label>
                    <Textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)}
                      placeholder="Enter connection summary..." rows={8}
                      disabled={isReadOnly}
                      className="text-[13px] rounded resize-none" style={fieldStyle}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer (AC48–AC50) ── */}
          <DialogFooter className="border-t pt-4 -mx-6 px-6" style={{ borderColor: slds.border }}>
            <div className="flex items-center justify-between w-full">
              <Button type="button" onClick={() => onOpenChange(false)}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: slds.neutral95, color: slds.textDefault, border: `1px solid ${slds.border}` }}
              >
                Cancel
              </Button>
              {!isFinalized && (
                <div className="flex gap-2">
                  <Button type="button" onClick={handleSaveConnection}
                    className="h-9 px-5 text-[13px] font-medium rounded-full"
                    style={{ backgroundColor: 'white', color: '#145F33', border: '1px solid #145F33' }}
                  >
                    Save Connection
                  </Button>
                  <Button type="button" onClick={handleFinalizeAndSubmit}
                    className="h-9 px-5 text-[13px] font-medium rounded-full"
                    style={{ backgroundColor: '#145F33', color: 'white' }}
                  >
                    Finalize and Submit
                  </Button>
                </div>
              )}
              {isFinalized && (
                <span className="text-[12px]" style={{ color: slds.textWeak }}>
                  This record has been finalized and cannot be edited.
                </span>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Attendance Warning Dialog ── */}
      <Dialog open={showAttendanceWarning} onOpenChange={setShowAttendanceWarning}>
        <DialogContent className="max-w-md" style={{ backgroundColor: slds.bg, border: `1px solid ${slds.border}` }}
          aria-describedby="attendance-warning-desc">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: slds.textDefault }}>
              Confirm Participant Attendance
            </DialogTitle>
            <DialogDescription id="attendance-warning-desc" className="text-[13px]" style={{ color: slds.textWeak }}>
              Attendance is blank for all participants. Would you like to continue with attendance blank?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setShowAttendanceWarning(false)}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: slds.neutral95, color: slds.textDefault, border: `1px solid ${slds.border}` }}
              >
                No, Go Back
              </Button>
              <Button type="button" onClick={() => proceedWithSave(finalizeAfterWarning)}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: '#145F33', color: 'white' }}
              >
                Yes, Continue
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Goal Modal (AC24–AC27) ── */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent className="max-w-lg" style={{ backgroundColor: slds.bg, border: `1px solid ${slds.border}` }}
          aria-describedby="goal-modal-desc">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: slds.textDefault }}>
              {editingGoal ? 'Modify Goal' : 'Add Goal'}
            </DialogTitle>
            <DialogDescription id="goal-modal-desc" className="text-[13px]" style={{ color: slds.textWeak }}>
              {editingGoal ? 'Update the goal and comments.' : 'Select a goal and add optional comments.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>
                Goal <span className="text-red-600">*</span>
              </Label>
              <Select value={goalForm.goal} onValueChange={v => setGoalForm(f => ({ ...f, goal: v }))}>
                <SelectTrigger className="h-9 text-[13px] rounded" style={fieldStyle}>
                  <SelectValue placeholder="Select a goal..." />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {MOCK_YOUTH_GOALS.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Comments</Label>
              <Textarea
                value={goalForm.comments}
                onChange={e => setGoalForm(f => ({ ...f, comments: e.target.value }))}
                placeholder="Add comments..."
                rows={3}
                className="text-[13px] rounded resize-none" style={fieldStyle}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setGoalModalOpen(false)}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: slds.neutral95, color: slds.textDefault, border: `1px solid ${slds.border}` }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveGoal}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: '#145F33', color: 'white' }}
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Coping Skill Modal (AC36–AC40) ── */}
      <Dialog open={copingSkillModalOpen} onOpenChange={setCopingSkillModalOpen}>
        <DialogContent className="max-w-lg" style={{ backgroundColor: slds.bg, border: `1px solid ${slds.border}` }}
          aria-describedby="coping-modal-desc">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: slds.textDefault }}>
              {editingCopingSkill ? 'Edit Coping Skill' : 'Add Coping Skill'}
            </DialogTitle>
            <DialogDescription id="coping-modal-desc" className="text-[13px]" style={{ color: slds.textWeak }}>
              Document a coping skill for this meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Coping Skill <span className="text-red-600">*</span></Label>
              <Select value={copingSkillForm.skill} onValueChange={v => setCopingSkillForm(f => ({ ...f, skill: v }))}>
                <SelectTrigger className="h-9 text-[13px] rounded" style={fieldStyle}>
                  <SelectValue placeholder="Select a coping skill..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_COPING_SKILLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelClass} style={{ color: slds.textWeak }}>Date Reported <span className="text-red-600">*</span></Label>
                <DateInput
value={isoToMdy(copingSkillForm.dateReported)}
                  onChange={(v) => (e => setCopingSkillForm(f => ({ ...f, dateReported: e.target.value })))({ target: { value: mdyToIso(v) } })}
                  className="h-9 text-[13px] rounded" style={fieldStyle}
                />
              </div>
              <div>
                <Label className={labelClass} style={{ color: slds.textWeak }}>Reported By <span className="text-red-600">*</span></Label>
                <Input type="text" value={copingSkillForm.reportedBy}
                  onChange={e => setCopingSkillForm(f => ({ ...f, reportedBy: e.target.value }))}
                  className="h-9 text-[13px] rounded" style={fieldStyle}
                />
              </div>
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Relationship to Youth <span className="text-red-600">*</span></Label>
              <Input type="text" value={copingSkillForm.relationshipToYouth}
                onChange={e => setCopingSkillForm(f => ({ ...f, relationshipToYouth: e.target.value }))}
                className="h-9 text-[13px] rounded" style={fieldStyle}
              />
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Description</Label>
              <Textarea value={copingSkillForm.description}
                onChange={e => setCopingSkillForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the coping skill..." rows={2}
                className="text-[13px] rounded resize-none" style={fieldStyle}
              />
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>The skill is effective when</Label>
              <Textarea value={copingSkillForm.effectiveWhen}
                onChange={e => setCopingSkillForm(f => ({ ...f, effectiveWhen: e.target.value }))}
                placeholder="Describe when this skill is most effective..." rows={2}
                className="text-[13px] rounded resize-none" style={fieldStyle}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setCopingSkillModalOpen(false)}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: slds.neutral95, color: slds.textDefault, border: `1px solid ${slds.border}` }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveCopingSkill}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: '#145F33', color: 'white' }}
              >
                {editingCopingSkill ? 'Update' : 'Add Coping Skill'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Trigger Modal (AC42–AC44) ── */}
      <Dialog open={triggerModalOpen} onOpenChange={setTriggerModalOpen}>
        <DialogContent className="max-w-lg" style={{ backgroundColor: slds.bg, border: `1px solid ${slds.border}` }}
          aria-describedby="trigger-modal-desc">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: slds.textDefault }}>
              {editingTrigger ? 'Edit Trigger' : 'Add Trigger'}
            </DialogTitle>
            <DialogDescription id="trigger-modal-desc" className="text-[13px]" style={{ color: slds.textWeak }}>
              Document a trigger for this meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Trigger <span className="text-red-600">*</span></Label>
              <Select value={triggerForm.trigger} onValueChange={v => setTriggerForm(f => ({ ...f, trigger: v }))}>
                <SelectTrigger className="h-9 text-[13px] rounded" style={fieldStyle}>
                  <SelectValue placeholder="Select a trigger..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TRIGGERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelClass} style={{ color: slds.textWeak }}>Date Reported <span className="text-red-600">*</span></Label>
                <DateInput
value={isoToMdy(triggerForm.dateReported)}
                  onChange={(v) => (e => setTriggerForm(f => ({ ...f, dateReported: e.target.value })))({ target: { value: mdyToIso(v) } })}
                  className="h-9 text-[13px] rounded" style={fieldStyle}
                />
              </div>
              <div>
                <Label className={labelClass} style={{ color: slds.textWeak }}>Reported By <span className="text-red-600">*</span></Label>
                <Input type="text" value={triggerForm.reportedBy}
                  onChange={e => setTriggerForm(f => ({ ...f, reportedBy: e.target.value }))}
                  className="h-9 text-[13px] rounded" style={fieldStyle}
                />
              </div>
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Relationship to Youth <span className="text-red-600">*</span></Label>
              <Input type="text" value={triggerForm.relationshipToYouth}
                onChange={e => setTriggerForm(f => ({ ...f, relationshipToYouth: e.target.value }))}
                className="h-9 text-[13px] rounded" style={fieldStyle}
              />
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Description</Label>
              <Textarea value={triggerForm.description}
                onChange={e => setTriggerForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the trigger..." rows={2}
                className="text-[13px] rounded resize-none" style={fieldStyle}
              />
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>The trigger is present when</Label>
              <Textarea value={triggerForm.presentWhen}
                onChange={e => setTriggerForm(f => ({ ...f, presentWhen: e.target.value }))}
                placeholder="Describe when this trigger is present..." rows={2}
                className="text-[13px] rounded resize-none" style={fieldStyle}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setTriggerModalOpen(false)}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: slds.neutral95, color: slds.textDefault, border: `1px solid ${slds.border}` }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveTrigger}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: '#145F33', color: 'white' }}
              >
                {editingTrigger ? 'Update' : 'Add Trigger'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Strength Modal (AC46–AC47) ── */}
      <Dialog open={strengthModalOpen} onOpenChange={setStrengthModalOpen}>
        <DialogContent className="max-w-lg" style={{ backgroundColor: slds.bg, border: `1px solid ${slds.border}` }}
          aria-describedby="strength-modal-desc">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold" style={{ color: slds.textDefault }}>
              {editingStrength ? 'Edit Strength' : 'Add Strength'}
            </DialogTitle>
            <DialogDescription id="strength-modal-desc" className="text-[13px]" style={{ color: slds.textWeak }}>
              Document a strength for this meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Strength <span className="text-red-600">*</span></Label>
              <Select value={strengthForm.strength} onValueChange={v => setStrengthForm(f => ({ ...f, strength: v }))}>
                <SelectTrigger className="h-9 text-[13px] rounded" style={fieldStyle}>
                  <SelectValue placeholder="Select a strength..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_STRENGTHS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={labelClass} style={{ color: slds.textWeak }}>Date Reported <span className="text-red-600">*</span></Label>
                <DateInput
value={isoToMdy(strengthForm.dateReported)}
                  onChange={(v) => (e => setStrengthForm(f => ({ ...f, dateReported: e.target.value })))({ target: { value: mdyToIso(v) } })}
                  className="h-9 text-[13px] rounded" style={fieldStyle}
                />
              </div>
              <div>
                <Label className={labelClass} style={{ color: slds.textWeak }}>Reported By <span className="text-red-600">*</span></Label>
                <Input type="text" value={strengthForm.reportedBy}
                  onChange={e => setStrengthForm(f => ({ ...f, reportedBy: e.target.value }))}
                  className="h-9 text-[13px] rounded" style={fieldStyle}
                />
              </div>
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Relationship to Youth <span className="text-red-600">*</span></Label>
              <Input type="text" value={strengthForm.relationshipToYouth}
                onChange={e => setStrengthForm(f => ({ ...f, relationshipToYouth: e.target.value }))}
                className="h-9 text-[13px] rounded" style={fieldStyle}
              />
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>Description</Label>
              <Textarea value={strengthForm.description}
                onChange={e => setStrengthForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the strength..." rows={2}
                className="text-[13px] rounded resize-none" style={fieldStyle}
              />
            </div>
            <div>
              <Label className={labelClass} style={{ color: slds.textWeak }}>The strength is demonstrated when</Label>
              <Textarea value={strengthForm.demonstratedWhen}
                onChange={e => setStrengthForm(f => ({ ...f, demonstratedWhen: e.target.value }))}
                placeholder="Describe when this strength is demonstrated..." rows={2}
                className="text-[13px] rounded resize-none" style={fieldStyle}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setStrengthModalOpen(false)}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: slds.neutral95, color: slds.textDefault, border: `1px solid ${slds.border}` }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveStrength}
                className="h-9 px-5 text-[13px] font-medium rounded-full"
                style={{ backgroundColor: '#145F33', color: 'white' }}
              >
                {editingStrength ? 'Update' : 'Add Strength'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
