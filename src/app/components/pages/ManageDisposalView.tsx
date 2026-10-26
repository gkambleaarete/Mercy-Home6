import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Plus, ArrowLeft, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, Lock, Info } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogBody,
  DialogTitle,
} from "../ui/dialog";
import { formatMdy } from "../../lib/dateFormat";

// ── Types ──────────────────────────────────────────────────────────────────────

type DisposalStatus = "Med Cart" | "Lockbox" | "Pharmacy Transfer (Pending)";
type UserRole = "Frontline Staff" | "Therapist" | "Program Manager" | "Nurse";
type CountType = "Units" | "Volume";

interface DisposalRecord {
  id: number;
  program?: string;
  status: DisposalStatus;
  medication: string;
  dose: string;
  youth: string;
  date: string;
  amount: string;
  disposalStaff: string;
  originalComment: string;
  addComment: string;
}

interface LogRecord {
  id: number;
  date: string;
  logType: string;
  medicationId: number;
  medication: string;
  dose: string;
  youth: string;
  attestationDate: string;
  attestationStaff: string;
  attestationText: string;
  count: string;
  comments: string;
}

// ── Mock youth + medication data for Add Disposal form ────────────────────────

interface MedOption {
  id: number;
  name: string;
  dose: string;
  dosePeriod: string;
  countType: CountType;
}

interface YouthOption {
  id: number;
  name: string;
  medications: MedOption[];
}

const MOCK_YOUTHS: YouthOption[] = [
  {
    id: 1, name: "Fozzie Bear",
    medications: [
      { id: 101, name: "Adderall XR", dose: "20mg",    dosePeriod: "Morning",   countType: "Units"  },
      { id: 102, name: "Vitamin D",   dose: "1000 IU", dosePeriod: "Morning",   countType: "Units"  },
    ],
  },
  {
    id: 2, name: "Kermit Frog",
    medications: [
      { id: 103, name: "Melatonin",   dose: "5mg",       dosePeriod: "Bedtime",   countType: "Units"  },
      { id: 104, name: "Amoxicillin", dose: "250mg/5ml", dosePeriod: "Morning",   countType: "Volume" },
    ],
  },
  {
    id: 3, name: "Gonzo Rizzo",
    medications: [
      { id: 105, name: "Ritalin",   dose: "10mg", dosePeriod: "Morning",   countType: "Units" },
      { id: 106, name: "Concerta",  dose: "27mg", dosePeriod: "Afternoon", countType: "Units" },
    ],
  },
  {
    id: 4, name: "Animal Drum",
    medications: [
      { id: 107, name: "Prozac", dose: "20mg", dosePeriod: "Morning", countType: "Units" },
    ],
  },
  {
    id: 5, name: "Rowlf Piano",
    medications: [
      { id: 108, name: "Zoloft",          dose: "50mg",      dosePeriod: "Evening", countType: "Units"  },
      { id: 109, name: "Ibuprofen Susp.", dose: "100mg/5ml", dosePeriod: "Evening", countType: "Volume" },
    ],
  },
];

const VOLUME_OPTIONS = ["Full", "3/4", "1/2", "1/4"] as const;

// ── Constants ──────────────────────────────────────────────────────────────────

const ATTESTATION_TEXT =
  "I attest that I have followed Mercy Home's policies and procedures for medication dispensation & documentation.";

const STATUS_ORDER: Record<string, number> = {
  "Med Cart": 0,
  "Lockbox": 1,
  "Pharmacy Transfer (Pending)": 2,
  "Pharmacy Transfer (Verified)": 3,
};

const ROLE_ALLOWED_STATUSES: Record<UserRole, string[]> = {
  "Frontline Staff": [],
  "Therapist":       ["Lockbox", "Pharmacy Transfer (Pending)", "Pharmacy Transfer (Verified)"],
  "Program Manager": ["Lockbox", "Pharmacy Transfer (Pending)", "Pharmacy Transfer (Verified)"],
  "Nurse":           ["Lockbox", "Pharmacy Transfer (Pending)", "Pharmacy Transfer (Verified)"],
};

const MOCK_PROGRAMS: { id: string; name: string; roles: UserRole[] }[] = [
  { id: "prog-001", name: "Mahoney House",       roles: ["Frontline Staff", "Therapist", "Program Manager", "Nurse"] },
  { id: "prog-002", name: "Rydell House",        roles: ["Therapist", "Program Manager", "Nurse"] },
  { id: "prog-003", name: "Walsh Campus",        roles: ["Therapist", "Program Manager", "Nurse"] },
  { id: "prog-004", name: "West Campus Program", roles: ["Frontline Staff", "Therapist", "Program Manager", "Nurse"] },
];

const MOCK_RECORDS: DisposalRecord[] = [
  { id: 1,  program: "Mahoney House",        status: "Med Cart",                    medication: "Adderall XR",  dose: "20mg",      youth: "Fozzie Bear",    date: "05/20/2026", amount: "7 tablets",   disposalStaff: "Sarah Johnson",  originalComment: "Expired stock removed from cart.",   addComment: "" },
  { id: 2,  program: "Mahoney House",        status: "Med Cart",                    medication: "Melatonin",    dose: "5mg",       youth: "Kermit Frog",    date: "05/21/2026", amount: "14 tablets",  disposalStaff: "Sarah Johnson",  originalComment: "Youth discharged, unused supply.",   addComment: "" },
  { id: 3,  program: "Mahoney House",        status: "Lockbox",                     medication: "Ritalin",      dose: "10mg",      youth: "Gonzo Rizzo",    date: "05/22/2026", amount: "5 tablets",   disposalStaff: "Marcus Rivera",  originalComment: "Controlled substance — lockbox.",    addComment: "" },
  { id: 4,  program: "Mahoney House",        status: "Pharmacy Transfer (Pending)", medication: "Concerta",     dose: "27mg",      youth: "Animal Drum",    date: "05/22/2026", amount: "3 tablets",   disposalStaff: "Marcus Rivera",  originalComment: "Prescription changed by doctor.",    addComment: "" },
  { id: 5,  program: "Rydell House",         status: "Med Cart",                    medication: "Prozac",       dose: "20mg",      youth: "Rowlf Piano",    date: "05/23/2026", amount: "10 capsules", disposalStaff: "Tina Morales",   originalComment: "Awaiting pharmacy pickup.",           addComment: "" },
  { id: 6,  program: "Rydell House",         status: "Pharmacy Transfer (Pending)", medication: "Zoloft",       dose: "50mg",      youth: "Scooter Grosse", date: "05/24/2026", amount: "8 tablets",   disposalStaff: "Tina Morales",   originalComment: "Youth transferred to new program.",  addComment: "" },
  { id: 7,  program: "Rydell House",         status: "Lockbox",                     medication: "Vitamin D",    dose: "1000 IU",   youth: "Fozzie Bear",    date: "05/25/2026", amount: "30 tablets",  disposalStaff: "Sarah Johnson",  originalComment: "OTC supplement, near expiry.",        addComment: "" },
  { id: 8,  program: "Walsh Campus",         status: "Med Cart",                    medication: "Amoxicillin",  dose: "250mg/5ml", youth: "Miss Piggy",     date: "05/20/2026", amount: "120ml",       disposalStaff: "Elena Vasquez",  originalComment: "Course completed early.",             addComment: "" },
  { id: 9,  program: "Walsh Campus",         status: "Lockbox",                     medication: "Adderall XR",  dose: "10mg",      youth: "Sam Eagle",      date: "05/21/2026", amount: "12 tablets",  disposalStaff: "Elena Vasquez",  originalComment: "Youth left program.",                 addComment: "" },
  { id: 10, program: "West Campus Program",  status: "Med Cart",                    medication: "Melatonin",    dose: "3mg",       youth: "Pepe Prawn",     date: "05/22/2026", amount: "20 tablets",  disposalStaff: "James Ortega",   originalComment: "Switched to new formulation.",        addComment: "" },
  { id: 11, program: "West Campus Program",  status: "Pharmacy Transfer (Pending)", medication: "Ibuprofen",    dose: "200mg",     youth: "Rizzo Rat",      date: "05/23/2026", amount: "40 tablets",  disposalStaff: "James Ortega",   originalComment: "Expired — pharmacy return needed.",   addComment: "" },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  "Med Cart":                     { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Lockbox":                      { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  "Pharmacy Transfer (Pending)":  { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
  "Pharmacy Transfer (Verified)": { bg: "#F0FDF4", text: "#14532D", border: "#86EFAC" },
};

type SortField = keyof Omit<DisposalRecord, "id" | "addComment">;

const COLUMNS: { key: SortField; label: string; width?: string }[] = [
  { key: "status",          label: "Status",           width: "190px" },
  { key: "medication",      label: "Medication",       width: "150px" },
  { key: "dose",            label: "Dose",             width: "90px"  },
  { key: "youth",           label: "Youth",            width: "140px" },
  { key: "date",            label: "Date",             width: "110px" },
  { key: "amount",          label: "Amount",           width: "110px" },
  { key: "disposalStaff",   label: "Disposal Staff",   width: "140px" },
  { key: "originalComment", label: "Original Comment", width: "200px" },
];

let _logId    = 100;
let _recordId = 1000;

function getTodayDate() {
  return formatMdy(new Date());
}

interface AddDisposalForm {
  date: string;
  youthId: string;
  medicationId: string;
  amount: string;
  comment: string;
}

const EMPTY_FORM: AddDisposalForm = {
  date: "",
  youthId: "",
  medicationId: "",
  amount: "",
  comment: "",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function ManageDisposalView() {

  const location      = useLocation();
  const navigate      = useNavigate();
  const locState      = location.state as { fromProgramLog?: boolean; programName?: string } | null;
  const fromProgramLog = locState?.fromProgramLog ?? false;

  const [selectedProgram, setSelectedProgram] = useState<string>(() => locState?.programName ?? "");
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("Therapist");
  const [records,         setRecords]         = useState<DisposalRecord[]>(MOCK_RECORDS);
  const [savedRecords,    setSavedRecords]    = useState<DisposalRecord[]>(MOCK_RECORDS);
  const [stagedStatuses,  setStagedStatuses]  = useState<Record<number, string>>({});
  const [pendingComments, setPendingComments] = useState<Record<number, string>>({});
  const [statusFilter,    setStatusFilter]    = useState("All statuses");
  const [selectedIds,     setSelectedIds]     = useState<Set<number>>(new Set());
  const [massActionStatus,  setMassActionStatus]  = useState("");
  const [massActionComment, setMassActionComment] = useState("");
  const [sortField,       setSortField]       = useState<SortField | null>(null);
  const [sortDir,         setSortDir]         = useState<"asc" | "desc" | null>(null);
  const [showCancelDialog,  setShowCancelDialog]  = useState(false);
  const [logRecords,      setLogRecords]      = useState<LogRecord[]>([]);

  // Add Disposal modal state
  const [addModalOpen,         setAddModalOpen]         = useState(false);
  const [addForm,              setAddForm]              = useState<AddDisposalForm>({ ...EMPTY_FORM });
  const [showAddCancelConfirm, setShowAddCancelConfirm] = useState(false);

  // ── Add Disposal derived values ────────────────────────────────────────────

  const selectedYouth = MOCK_YOUTHS.find((y) => y.id === Number(addForm.youthId)) ?? null;
  const selectedMed   = selectedYouth?.medications.find((m) => m.id === Number(addForm.medicationId)) ?? null;

  const addFormValid =
    addForm.date.trim()       !== "" &&
    addForm.youthId           !== "" &&
    addForm.medicationId      !== "" &&
    addForm.amount.trim()     !== "" &&
    addForm.comment.trim()    !== "";

  // ── List derived values ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!selectedProgram) return [];
    let rows = records.filter((r) => r.program === selectedProgram);
    // Exclude Pharmacy Transfer (Verified) per requirements
    rows = rows.filter((r) => (stagedStatuses[r.id] ?? r.status) !== "Pharmacy Transfer (Verified)");
    if (statusFilter !== "All statuses") {
      rows = rows.filter((r) => (stagedStatuses[r.id] ?? r.status) === statusFilter);
    }
    if (sortField && sortDir) {
      rows = [...rows].sort((a, b) => {
        const cmp = String(a[sortField] ?? "").localeCompare(String(b[sortField] ?? ""));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [records, stagedStatuses, selectedProgram, statusFilter, sortField, sortDir]);

  const allSelected  = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  const someSelected = filtered.some((r) => selectedIds.has(r.id));
  const hasPending   = Object.keys(stagedStatuses).length > 0 || Object.keys(pendingComments).length > 0;

  const availableStatuses = useMemo(() => {
    const roleAllowed = ROLE_ALLOWED_STATUSES[currentUserRole];
    if (!roleAllowed.length) return [];
    const selected = records.filter((r) => selectedIds.has(r.id));
    if (!selected.length) return roleAllowed;
    const maxOrder = Math.max(
      ...selected.map((r) => STATUS_ORDER[stagedStatuses[r.id] ?? r.status] ?? 0)
    );
    return roleAllowed.filter((s) => STATUS_ORDER[s] > maxOrder);
  }, [records, selectedIds, currentUserRole, stagedStatuses]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => { const n = new Set(prev); filtered.forEach((r) => n.delete(r.id)); return n; });
    } else {
      setSelectedIds((prev) => { const n = new Set(prev); filtered.forEach((r) => n.add(r.id)); return n; });
    }
  }

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function handleSort(field: SortField) {
    if (sortField !== field) { setSortField(field); setSortDir("asc"); return; }
    if (sortDir === "asc")   { setSortDir("desc"); return; }
    setSortField(null); setSortDir(null);
  }

  function applyMassAction() {
    if (!massActionStatus) return;
    const backward = records.filter((r) => {
      if (!selectedIds.has(r.id)) return false;
      return STATUS_ORDER[massActionStatus] <= STATUS_ORDER[stagedStatuses[r.id] ?? r.status];
    });
    if (backward.length) {
      toast.error("Backward status changes are not permitted.");
      return;
    }
    setStagedStatuses((prev) => {
      const n = { ...prev };
      selectedIds.forEach((id) => { n[id] = massActionStatus; });
      return n;
    });
    if (massActionComment.trim()) {
      setPendingComments((prev) => {
        const n = { ...prev };
        selectedIds.forEach((id) => {
          const rec = records.find((r) => r.id === id);
          const existing = prev[id] ?? rec?.addComment ?? "";
          n[id] = existing ? `${existing} ${massActionComment.trim()}` : massActionComment.trim();
        });
        return n;
      });
    }
    setSelectedIds(new Set());
    setMassActionStatus("");
    setMassActionComment("");
  }

  function handleSubmit() {
    const now = new Date();
    const dateFmt = formatMdy(now);
    const timeFmt = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const attestationDate = `${dateFmt} ${timeFmt}`;

    const newLogs: LogRecord[] = records
      .filter((r) => stagedStatuses[r.id])
      .map((r) => ({
        id:               ++_logId,
        date:             dateFmt,
        logType:          stagedStatuses[r.id],
        medicationId:     r.id,
        medication:       r.medication,
        dose:             r.dose,
        youth:            r.youth,
        attestationDate,
        attestationStaff: currentUserRole,
        attestationText:  ATTESTATION_TEXT,
        count:            r.amount,
        comments:         pendingComments[r.id] ?? r.addComment,
      }));

    const updatedCount = newLogs.length;
    const committed = records
      .map((r) => ({
        ...r,
        status:     (stagedStatuses[r.id] as DisposalStatus | undefined) ?? r.status,
        addComment: pendingComments[r.id] ?? r.addComment,
      }))
      .filter((r) => r.status !== ("Pharmacy Transfer (Verified)" as any));

    setRecords(committed);
    setSavedRecords(committed);
    setLogRecords((prev) => [...prev, ...newLogs]);
    setStagedStatuses({});
    setPendingComments({});
    setSelectedIds(new Set());

    toast.success(
      updatedCount > 0
        ? `${updatedCount} record${updatedCount !== 1 ? "s" : ""} successfully updated.`
        : "Changes saved successfully."
    );
  }

  function handleCancel() {
    if (hasPending) setShowCancelDialog(true);
  }

  function confirmCancel() {
    setRecords(savedRecords);
    setStagedStatuses({});
    setPendingComments({});
    setSelectedIds(new Set());
    setMassActionStatus("");
    setMassActionComment("");
    setShowCancelDialog(false);
  }

  // ── Add Disposal handlers ──────────────────────────────────────────────────

  function openAddModal() {
    setAddForm({ ...EMPTY_FORM, date: getTodayDate() });
    setAddModalOpen(true);
  }

  function handleAddFormChange(patch: Partial<AddDisposalForm>) {
    setAddForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.youthId !== undefined) { next.medicationId = ""; next.amount = ""; }
      if (patch.medicationId !== undefined) { next.amount = ""; }
      return next;
    });
  }

  function handleAddSubmit() {
    if (!addFormValid || !selectedYouth || !selectedMed) return;

    const now = new Date();
    const dateFmt = formatMdy(now);
    const timeFmt = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const attestationDate = `${dateFmt} ${timeFmt}`;

    // Immutable Disposal log record
    void {
      id: ++_logId, logType: "Disposal", date: addForm.date,
      medicationId: selectedMed.id, medication: selectedMed.name, dose: selectedMed.dose,
      youth: selectedYouth.name, countType: selectedMed.countType, count: addForm.amount,
      comments: addForm.comment, attestationDate, attestationText: ATTESTATION_TEXT,
      attestationStaff: currentUserRole, enteredInError: false,
    };

    // Immutable Attestation record
    void {
      id: ++_logId, date: dateFmt, attestationDate,
      attestationText: ATTESTATION_TEXT, attestationStaff: currentUserRole,
    };

    const newRecord: DisposalRecord = {
      id:              ++_recordId,
      program:         selectedProgram,
      status:          "Med Cart",
      medication:      selectedMed.name,
      dose:            selectedMed.dose,
      youth:           selectedYouth.name,
      date:            addForm.date,
      amount:          addForm.amount,
      disposalStaff:   currentUserRole,
      originalComment: addForm.comment,
      addComment:      "",
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    setSavedRecords(updated);
    setAddModalOpen(false);
    setAddForm({ ...EMPTY_FORM, date: getTodayDate() });

    toast.success("Disposal record created and added to Med Cart.");
  }

  function handleAddXClick() {
    const hasInput =
      addForm.youthId      !== "" ||
      addForm.medicationId !== "" ||
      addForm.amount       !== "" ||
      addForm.comment.trim() !== "";
    if (hasInput) {
      setShowAddCancelConfirm(true);
    } else {
      setAddModalOpen(false);
    }
  }

  function confirmAddCancel() {
    setShowAddCancelConfirm(false);
    setAddModalOpen(false);
    setAddForm({ ...EMPTY_FORM, date: getTodayDate() });
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ChevronUp   className="w-3 h-3 ml-1" style={{ color: "#145F33" }} />
      : <ChevronDown className="w-3 h-3 ml-1" style={{ color: "#145F33" }} />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ backgroundColor: "var(--slds-g-color-background-base)", borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
      >
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {fromProgramLog ? (
            <>
              <Button
                onClick={() => navigate(-1)}
                className="h-8 px-4 rounded-full flex items-center gap-2 slds-text-4 font-medium"
                style={{
                  backgroundColor: "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                  border: "1px solid var(--slds-g-color-border-base-1)",
                }}
                aria-label="Return to Overview"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Overview
              </Button>
              <div className="h-8 w-px" style={{ backgroundColor: "var(--slds-g-color-border-base-1)" }} />
              <h1 className="slds-page-header-title mb-0" style={{ color: "var(--slds-g-color-text-default)" }}>Manage Disposal</h1>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <label className="slds-form-label whitespace-nowrap" style={{ color: "var(--slds-g-color-text-weak)" }}>Program</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    setSelectedIds(new Set());
                    setStagedStatuses({});
                    setPendingComments({});
                    setMassActionStatus("");
                    setStatusFilter("All statuses");
                  }}
                  className="h-8 px-3 rounded slds-text-4"
                  style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)", minWidth: "200px" }}
                >
                  <option value="">— Select a program —</option>
                  {MOCK_PROGRAMS.filter((p) => p.roles.includes(currentUserRole)).map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ width: "1px", height: "20px", backgroundColor: "var(--slds-g-color-border-base-1)" }} />
              <div className="flex items-center gap-2">
                <span className="slds-text-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-weak)" }}>Viewing as:</span>
                <select
                  value={currentUserRole}
                  onChange={(e) => {
                    const role = e.target.value as UserRole;
                    setCurrentUserRole(role);
                    setSelectedIds(new Set());
                    setMassActionStatus("");
                    setSelectedProgram((prev) => {
                      const accessible = MOCK_PROGRAMS.filter((p) => p.roles.includes(role)).map((p) => p.name);
                      return accessible.includes(prev) ? prev : "";
                    });
                  }}
                  className="h-8 px-3 rounded slds-text-4"
                  style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
                >
                  <option value="Frontline Staff">Frontline Staff</option>
                  <option value="Therapist">Therapist</option>
                  <option value="Program Manager">Program Manager</option>
                  <option value="Nurse">Nurse</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {fromProgramLog && (
            <div className="flex items-center gap-2">
              <span className="slds-text-3 whitespace-nowrap" style={{ color: "var(--slds-g-color-text-weak)" }}>Viewing as:</span>
              <select
                value={currentUserRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setCurrentUserRole(role);
                  setSelectedIds(new Set());
                  setMassActionStatus("");
                  setSelectedProgram((prev) => {
                    const accessible = MOCK_PROGRAMS.filter((p) => p.roles.includes(role)).map((p) => p.name);
                    return accessible.includes(prev) ? prev : "";
                  });
                }}
                className="h-8 px-3 rounded slds-text-4"
                style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
              >
                <option value="Frontline Staff">Frontline Staff</option>
                <option value="Therapist">Therapist</option>
                <option value="Program Manager">Program Manager</option>
                <option value="Nurse">Nurse</option>
              </select>
            </div>
          )}
          <Button
            onClick={openAddModal}
            className="h-8 rounded-full px-4 flex items-center gap-2 slds-text-4 font-semibold"
            style={{ backgroundColor: "#145F33", color: "white", border: "none" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Disposal
          </Button>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0" style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}>
        <div className="flex items-center gap-3 px-6 py-2.5" style={{ backgroundColor: "var(--slds-g-color-background-alt)" }}>
          <label className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>Filter by status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setSelectedIds(new Set()); }}
            className="h-8 px-3 rounded slds-text-4"
            style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
          >
            <option>All statuses</option>
            <option>Med Cart</option>
            <option>Lockbox</option>
            <option>Pharmacy Transfer (Pending)</option>
          </select>
          <span className="slds-text-3 ml-auto" style={{ color: "var(--slds-g-color-text-weak)" }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {someSelected && (
          <div
            className="flex flex-wrap items-center gap-3 px-6 py-2.5"
            style={{ backgroundColor: "#EFF6FF", borderTop: "1px solid #BFDBFE" }}
          >
            <span className="slds-text-4 font-semibold flex-shrink-0" style={{ color: "#1D4ED8" }}>
              {selectedIds.size} row{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            {currentUserRole === "Frontline Staff" ? (
              <div className="flex items-center gap-2 slds-text-4" style={{ color: "#92400E" }}>
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                Frontline staff cannot change disposal status. Contact a Therapist, Program Manager, or Nurse.
              </div>
            ) : availableStatuses.length === 0 ? (
              <span className="slds-text-4" style={{ color: "var(--slds-g-color-text-weak)" }}>
                No valid forward status transitions available for the selected records.
              </span>
            ) : (
              <>
                <select
                  value={massActionStatus}
                  onChange={(e) => setMassActionStatus(e.target.value)}
                  className="h-8 px-3 rounded slds-text-4 flex-shrink-0"
                  style={{ border: "1px solid #BFDBFE", backgroundColor: "white", color: "var(--slds-g-color-text-default)" }}
                >
                  <option value="">Update status to…</option>
                  {availableStatuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  value={massActionComment}
                  onChange={(e) => setMassActionComment(e.target.value)}
                  placeholder="Add comment to all selected rows… (optional)"
                  className="h-8 px-3 rounded slds-text-4 flex-1 min-w-[200px]"
                  style={{ border: "1px solid #BFDBFE", backgroundColor: "white", color: "var(--slds-g-color-text-default)", outline: "none" }}
                  aria-label="Mass action comment"
                />
                <Button
                  onClick={applyMassAction}
                  disabled={!massActionStatus}
                  className="h-8 rounded-full px-4 slds-text-4 font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: massActionStatus ? "#145F33" : "var(--slds-g-color-neutral-95)",
                    color: massActionStatus ? "white" : "var(--slds-g-color-text-weak)",
                    border: "none",
                  }}
                >
                  Apply
                </Button>
              </>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="slds-text-4 underline ml-auto flex-shrink-0"
              style={{ color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* ── List View ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: "1200px" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: "2px solid var(--slds-g-color-border-base-1)" }}>
              <th className="px-4 py-3" style={{ width: "44px" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "#145F33" }}
                  aria-label="Select all rows"
                />
              </th>
              {COLUMNS.map(({ key, label, width }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  style={{ width, minWidth: width, color: "var(--slds-g-color-text-weak)" }}
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center text-[11px] font-semibold uppercase tracking-wider">
                    {label}
                    <SortIcon field={key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left" style={{ minWidth: "220px", color: "var(--slds-g-color-text-weak)" }}>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Add Comment</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center">
                  {!selectedProgram ? (
                    <>
                      <p className="slds-text-4 font-medium mb-1" style={{ color: "var(--slds-g-color-text-default)" }}>Select a program</p>
                      <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        Choose a program from the dropdown above to view its disposal records.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="slds-text-4 font-medium mb-1" style={{ color: "var(--slds-g-color-text-default)" }}>No disposal records</p>
                      <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                        {statusFilter === "All statuses"
                          ? "No active disposal records for this program."
                          : `No records with status "${statusFilter}".`}
                      </p>
                    </>
                  )}
                </td>
              </tr>
            ) : filtered.map((record) => {
              const displayStatus  = stagedStatuses[record.id] ?? record.status;
              const badge          = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG["Med Cart"];
              const isSelected     = selectedIds.has(record.id);
              const isStaged       = !!stagedStatuses[record.id];
              const displayComment = pendingComments[record.id] ?? record.addComment;

              return (
                <tr
                  key={record.id}
                  style={{
                    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: isSelected ? "#F0FDF4" : "var(--slds-g-color-background-base)",
                  }}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(record.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: "#145F33" }}
                      aria-label={`Select ${record.youth}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full slds-text-3 font-semibold whitespace-nowrap"
                        style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
                      >
                        {displayStatus}
                      </span>
                      {isStaged && (
                        <span className="slds-text-3 italic" style={{ color: "#92400E" }}>pending</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 slds-text-4" style={{ color: "var(--slds-g-color-text-default)", fontWeight: 500 }}>{record.medication}</td>
                  <td className="px-4 py-3 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{record.dose}</td>
                  <td className="px-4 py-3 slds-text-4 font-medium" style={{ color: "#0176d3" }}>{record.youth}</td>
                  <td className="px-4 py-3 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{record.date}</td>
                  <td className="px-4 py-3 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{record.amount}</td>
                  <td className="px-4 py-3 slds-text-4" style={{ color: "var(--slds-g-color-text-default)" }}>{record.disposalStaff}</td>
                  <td className="px-4 py-3 slds-text-3" style={{ color: "var(--slds-g-color-text-weak)", maxWidth: "200px" }}>
                    <span title={record.originalComment} className="line-clamp-2">{record.originalComment}</span>
                  </td>
                  <td className="px-4 py-3" style={{ minWidth: "220px" }}>
                    <input
                      type="text"
                      value={displayComment}
                      onChange={(e) => setPendingComments((prev) => ({ ...prev, [record.id]: e.target.value }))}
                      placeholder="Add comment… (optional)"
                      className="w-full h-8 px-2.5 rounded slds-text-4 outline-none"
                      style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                        color: "var(--slds-g-color-text-default)",
                      }}
                      aria-label={`Add comment for ${record.medication}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Attestation + Submit Bar ───────────────────────────────────────────── */}
      <div
        className="flex items-center justify-end gap-3 px-6 py-3 flex-shrink-0"
        style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderTop: "1px solid var(--slds-g-color-border-base-1)" }}
      >
        <p className="m-0 text-[12px] text-right italic font-medium">
          {ATTESTATION_TEXT}
        </p>
        <Button
          onClick={handleCancel}
          className="h-8 rounded-full px-5 slds-text-4 font-semibold flex-shrink-0"
          style={{ backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="h-8 rounded-full px-5 slds-text-4 font-semibold flex-shrink-0"
          style={{ backgroundColor: "#145F33", color: "white", border: "none" }}
        >
          Submit
        </Button>
      </div>

      {/* ── Cancel Confirmation Dialog ─────────────────────────────────────────── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm" aria-describedby="cancel-dialog-desc">
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel?</DialogTitle>
            <DialogDescription id="cancel-dialog-desc">
              All unsaved changes — including staged status updates and comments — will be cleared and the screen will reset to its last saved state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowCancelDialog(false)}
              className="h-9 rounded-full px-5 slds-text-4 font-semibold"
              style={{ backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
            >
              No, go back
            </Button>
            <Button
              onClick={confirmCancel}
              className="h-9 rounded-full px-5 slds-text-4 font-semibold"
              style={{ backgroundColor: "#c23934", color: "white", border: "none" }}
            >
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Disposal Modal ─────────────────────────────────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={() => handleAddXClick()}>
        <DialogContent
          className="flex flex-col max-w-xl w-[calc(100vw-2rem)]"
          size="md"
          aria-describedby="add-disposal-desc"
        >
          <DialogHeader
            className="flex-shrink-0 pb-3"
            style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
          >
            <DialogTitle className="slds-text-6 font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
              Add Disposal
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable form body */}
          <DialogBody className="space-y-6">
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* Instructional text */}
            <div
              className="flex gap-2.5 rounded-md px-4 py-3"
              style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
              id="add-disposal-desc"
            >
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#1D4ED8" }} />
              <div className="space-y-1" style={{ color: "#1E40AF" }}>
                <p className="slds-text-4 mb-0">
                  Write the following info on coin envelope for disposal: <strong>DISCARD</strong>, staff initials, date, medication name, doses, and youth.
                </p>
                <p className="slds-text-4 mb-0">
                  Please remember to notify a Med Admin that medications are in the disposal drawer.
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="add-date" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Date <span className="text-red-600">*</span>
              </label>
              <input
                id="add-date"
                type="text"
                value={addForm.date}
                onChange={(e) => handleAddFormChange({ date: e.target.value })}
                placeholder="MM/DD/YYYY"
                maxLength={10}
                className="w-full h-9 px-3 rounded slds-text-4 outline-none"
                style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
              />
            </div>

            {/* Youth */}
            <div className="space-y-1.5">
              <label htmlFor="add-youth" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Youth <span className="text-red-600">*</span>
              </label>
              <select
                id="add-youth"
                value={addForm.youthId}
                onChange={(e) => handleAddFormChange({ youthId: e.target.value })}
                className="w-full h-9 px-3 rounded slds-text-4"
                style={{
                  border: "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: "var(--slds-g-color-background-base)",
                  color: addForm.youthId ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)",
                }}
              >
                <option value="">Select youth…</option>
                {MOCK_YOUTHS.map((y) => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>

            {/* Medication */}
            <div className="space-y-1.5">
              <label htmlFor="add-medication" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Medication <span className="text-red-600">*</span>
              </label>
              <select
                id="add-medication"
                value={addForm.medicationId}
                onChange={(e) => handleAddFormChange({ medicationId: e.target.value })}
                disabled={!selectedYouth}
                className="w-full h-9 px-3 rounded slds-text-4"
                style={{
                  border: "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: selectedYouth ? "var(--slds-g-color-background-base)" : "var(--slds-g-color-neutral-95)",
                  color: addForm.medicationId ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)",
                  cursor: selectedYouth ? "pointer" : "not-allowed",
                }}
              >
                <option value="">{selectedYouth ? "Select medication…" : "Select a youth first"}</option>
                {selectedYouth?.medications.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.dosePeriod}</option>
                ))}
              </select>
              {selectedMed && (
                <p className="slds-text-3 mt-0.5" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Dose: {selectedMed.dose} &nbsp;·&nbsp; Count Type: {selectedMed.countType}
                </p>
              )}
            </div>

            {/* Amount Disposed */}
            <div className="space-y-1.5">
              <label htmlFor="add-amount" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Amount Disposed <span className="text-red-600">*</span>
              </label>
              {!selectedMed ? (
                <input
                  id="add-amount"
                  type="text"
                  disabled
                  placeholder="Select a medication first"
                  className="w-full h-9 px-3 rounded slds-text-4"
                  style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-neutral-95)", color: "var(--slds-g-color-text-weak)", cursor: "not-allowed" }}
                />
              ) : selectedMed.countType === "Units" ? (
                <input
                  id="add-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d{0,3}(\.\d{0,2})?$/.test(val)) {
                      handleAddFormChange({ amount: val });
                    }
                  }}
                  placeholder="0.00"
                  className="w-full h-9 px-3 rounded slds-text-4 outline-none"
                  style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
                />
              ) : (
                <select
                  id="add-amount"
                  value={addForm.amount}
                  onChange={(e) => handleAddFormChange({ amount: e.target.value })}
                  className="w-full h-9 px-3 rounded slds-text-4"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                    color: addForm.amount ? "var(--slds-g-color-text-default)" : "var(--slds-g-color-text-weak)",
                  }}
                >
                  <option value="">Select amount…</option>
                  {VOLUME_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label htmlFor="add-comment" className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Comments <span className="text-red-600">*</span>
              </label>
              <textarea
                id="add-comment"
                value={addForm.comment}
                onChange={(e) => handleAddFormChange({ comment: e.target.value })}
                placeholder="Enter reason for disposal…"
                rows={3}
                className="w-full px-3 py-2 rounded slds-text-4 outline-none resize-none"
                style={{ border: "1px solid var(--slds-g-color-border-base-1)", backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)" }}
              />
              <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                This comment will appear as a read-only Original Comment on the Manage Disposal screen and cannot be edited at any subsequent stage.
              </p>
            </div>
          </div>
          </DialogBody>
          {/* Attestation + Submit — right-aligned italic text adjacent to Submit, matches SYD */}
          <DialogFooter className="w-full px-6 py-3">
                {/* Attestation */}
                <p className="m-0 text-[12px] text-right italic font-medium"
                >
                  {ATTESTATION_TEXT}
                </p>
            
                {/* Submit */}
                <Button
                  onClick={handleAddSubmit}
                  disabled={!addFormValid}
                  className="h-8 rounded-full px-5 slds-text-4 font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: addFormValid
                      ? "#145F33"
                      : "var(--slds-g-color-neutral-95)",
                    color: addFormValid
                      ? "white"
                      : "var(--slds-g-color-text-weak)",
                    border: "none",
                  }}
                >
                  Submit
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Disposal X Confirmation ────────────────────────────────────────── */}
      <Dialog open={showAddCancelConfirm} onOpenChange={setShowAddCancelConfirm}>
        <DialogContent className="max-w-sm" aria-describedby="add-cancel-desc">
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel?</DialogTitle>
            <DialogDescription id="add-cancel-desc">
              All pending inputs will be cleared and the modal will close.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowAddCancelConfirm(false)}
              className="h-9 rounded-full px-5 slds-text-4 font-semibold"
              style={{ backgroundColor: "var(--slds-g-color-background-base)", color: "var(--slds-g-color-text-default)", border: "1px solid var(--slds-g-color-border-base-1)" }}
            >
              No, go back
            </Button>
            <Button
              onClick={confirmAddCancel}
              className="h-9 rounded-full px-5 slds-text-4 font-semibold"
              style={{ backgroundColor: "#c23934", color: "white", border: "none" }}
            >
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
