import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { ChevronDown, Search, Check } from "lucide-react";
import { toast } from "sonner";

const INCIDENT_TYPES = [
  "Physical Aggression",
  "Property Damage",
  "Elopement",
  "Self-Harm",
  "Medical Emergency",
  "Other",
];

const PROGRAMS = [
  "Mahoney House",
  "Rydell House",
  "Residential Program",
  "Other",
];

const INVOLVEMENT_TYPES = [
  "Youth Involved",
  "Staff Involved",
  "Witness",
  "Restraint Consultant",
  "DCFS Hotline Operator",
  "Other",
];

const INDIVIDUALS = [
  "Marcus Thompson",
  "Swapnali Shingare",
  "Jyotir Dhalmahapatra",
  "Ajit Khulape",
  "Mukesh Jaiswal",
  "Teg Chanderpaul",
];

// Props interface kept compatible with parent — only used ones are consumed
interface LeadDetailCreateIncidentDialogProps {
  createIncidentDialogOpen: any;
  setCreateIncidentDialogOpen: any;
  newIncidentType: any;
  setNewIncidentType: any;
  newIncidentOtherType: any;
  setNewIncidentOtherType: any;
  newIncidentOtherTypeError: boolean;
  setNewIncidentOtherTypeError: any;
  newIncidentStartDate: any;
  setNewIncidentStartDate: any;
  newIncidentStartTime: any;
  setNewIncidentStartTime: any;
  newIncidentEndDate: any;
  setNewIncidentEndDate: any;
  newIncidentEndTime: any;
  setNewIncidentEndTime: any;
  newIncidentIndividuals: any;
  setNewIncidentIndividuals: any;
  newIncidentProgram: any;
  setNewIncidentProgram: any;
  newIncidentInvolvementType: any;
  setNewIncidentInvolvementType: any;
  newIncidentLocation: any;
  setNewIncidentLocation: any;
  newIncidentDescription: any;
  setNewIncidentDescription: any;
  handleCancelCreateIncident: any;
  handleSaveCreateIncident: any;
}

export function LeadDetailCreateIncidentDialog({
  createIncidentDialogOpen,
  setCreateIncidentDialogOpen,
  handleCancelCreateIncident,
}: LeadDetailCreateIncidentDialogProps) {
  const todayIso = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  };

  const [incidentType, setIncidentType] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(todayIso());
  const [endTime, setEndTime] = useState("");
  const [selectedIndividuals, setSelectedIndividuals] =
    useState<string[]>([]);
  const [individualsOpen, setIndividualsOpen] = useState(false);
  const [individualsSearch, setIndividualsSearch] =
    useState("");
  const [program, setProgram] = useState("");
  const [involvementType, setInvolvementType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (createIncidentDialogOpen) {
      setIncidentType("");
      setStartDate(todayIso());
      setStartTime("");
      setEndDate(todayIso());
      setEndTime("");
      setSelectedIndividuals([]);
      setIndividualsOpen(false);
      setIndividualsSearch("");
      setProgram("");
      setInvolvementType("");
      setLocation("");
      setDescription("");
    }
  }, [createIncidentDialogOpen]);

  const filteredIndividuals = INDIVIDUALS.filter((name) =>
    name
      .toLowerCase()
      .includes(individualsSearch.toLowerCase()),
  );

  const individualsDisplayValue = () => {
    if (selectedIndividuals.length === 0) return "";
    if (selectedIndividuals.length <= 2)
      return selectedIndividuals.join(", ");
    return `${selectedIndividuals.slice(0, 2).join(", ")} +${selectedIndividuals.length - 2} more`;
  };

  const handleCreate = () => {
    if (!incidentType) {
      toast.error("Please select an Incident Type.");
      return;
    }
    if (!startDate) {
      toast.error("Please enter a Start Date.");
      return;
    }
    if (!startTime) {
      toast.error("Please enter a Start Time.");
      return;
    }
    if (!endDate) {
      toast.error("Please enter an End Date.");
      return;
    }
    if (!endTime) {
      toast.error("Please enter an End Time.");
      return;
    }
    if (!involvementType) {
      toast.error("Please select an Involvement Type.");
      return;
    }
    toast.success("New incident created successfully.");
    handleCancelCreateIncident();
  };

  const inputBorder = {
    border: "1px solid var(--slds-g-color-border-base-1)",
  };
  const labelStyle = { color: "var(--slds-g-color-text-weak)" };
  const req = <span style={{ color: "#c23934" }}>*</span>;

  return (
    <Dialog
      open={createIncidentDialogOpen}
      onOpenChange={setCreateIncidentDialogOpen}
    >
      <DialogContent
        className="!w-[540px] !max-w-[90vw] flex flex-col gap-0 p-0"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          maxHeight: "90vh",
        }}
      >
        <DialogHeader
          className="px-6 py-4 flex-shrink-0"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <DialogTitle
            className="text-[16px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Create New Incident
          </DialogTitle>
          <DialogDescription
            className="text-[13px]"
            style={labelStyle}
          >
            Enter the incident details below
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
          {/* 1. Incident Type */}
          <div className="space-y-1.5">
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              INCIDENT TYPE {req}
            </Label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full h-9 text-[13px] px-3 rounded"
              style={{
                ...inputBorder,
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: incidentType
                  ? "var(--slds-g-color-text-default)"
                  : "var(--slds-g-color-text-weak)",
              }}
            >
              <option value="">Select incident type</option>
              {INCIDENT_TYPES.map((t) => (
                <option
                  key={t}
                  value={t}
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Start Date / Start Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                className="block text-[12px] font-semibold uppercase tracking-wide"
                style={labelStyle}
              >
                START DATE {req}
              </Label>
              <DateInput
                value={isoToMdy(startDate)}
                onChange={(v) => setStartDate(mdyToIso(v))}
                className="h-9 text-[13px] w-full"
                style={inputBorder}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="block text-[12px] font-semibold uppercase tracking-wide"
                style={labelStyle}
              >
                START TIME {req}
              </Label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-[13px] w-full px-3 rounded"
                style={{
                  ...inputBorder,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
                required
              />
            </div>
          </div>

          {/* 3. End Date / End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                className="block text-[12px] font-semibold uppercase tracking-wide"
                style={labelStyle}
              >
                END DATE {req}
              </Label>
              <DateInput
                value={isoToMdy(endDate)}
                onChange={(v) => setEndDate(mdyToIso(v))}
                className="h-9 text-[13px] w-full"
                style={inputBorder}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="block text-[12px] font-semibold uppercase tracking-wide"
                style={labelStyle}
              >
                END TIME {req}
              </Label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-[13px] w-full px-3 rounded"
                style={{
                  ...inputBorder,
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "var(--slds-g-color-text-default)",
                }}
                required
              />
            </div>
          </div>

          {/* 4. Individuals Involved (multi-select) */}
          <div className="space-y-1.5">
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              INDIVIDUALS INVOLVED
            </Label>
            {/* Portaled popover (ui/popover) so the dialog's scrolling body
                can't clip the list; Radix handles outside-click and Escape. */}
            <Popover
              open={individualsOpen}
              onOpenChange={setIndividualsOpen}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full h-9 flex items-center justify-between px-3 rounded text-[13px] text-left"
                  style={{
                    ...inputBorder,
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    color: selectedIndividuals.length
                      ? "var(--slds-g-color-text-default)"
                      : "var(--slds-g-color-text-weak)",
                  }}
                >
                  <span className="truncate flex-1">
                    {selectedIndividuals.length
                      ? individualsDisplayValue()
                      : "Select individuals"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`flex-shrink-0 ml-2 transition-transform ${individualsOpen ? "rotate-180" : ""}`}
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={4}
                className="w-[var(--radix-popover-trigger-width)] p-0 rounded shadow-lg"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <div
                  className="p-2"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div
                    className="flex items-center gap-2 h-8 px-2 rounded"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <Search
                      size={12}
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                        flexShrink: 0,
                      }}
                    />
                    <input
                      type="text"
                      value={individualsSearch}
                      onChange={(e) =>
                        setIndividualsSearch(e.target.value)
                      }
                      placeholder="Search individuals"
                      className="flex-1 text-[13px] bg-transparent outline-none"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                      autoFocus
                    />
                  </div>
                </div>
                <ul className="py-1 max-h-48 overflow-y-auto">
                  {filteredIndividuals.length === 0 ? (
                    <li
                      className="px-3 py-2 text-[13px]"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      No results found
                    </li>
                  ) : (
                    filteredIndividuals.map((name) => {
                      const checked =
                        selectedIndividuals.includes(name);
                      return (
                        <li key={name}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedIndividuals((prev) =>
                                checked
                                  ? prev.filter(
                                      (n) => n !== name,
                                    )
                                  : [...prev, name],
                              )
                            }
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left hover:bg-gray-50"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            <span
                              className="flex-shrink-0 h-4 w-4 rounded flex items-center justify-center"
                              style={{
                                border: checked
                                  ? "none"
                                  : "1px solid var(--slds-g-color-border-base-1)",
                                backgroundColor: checked
                                  ? "#145F33"
                                  : "transparent",
                              }}
                            >
                              {checked && (
                                <Check
                                  size={10}
                                  color="white"
                                />
                              )}
                            </span>
                            {name}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </PopoverContent>
            </Popover>
          </div>

          {/* 5. Program(s) */}
          <div className="space-y-1.5">
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              PROGRAM(S)
            </Label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full h-9 text-[13px] px-3 rounded"
              style={{
                ...inputBorder,
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: program
                  ? "var(--slds-g-color-text-default)"
                  : "var(--slds-g-color-text-weak)",
              }}
            >
              <option value="">Select program</option>
              {PROGRAMS.map((p) => (
                <option
                  key={p}
                  value={p}
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Involvement Type */}
          <div className="space-y-1.5">
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              INVOLVEMENT TYPE {req}
            </Label>
            <select
              value={involvementType}
              onChange={(e) =>
                setInvolvementType(e.target.value)
              }
              className="w-full h-9 text-[13px] px-3 rounded"
              style={{
                ...inputBorder,
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: involvementType
                  ? "var(--slds-g-color-text-default)"
                  : "var(--slds-g-color-text-weak)",
              }}
            >
              <option value="">Select involvement type</option>
              {INVOLVEMENT_TYPES.map((t) => (
                <option
                  key={t}
                  value={t}
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Location */}
          <div className="space-y-1.5">
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              LOCATION
            </Label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location..."
              className="h-9 text-[13px] w-full px-3 rounded"
              style={{
                ...inputBorder,
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
                outline: "none",
              }}
            />
          </div>

          {/* 8. Description */}
          <div className="space-y-1.5">
            <Label
              className="block text-[12px] font-semibold uppercase tracking-wide"
              style={labelStyle}
            >
              DESCRIPTION
            </Label>
            <textarea
              placeholder="Enter incident description"
              rows={4}
              className="w-full px-3 py-2 text-[13px] rounded resize-none"
              style={{
                ...inputBorder,
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
              }}
            />
          </div>
        </div>

        <DialogFooter
          className="px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <Button
            onClick={handleCancelCreateIncident}
            className="h-9 px-6 text-[13px] font-medium rounded-full"
            style={{
              backgroundColor: "var(--slds-g-color-neutral-95)",
              color: "var(--slds-g-color-text-default)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="h-9 px-6 text-[13px] font-medium rounded-full"
            style={{
              backgroundColor: "#145F33",
              color: "white",
            }}
          >
            Create Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}