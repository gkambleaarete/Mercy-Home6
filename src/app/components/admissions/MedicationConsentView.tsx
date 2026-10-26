import { useState } from "react";
import { FileText, Plus, AlertCircle, Eye, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";
import { formatMdy } from "../../lib/dateFormat";

type ConsentStatus = "Draft" | "Sent" | "Executed" | "Expired";

// AC7: Auditable count log entry
interface CountLogEntry {
  id: number;
  consentId: number;
  medicationName: string;
  dosingPeriod: string;
  count: string;
  submittedBy: string;
  timestamp: string;
}

interface ConsentRecord {
  id: number;
  medicationName: string;
  genericName: string;
  dosingPeriod: string;
  dose: string;
  status: ConsentStatus;
  executedDate: string;
  startDate: string;
  endDate: string;
  initialCount: string;
  uploadedFileName: string;
  uploadedFileUrl: string;
  createdDate: string;
  createdBy: string;
  canDispense: boolean;
}

const STATUS_META: Record<ConsentStatus, { label: string; bg: string; text: string }> = {
  Executed: { label: "Executed", bg: "bg-green-100", text: "text-green-800" },
  Draft:    { label: "Draft",    bg: "bg-yellow-100", text: "text-yellow-800" },
  Sent:     { label: "Sent",     bg: "bg-blue-100",   text: "text-blue-800" },
  Expired:  { label: "Expired",  bg: "bg-red-100",    text: "text-red-700" },
};

const MOCK_CONSENTS: ConsentRecord[] = [
  {
    id: 1,
    medicationName: "Lexapro",
    genericName: "Escitalopram",
    dosingPeriod: "Morning",
    dose: "20mg",
    status: "Executed",
    executedDate: "01/03/2026",
    startDate: "01/03/2026",
    endDate: "01/02/2027",
    initialCount: "30.00",
    uploadedFileName: "lexapro_consent_jan2026.pdf",
    uploadedFileUrl: "#",
    createdDate: "01/02/2026",
    createdBy: "Dr. Sarah Johnson",
    canDispense: true,
  },
  {
    id: 2,
    medicationName: "Adderall XR",
    genericName: "Amphetamine/Dextroamphetamine",
    dosingPeriod: "Morning",
    dose: "20mg",
    status: "Executed",
    executedDate: "12/10/2025",
    startDate: "12/10/2025",
    endDate: "12/09/2026",
    initialCount: "28.00",
    uploadedFileName: "adderall_consent_dec2025.pdf",
    uploadedFileUrl: "#",
    createdDate: "12/09/2025",
    createdBy: "Dr. Sarah Johnson",
    canDispense: true,
  },
  {
    id: 3,
    medicationName: "Abilify",
    genericName: "Aripiprazole",
    dosingPeriod: "Evening",
    dose: "10mg",
    status: "Draft",
    executedDate: "",
    startDate: "",
    endDate: "",
    initialCount: "60.00",
    uploadedFileName: "",
    uploadedFileUrl: "",
    createdDate: "02/01/2026",
    createdBy: "Dr. Sarah Johnson",
    canDispense: false,
  },
];

const DEFAULT_FORM = {
  status: "Draft" as ConsentStatus,
  executedDate: "",
  startDate: "",
  endDate: "",
  initialCount: "",
  uploadedFileName: "",
  uploadedFileUrl: "",
  acknowledgedDosage: false,
  acknowledgedTreatmentPurpose: false,
  acknowledgedInstructions: false,
};

export function MedicationConsentView() {
  const [consents, setConsents] = useState<ConsentRecord[]>(MOCK_CONSENTS);
  const [filterStatus, setFilterStatus] = useState<ConsentStatus | "All">("All");
  const [selected, setSelected] = useState<ConsentRecord | null>(null);
  const [viewDocOpen, setViewDocOpen] = useState(false);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [overlapOpen, setOverlapOpen] = useState(false);
  const [overlappingId, setOverlappingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [showCountLog, setShowCountLog] = useState(false);

  // AC7: Count Log — auditable entries with user + timestamp
  const [countLog, setCountLog] = useState<CountLogEntry[]>([
    { id: 1, consentId: 1, medicationName: "Lexapro",     dosingPeriod: "Morning", count: "30.00", submittedBy: "Dr. Sarah Johnson", timestamp: "01/03/2026 09:14 AM" },
    { id: 2, consentId: 1, medicationName: "Lexapro",     dosingPeriod: "Bedtime", count: "30.00", submittedBy: "Dr. Sarah Johnson", timestamp: "01/03/2026 09:14 AM" },
    { id: 3, consentId: 2, medicationName: "Adderall XR", dosingPeriod: "Morning", count: "28.00", submittedBy: "Dr. Sarah Johnson", timestamp: "12/10/2025 08:30 AM" },
  ]);

  const filtered = consents.filter(
    (c) => filterStatus === "All" || c.status === filterStatus
  );

  const calculateEndDate = (start: string): string => {
    if (!start) return "";
    const d = new Date(start);
    d.setFullYear(d.getFullYear() + 1);
    d.setDate(d.getDate() - 1);
    return formatMdy(d);
  };

  const handleExecutedDateChange = (val: string) => {
    setForm((f) => ({
      ...f,
      executedDate: val,
      startDate: val,
      endDate: calculateEndDate(val),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((f) => ({
        ...f,
        uploadedFileName: file.name,
        uploadedFileUrl: URL.createObjectURL(file),
      }));
      toast.success(`"${file.name}" uploaded`);
    }
  };

  const validate = (): boolean => {
    if (!form.executedDate) { toast.error("Executed Date is required"); return false; }
    if (!form.startDate) { toast.error("Start Date is required"); return false; }
    if (!form.endDate) { toast.error("End Date is required"); return false; }
    const s = new Date(form.startDate), e = new Date(form.endDate);
    if (e < s) { toast.error("End Date must be after Start Date"); return false; }
    if (!form.initialCount || parseFloat(form.initialCount) < 0) {
      toast.error("Initial Count is required");
      return false;
    }
    if (form.status === "Executed") {
      if (!form.acknowledgedDosage) { toast.error("Acknowledge Dosage before executing"); return false; }
      if (!form.acknowledgedTreatmentPurpose) { toast.error("Acknowledge Treatment Purpose before executing"); return false; }
      if (!form.acknowledgedInstructions) { toast.error("Acknowledge Instructions before executing"); return false; }
    }
    return true;
  };

  const checkOverlap = (): number | null => {
    if (!selected) return null;
    const newStart = new Date(form.startDate);
    const newEnd = form.endDate ? new Date(form.endDate) : new Date("2099-12-31");
    for (const c of consents) {
      if (c.status !== "Executed") continue;
      if (c.medicationName !== selected.medicationName) continue;
      if (c.dosingPeriod !== selected.dosingPeriod) continue;
      if (isEditing && c.id === selected.id) continue;
      const cs = new Date(c.startDate), ce = c.endDate ? new Date(c.endDate) : new Date("2099-12-31");
      if (newStart <= ce && newEnd >= cs) return c.id;
    }
    return null;
  };

  const handleSave = () => {
    if (!validate()) return;
    const overlap = checkOverlap();
    if (overlap) {
      setOverlappingId(overlap);
      setOverlapOpen(true);
      return;
    }
    commitSave();
  };

  const commitSave = (replacedId?: number) => {
    if (replacedId) {
      const existing = consents.find((c) => c.id === replacedId);
      if (existing) {
        const dayBefore = new Date(form.startDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        const newEnd = formatMdy(dayBefore);
        setConsents((prev) => prev.map((c) => c.id === replacedId ? { ...c, endDate: newEnd } : c));
        toast.success("Previous consent end-dated successfully");
      }
    }

    if (isEditing && selected) {
      setConsents((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? {
                ...c,
                status: form.status,
                executedDate: form.executedDate,
                startDate: form.startDate,
                endDate: form.endDate,
                initialCount: form.initialCount,
                uploadedFileName: form.uploadedFileName,
                uploadedFileUrl: form.uploadedFileUrl,
                canDispense: form.status === "Executed",
              }
            : c
        )
      );
      toast.success("Consent updated");
    } else {
      const newRecord: ConsentRecord = {
        id: Math.max(...consents.map((c) => c.id), 0) + 1,
        medicationName: selected?.medicationName || "New Medication",
        genericName: selected?.genericName || "",
        dosingPeriod: selected?.dosingPeriod || "",
        dose: selected?.dose || "",
        status: form.status,
        executedDate: form.executedDate,
        startDate: form.startDate,
        endDate: form.endDate,
        initialCount: form.initialCount,
        uploadedFileName: form.uploadedFileName,
        uploadedFileUrl: form.uploadedFileUrl,
        createdDate: formatMdy(new Date()),
        createdBy: "Current User",
        canDispense: form.status === "Executed",
      };
      setConsents((prev) => [...prev, newRecord]);

      // AC7: Append auditable Count Log entry with user + timestamp
      const now = new Date().toLocaleString("en-US", {
        month: "2-digit", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
      setCountLog((prev) => [
        ...prev,
        {
          id: Math.max(...prev.map((l) => l.id), 0) + 1,
          consentId: newRecord.id,
          medicationName: newRecord.medicationName,
          dosingPeriod: newRecord.dosingPeriod,
          count: form.initialCount,
          submittedBy: "Current User",
          timestamp: now,
        },
      ]);
      toast.success("Consent created. Initial Count log entry recorded.");
    }

    setConsentDialogOpen(false);
    setForm({ ...DEFAULT_FORM });
    setSelected(null);
    setIsEditing(false);
  };

  const openEdit = (c: ConsentRecord) => {
    setSelected(c);
    setIsEditing(true);
    setForm({
      status: c.status,
      executedDate: c.executedDate,
      startDate: c.startDate,
      endDate: c.endDate,
      initialCount: c.initialCount,
      uploadedFileName: c.uploadedFileName,
      uploadedFileUrl: c.uploadedFileUrl,
      acknowledgedDosage: false,
      acknowledgedTreatmentPurpose: false,
      acknowledgedInstructions: false,
    });
    setConsentDialogOpen(true);
  };

  const openViewDoc = (c: ConsentRecord) => {
    setSelected(c);
    setViewDocOpen(true);
  };

  const overlappingConsent = consents.find((c) => c.id === overlappingId);

  const FILTER_TABS: Array<ConsentStatus | "All"> = ["All", "Executed", "Draft", "Sent", "Expired"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border) var(--slds-c-card-radius-border) 0 0",
        }}
      >
        {/* Filter tabs */}
        <div className="flex">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                filterStatus === tab ? "text-[#145F33]" : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                filterStatus === tab
                  ? { borderBottom: "3px solid #145F33", marginBottom: "-1px" }
                  : {}
              }
            >
              {tab}
              {tab !== "All" && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    filterStatus === tab ? "bg-[#145F33] text-white" : "bg-gray-100 text-[#706e6b]"
                  }`}
                >
                  {consents.filter((c) => c.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Create button */}
        <Button
          onClick={() => {
            setIsEditing(false);
            setSelected(null);
            setForm({ ...DEFAULT_FORM });
            setConsentDialogOpen(true);
          }}
          className="h-8 px-4 text-[13px] font-medium rounded-full"
          style={{ backgroundColor: "#145F33", color: "white" }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Consent
        </Button>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderTop: "none",
          borderRadius: "0 0 var(--slds-c-card-radius-border) var(--slds-c-card-radius-border)",
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="text-left"
                style={{
                  backgroundColor: "var(--slds-g-color-background-alt)",
                  borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                {[
                  "Medication",
                  "Dose Period",
                  "Status",
                  "Executed Date",
                  "Start Date",
                  "End Date (Inclusive)",
                  "Initial Count",
                  "Document",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-[13px]"
                    style={{ color: "var(--slds-g-color-text-weak)" }}
                  >
                    No consent records found
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const meta = STATUS_META[c.status];
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/60 transition-colors"
                      style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                    >
                      <td className="px-4 py-3 text-[13px] font-medium">
                        {c.medicationName}
                        {c.genericName && (
                          <span className="block text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {c.genericName}
                          </span>
                        )}
                        {c.dose && (
                          <span className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            {c.dose}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[13px]">{c.dosingPeriod || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit ${meta.bg} ${meta.text}`}
                          >
                            {meta.label}
                          </span>
                          {c.status !== "Executed" && (
                            <span className="text-[10px] text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Dispensation blocked
                            </span>
                          )}
                          {c.status === "Executed" && !c.canDispense && (
                            <span className="text-[10px] text-orange-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Outside date range
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px]">{c.executedDate || "—"}</td>
                      <td className="px-4 py-3 text-[13px]">{c.startDate || "—"}</td>
                      <td className="px-4 py-3 text-[13px]">{c.endDate || "—"}</td>
                      <td className="px-4 py-3 text-[13px]">{c.initialCount || "—"}</td>
                      <td className="px-4 py-3">
                        {c.uploadedFileName ? (
                          <button
                            onClick={() => openViewDoc(c)}
                            className="flex items-center gap-1 text-[12px] font-medium text-[#145F33] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="max-w-[120px] truncate">{c.uploadedFileName}</span>
                          </button>
                        ) : (
                          <span className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                            Not uploaded
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {c.uploadedFileName && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openViewDoc(c)}
                              className="h-7 px-2 hover:bg-gray-100"
                              style={{ color: "var(--slds-g-color-text-weak)" }}
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {c.status !== "Executed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(c)}
                              className="h-7 px-2 hover:bg-gray-100"
                              style={{ color: "#0176d3" }}
                              title="Edit Consent"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hard gating info banner */}
      <div
        className="flex items-start gap-3 p-3 rounded-md text-[12px]"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          color: "var(--slds-g-color-text-weak)",
        }}
      >
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#706e6b]" />
        <span>
          Medications only appear in the dispensation workflow when consent status is{" "}
          <strong>Executed</strong> and the current date falls within the inclusive Start–End Date range.
          Consents in Draft, Sent, or Expired status are blocked from dispensation.
        </span>
      </div>

      {/* AC7: Count Log — auditable entries with user + timestamp */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        <button
          onClick={() => setShowCountLog((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-[13px] font-medium text-left"
          style={{ backgroundColor: "var(--slds-g-color-background-alt)", borderBottom: showCountLog ? "1px solid var(--slds-g-color-border-base-1)" : "none" }}
        >
          <span style={{ color: "var(--slds-g-color-text-default)" }}>
            Count Log ({countLog.length} entries)
          </span>
          <span className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
            {showCountLog ? "Hide" : "Show"}
          </span>
        </button>
        {showCountLog && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--slds-g-color-background-alt)",
                    borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {["Medication", "Dose Period", "Count", "Submitted By", "Timestamp"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--slds-g-color-text-weak)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countLog.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                      No count log entries
                    </td>
                  </tr>
                ) : (
                  countLog.map((entry) => (
                    <tr
                      key={entry.id}
                      style={{ borderBottom: "1px solid var(--slds-g-color-border-base-1)" }}
                    >
                      <td className="px-4 py-2 text-[13px]">{entry.medicationName}</td>
                      <td className="px-4 py-2 text-[13px]">{entry.dosingPeriod}</td>
                      <td className="px-4 py-2 text-[13px] font-medium">{entry.count}</td>
                      <td className="px-4 py-2 text-[13px]">{entry.submittedBy}</td>
                      <td className="px-4 py-2 text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>{entry.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Consent Dialog */}
      <Dialog
        open={consentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConsentDialogOpen(false);
            setForm({ ...DEFAULT_FORM });
            setSelected(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Consent" : "Create Consent"}</DialogTitle>
            <DialogDescription>
              Upload the executed consent document and configure required dates. DocuSign integration is
              reserved for future state.
            </DialogDescription>
            {/* AC17: Explicit restriction notice */}
            <div
              className="flex items-start gap-2.5 mt-2 px-3 py-2.5 rounded-md"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#c23934" }} />
              <div className="flex-1 min-w-0">
                <p className="slds-text-4 font-semibold leading-tight" style={{ color: "#c23934" }}>
                  Cannot delete this record.
                </p>
                <p className="slds-text-3 mt-0.5" style={{ color: "#9B1C1C" }}>
                  Administrator access is required to delete Active or Archived consent records.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Consent Status */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cs-status"
                className="slds-form-label"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                Consent Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as ConsentStatus }))}
              >
                <SelectTrigger id="cs-status" className="h-9 slds-text-4" style={{ borderColor: "var(--slds-g-color-border-base-1)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Executed">Executed</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <Label
                className="slds-form-label"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                Upload Consent Document (PDF / DOC)
              </Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="consent-file-upload"
                  className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-lg cursor-pointer transition-colors group"
                  style={{
                    border: "2px dashed var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-alt)",
                    padding: "18px 16px",
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    style={{ color: "#145F33" }}
                  />
                  <p className="slds-text-4 text-center">
                    <span className="font-semibold" style={{ color: "#145F33" }}>Click to upload</span>
                    <span style={{ color: "var(--slds-g-color-text-weak)" }}> or drag and drop</span>
                  </p>
                  <p className="slds-text-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    PDF, DOC, or DOCX
                  </p>
                  <input
                    id="consent-file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
                {form.uploadedFileName && (
                  <div className="flex items-center gap-1.5 text-[12px] text-[#145F33] font-medium shrink-0">
                    <FileText className="w-4 h-4" />
                    <span className="max-w-[140px] truncate">{form.uploadedFileName}</span>
                    <button
                      onClick={() => setForm((f) => ({ ...f, uploadedFileName: "", uploadedFileUrl: "" }))}
                      className="text-[#706e6b] hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="cs-exec"
                  className="slds-form-label"
                  style={{ color: "var(--slds-g-color-text-weak)" }}
                >
                  Executed Date <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="cs-exec"
                  type="text"
                  value={form.executedDate}
                  onChange={(e) => handleExecutedDateChange(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="h-9 slds-text-4"
                  style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="cs-start"
                  className="slds-form-label"
                  style={{ color: "var(--slds-g-color-text-weak)" }}
                >
                  Start Date <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="cs-start"
                  type="text"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  placeholder="MM/DD/YYYY"
                  className="h-9 slds-text-4"
                  style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                />
                <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Defaults from Executed Date
                </p>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="cs-end"
                  className="slds-form-label"
                  style={{ color: "var(--slds-g-color-text-weak)" }}
                >
                  End Date <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="cs-end"
                  type="text"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  placeholder="MM/DD/YYYY"
                  className="h-9 slds-text-4"
                  style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                />
                <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Default: Start Date + 364 days
                </p>
              </div>
            </div>

            {/* End date inclusive notice */}
            <div
              className="flex items-start gap-2 p-3 rounded-md text-[12px] text-blue-900 bg-blue-50 border border-blue-200"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              End Date is inclusive — medication remains available through 11:59 PM of the End Date.
            </div>

            {/* Initial Count */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cs-count"
                className="slds-form-label"
                style={{ color: "var(--slds-g-color-text-weak)" }}
              >
                Count at Setup <span className="text-red-600">*</span>
              </Label>
              <Input
                id="cs-count"
                type="number"
                min="0"
                step="0.01"
                value={form.initialCount}
                onChange={(e) => setForm((f) => ({ ...f, initialCount: e.target.value }))}
                placeholder="0.00"
                className="h-9 slds-text-4"
                style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
                disabled={isEditing && form.status === "Executed" && !!form.initialCount}
              />
              {isEditing && form.status === "Executed" && form.initialCount && (
                <p className="text-[11px] italic" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Count is read-only once consent is Executed.
                </p>
              )}
              <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                Required per dose period record. Creates a Count Log entry on save.
              </p>
            </div>

            {/* Acknowledgments — only when marking Executed */}
            {form.status === "Executed" && (
              <div
                className="space-y-3 p-4 rounded-md"
                style={{
                  border: "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: "var(--slds-g-color-background-alt)",
                }}
              >
                <p
                  className="slds-form-label font-semibold"
                  style={{ color: "var(--slds-g-color-text-weak)" }}
                >
                  PRE-SUBMISSION CONFIRMATION
                </p>
                <p className="text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Confirm the following fields before marking this consent Executed:
                </p>
                {[
                  { id: "ack-dose", key: "acknowledgedDosage" as const, label: "I confirm the Dosage is accurate" },
                  { id: "ack-purpose", key: "acknowledgedTreatmentPurpose" as const, label: "I confirm the Treatment Purpose is accurate" },
                  { id: "ack-instr", key: "acknowledgedInstructions" as const, label: "I confirm the Instructions are accurate" },
                ].map(({ id, key, label }) => (
                  <div key={id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={form[key]}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, [key]: !!v }))}
                    />
                    <Label htmlFor={id} className="cursor-pointer text-[13px]">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full h-9"
              onClick={() => {
                setConsentDialogOpen(false);
                setForm({ ...DEFAULT_FORM });
                setIsEditing(false);
                setSelected(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-full h-9"
              style={{ backgroundColor: "#145F33", color: "white" }}
            >
              {isEditing ? "Save Changes" : "Save Consent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overlap Warning Dialog */}
      <Dialog open={overlapOpen} onOpenChange={setOverlapOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Active Consent Overlap Detected
            </DialogTitle>
            <DialogDescription aria-describedby="overlap-desc">
              An active medication record / consent already exists within the dates selected. Would you like
              to end-date the current medication record / consent and replace it with this one?
            </DialogDescription>
          </DialogHeader>
          {overlappingConsent && (
            <div className="py-3 space-y-1.5 text-[13px]" id="overlap-desc">
              <p>
                <strong>Existing consent:</strong>{" "}
                {overlappingConsent.startDate} – {overlappingConsent.endDate}
              </p>
              <p style={{ color: "var(--slds-g-color-text-weak)" }}>
                If you proceed, the existing consent End Date will be set to one day before the new
                Start Date. This supports future-dated replacements.
              </p>
            </div>
          )}
          {/* AC11: Three options — Cancel aborts; Proceed keeps both; Replace end-dates existing */}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full h-9"
              onClick={() => { setOverlapOpen(false); setOverlappingId(null); }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="rounded-full h-9"
              style={{ borderColor: "#145F33", color: "#145F33" }}
              onClick={() => {
                setOverlapOpen(false);
                setOverlappingId(null);
                commitSave();
              }}
            >
              Proceed Without Replacing
            </Button>
            <Button
              className="rounded-full h-9"
              style={{ backgroundColor: "#145F33", color: "white" }}
              onClick={() => {
                setOverlapOpen(false);
                commitSave(overlappingId ?? undefined);
                setOverlappingId(null);
              }}
            >
              End-Date &amp; Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Consent Document Dialog */}
      <Dialog open={viewDocOpen} onOpenChange={setViewDocOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]" aria-describedby="doc-desc">
          <DialogHeader>
            <DialogTitle>Consent Document</DialogTitle>
            <DialogDescription id="doc-desc">
              {selected?.uploadedFileName || "No document uploaded"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selected?.uploadedFileName ? (
              <div className="space-y-3">
                <div>
                  <p className="slds-form-label" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    FILE
                  </p>
                  <p className="text-[13px] font-medium mt-0.5">{selected.uploadedFileName}</p>
                </div>
                <div
                  className="flex items-center justify-center rounded-md min-h-[400px]"
                  style={{
                    backgroundColor: "var(--slds-g-color-background-alt)",
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <p className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                    Document preview — in production this area displays the PDF viewer.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                No document has been uploaded for this consent.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full h-9"
              onClick={() => setViewDocOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
