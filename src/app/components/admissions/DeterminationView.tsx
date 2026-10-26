import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { DateInput } from "../ui/date-input";
import { DatePicker } from "../ui/date-picker";
import {
  isoToMdy,
  mdyToIso,
  formatMdy,
} from "../../lib/dateFormat";

type DeterminationSubSection =
  "determination" | "notifications";

interface DeterminationViewProps {
  initialSubSection?: DeterminationSubSection;
}

interface ProgramEnrollment {
  id: number;
  moveInDate: string;
  moveOutDate: string;
  program: string;
}

export function DeterminationView({
  initialSubSection = "determination",
}: DeterminationViewProps = {}) {
  const [activeSubSection, setActiveSubSection] =
    useState<DeterminationSubSection>(initialSubSection);

  // Determination state
  const [determinationStatus, setDeterminationStatus] =
    useState("Approved");
  const [determinationDate, setDeterminationDate] =
    useState("2024-12-01");
  const [decidedBy, setDecidedBy] = useState(
    "Dr. Sarah Martinez, LCSW",
  );
  const [determinationNotes, setDeterminationNotes] =
    useState("");
  const [closureReason, setClosureReason] = useState("");
  const [otherClosureReason, setOtherClosureReason] =
    useState("");

  // Program Enrollment state
  const [programEnrollments, setProgramEnrollments] = useState<
    ProgramEnrollment[]
  >([]);
  const [showEnrollmentModal, setShowEnrollmentModal] =
    useState(false);
  const [editingEnrollment, setEditingEnrollment] =
    useState<ProgramEnrollment | null>(null);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    moveInDate: "",
    startTime: "12:00 AM",
    moveOutDate: "",
    endTime: "12:00 AM",
    program: "",
  });

  // Case Manager Recommendations state
  const [recommendClinical, setRecommendClinical] =
    useState<string>("");
  // Local "today" as YYYY-MM-DD (toISOString() is UTC: tomorrow on US evenings).
  const [recommendationDate, setRecommendationDate] = useState(
    () => mdyToIso(formatMdy(new Date())),
  );
  const [youthMotivated, setYouthMotivated] =
    useState<string>("");
  const [responseDate, setResponseDate] = useState("");

  // Referrals state
  interface ReferralReason {
    id: number;
    value: string;
  }

  interface Referral {
    id: number;
    date: string;
    type: "Constituent" | "Non-Constituent";
    referredOutTo: string;
    contactAtAgency: string;
    dateNotified: string;
    staffName: string;
    referred: "Youth" | "Family" | "";
    referralReasons: ReferralReason[];
  }

  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: 1,
      date: "2024-11-15",
      type: "Constituent",
      referredOutTo: "Community Mental Health Center",
      contactAtAgency: "",
      dateNotified: "2024-11-16",
      staffName: "Sarah Johnson",
      referred: "Youth",
      referralReasons: [
        {
          id: 1,
          value:
            "Youth needs more structure than is available in this setting",
        },
      ],
    },
  ]);

  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc"
  >("asc");
  const [referralDialogOpen, setReferralDialogOpen] =
    useState(false);
  const [referralDialogMode, setReferralDialogMode] = useState<
    "add" | "edit" | "view"
  >("add");
  const [deleteConfirmOpen, setDeleteConfirmOpen] =
    useState(false);
  const [deleteReferralId, setDeleteReferralId] = useState<
    number | null
  >(null);

  const [referralFormData, setReferralFormData] = useState<
    Partial<Referral>
  >({
    date: new Date().toISOString().split("T")[0],
    type: "Constituent",
    referredOutTo: "",
    contactAtAgency: "",
    dateNotified: "",
    staffName: "",
    referred: "",
    referralReasons: [],
  });

  // Referral Reasons Management
  const [reasonDialogOpen, setReasonDialogOpen] =
    useState(false);
  const [newReasonValue, setNewReasonValue] = useState("");

  const availableReasons = [
    "Agency Decision, File Review",
    "Youth needs more structure than is available in this setting",
    "Youth needs less structure than is available in this setting",
    "Youth needs to attend to other primary treatment first",
    "Youth cannot attend community schools available",
    "Youth lacks interest in residential treatment",
    "Family lacks interest in residential treatment",
    "Youth lacks motivation to work on treatment issues",
    "Family lacks motivation to work on treatment issues",
    "Other",
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedReferrals = [...referrals].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any = "";
    let bValue: any = "";

    if (sortColumn === "date") {
      aValue = a.date;
      bValue = b.date;
    } else if (sortColumn === "staffName") {
      aValue = a.staffName;
      bValue = b.staffName;
    } else if (sortColumn === "agency") {
      aValue = a.referredOutTo;
      bValue = b.referredOutTo;
    } else if (sortColumn === "referred") {
      aValue = a.referred;
      bValue = b.referred;
    }

    if (aValue < bValue)
      return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue)
      return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleOpenReferralDialog = (
    mode: "add" | "edit" | "view",
    referral?: Referral,
  ) => {
    setReferralDialogMode(mode);
    if (referral) {
      setReferralFormData(referral);
    } else {
      setReferralFormData({
        date: new Date().toISOString().split("T")[0],
        type: "Constituent",
        referredOutTo: "",
        contactAtAgency: "",
        dateNotified: "",
        staffName: "",
        referred: "",
        referralReasons: [],
      });
    }
    setReferralDialogOpen(true);
  };

  const handleSaveReferral = () => {
    // Validation
    if (
      !referralFormData.date ||
      !referralFormData.type ||
      !referralFormData.referredOutTo ||
      !referralFormData.referred
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (referralDialogMode === "add") {
      const newReferral: Referral = {
        id: referrals.length + 1,
        ...(referralFormData as Referral),
      };
      setReferrals([...referrals, newReferral]);
      toast.success("Referral added successfully");
    } else if (referralDialogMode === "edit") {
      setReferrals(
        referrals.map((r) =>
          r.id === referralFormData.id
            ? { ...(referralFormData as Referral) }
            : r,
        ),
      );
      toast.success("Referral updated successfully");
    }

    setReferralDialogOpen(false);
  };

  // Program Enrollment Handlers
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    // Parse as UTC to prevent day-prior bug
    const date = new Date(dateString + "T00:00:00Z");
    return formatMdy(date);
  };

  const getAvailableBeds = (programName: string): number => {
    // Reusing the same logic as Case Details - hardcoded to 2 for now
    return programName ? 2 : 0;
  };

  const handleOpenEnrollmentModal = (
    enrollment?: ProgramEnrollment,
  ) => {
    if (enrollment) {
      setEditingEnrollment(enrollment);
      setEnrollmentFormData({
        moveInDate: enrollment.moveInDate,
        moveOutDate: enrollment.moveOutDate,
        program: enrollment.program,
      });
    } else {
      setEditingEnrollment(null);
      setEnrollmentFormData({
        moveInDate: "",
        moveOutDate: "",
        program: "",
      });
    }
    setShowEnrollmentModal(true);
  };

  const handleSaveEnrollment = () => {
    // Validation
    if (
      !enrollmentFormData.moveInDate ||
      !enrollmentFormData.program
    ) {
      toast.error("Please fill in Move In Date and Program");
      return;
    }

    if (editingEnrollment) {
      // Update existing enrollment
      setProgramEnrollments(
        programEnrollments.map((e) =>
          e.id === editingEnrollment.id
            ? { ...editingEnrollment, ...enrollmentFormData }
            : e,
        ),
      );
      toast.success("Program Enrollment updated successfully");
    } else {
      // Add new enrollment
      const newEnrollment: ProgramEnrollment = {
        id: programEnrollments.length + 1,
        ...enrollmentFormData,
      };
      setProgramEnrollments([
        ...programEnrollments,
        newEnrollment,
      ]);
      toast.success("Program Enrollment added successfully");
    }

    setShowEnrollmentModal(false);
  };

  const handleDeleteEnrollment = (id: number) => {
    setProgramEnrollments(
      programEnrollments.filter((e) => e.id !== id),
    );
    toast.success("Program Enrollment deleted successfully");
  };

  const handleDeleteReferralConfirm = () => {
    if (deleteReferralId !== null) {
      setReferrals(
        referrals.filter((r) => r.id !== deleteReferralId),
      );
      toast.success("Referral deleted successfully");
      setDeleteConfirmOpen(false);
      setDeleteReferralId(null);
    }
  };

  const handleAddReason = () => {
    if (newReasonValue) {
      const newReason: ReferralReason = {
        id: (referralFormData.referralReasons?.length || 0) + 1,
        value: newReasonValue,
      };
      setReferralFormData({
        ...referralFormData,
        referralReasons: [
          ...(referralFormData.referralReasons || []),
          newReason,
        ],
      });
      setNewReasonValue("");
      setReasonDialogOpen(false);
    }
  };

  const handleRemoveReason = (reasonId: number) => {
    setReferralFormData({
      ...referralFormData,
      referralReasons:
        referralFormData.referralReasons?.filter(
          (r) => r.id !== reasonId,
        ) || [],
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Horizontal Navigation Tabs */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <div
          className="flex overflow-x-auto overflow-y-hidden border-b"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <button
            onClick={() => setActiveSubSection("determination")}
            className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
              activeSubSection === "determination"
                ? "text-[#145F33]"
                : "text-[#706e6b] hover:text-[#080707]"
            }`}
            style={
              activeSubSection === "determination"
                ? {
                    borderBottom: "3px solid #145F33",
                    marginBottom: "-1px",
                  }
                : {}
            }
          >
            Determination
          </button>
          <button
            onClick={() => setActiveSubSection("notifications")}
            className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
              activeSubSection === "notifications"
                ? "text-[#145F33]"
                : "text-[#706e6b] hover:text-[#080707]"
            }`}
            style={
              activeSubSection === "notifications"
                ? {
                    borderBottom: "3px solid #145F33",
                    marginBottom: "-1px",
                  }
                : {}
            }
          >
            Referrals
          </button>
        </div>

        <div className="p-3 sm:p-6">
          {/* Determination Tab Content */}
          {activeSubSection === "determination" && (
            <div className="space-y-4">
              {/* Case Manager Recommendations Section */}
              <div>
                <h4
                  className="text-[13px] font-semibold mb-4 pb-2"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Case Manager Recommendations
                </h4>

                <div className="space-y-4">
                  {/* Do you recommend this youth for a Clinical Assessment? */}
                  <div>
                    <Label
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Do you recommend this constituent for a
                      Clinical Assessment?
                    </Label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recommend-clinical-assessment"
                          value="yes"
                          checked={recommendClinical === "yes"}
                          onChange={(e) =>
                            setRecommendClinical(e.target.value)
                          }
                          className="w-4 h-4 cursor-pointer accent-[#145F33]"
                          style={{
                            accentColor: "#145F33",
                          }}
                        />
                        <span
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recommend-clinical-assessment"
                          value="no"
                          checked={recommendClinical === "no"}
                          onChange={(e) =>
                            setRecommendClinical(e.target.value)
                          }
                          className="w-4 h-4 cursor-pointer accent-[#145F33]"
                          style={{
                            accentColor: "#145F33",
                          }}
                        />
                        <span
                          className="text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          No
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Date of Recommendation */}
                  <div>
                    <Label
                      htmlFor="recommendation-date"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Date of Recommendation
                    </Label>
                    {/* Shared DatePicker: the whole field opens the calendar,
                                            shows MM/DD/YYYY, and emits the ISO value this
                                            state already stores. */}
                    <DatePicker
                      id="recommendation-date"
                      value={recommendationDate}
                      onChange={setRecommendationDate}
                      placeholder="MM/DD/YYYY"
                      className="max-w-[240px]"
                    />
                  </div>

                  {/* Rationale */}
                  <div>
                    <Label
                      htmlFor="recommendation-rationale"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Rationale:
                    </Label>
                    <Textarea
                      id="recommendation-rationale"
                      className="text-[13px] rounded min-h-[120px]"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                      placeholder="Enter rationale for your recommendation..."
                    />
                  </div>

                  {/* Is the Youth Motivated - conditional on Yes */}
                  {recommendClinical === "yes" && (
                    <div>
                      <Label
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Is the Youth Motivated to continue the
                        Admissions Process?
                      </Label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="youth-motivated"
                            value="yes"
                            checked={youthMotivated === "yes"}
                            onChange={(e) =>
                              setYouthMotivated(e.target.value)
                            }
                            className="w-4 h-4 cursor-pointer accent-[#145F33]"
                            style={{
                              accentColor: "#145F33",
                            }}
                          />
                          <span
                            className="text-[13px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            Yes
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="youth-motivated"
                            value="no"
                            checked={youthMotivated === "no"}
                            onChange={(e) =>
                              setYouthMotivated(e.target.value)
                            }
                            className="w-4 h-4 cursor-pointer accent-[#145F33]"
                            style={{
                              accentColor: "#145F33",
                            }}
                          />
                          <span
                            className="text-[13px]"
                            style={{
                              color:
                                "var(--slds-g-color-text-default)",
                            }}
                          >
                            No
                          </span>
                        </label>
                      </div>
                      {/* Date of Response */}
                      <div className="mt-4">
                        <Label
                          htmlFor="response-date"
                          className="block text-[12px] font-semibold mb-1.5 uppercase"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Date of Response
                        </Label>
                        <DateInput
                          id="response-date"
                          value={isoToMdy(responseDate)}
                          onChange={(v) =>
                            ((e) =>
                              setResponseDate(e.target.value))({
                              target: { value: mdyToIso(v) },
                            })
                          }
                          className="h-9 text-[13px] max-w-[240px]"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Determination Section */}
              <div>
                <h4
                  className="text-[13px] font-semibold mb-4 pb-2"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Determination
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Determination Date */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="determinationDate"
                      className="text-[13px] font-medium text-[#080707]"
                    >
                      Determination Date{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="determinationDate"
                      value={determinationDate}
                      onChange={(e) =>
                        setDeterminationDate(e.target.value)
                      }
                      placeholder="MM/DD/YYYY"
                      className="h-9 text-[13px]"
                      style={{
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                    />
                  </div>

                  {/* Determination */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="determinationStatus"
                      className="text-[13px] font-medium text-[#080707]"
                    >
                      Determined By{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={determinationStatus}
                      onValueChange={setDeterminationStatus}
                    >
                      <SelectTrigger
                        id="determinationStatus"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved">
                          Approved
                        </SelectItem>
                        <SelectItem value="Accepted">
                          Accepted
                        </SelectItem>
                        <SelectItem value="Denied">
                          Denied
                        </SelectItem>
                        <SelectItem value="Closed">
                          Closed
                        </SelectItem>
                        <SelectItem value="Other">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Determined By */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label
                      htmlFor="decidedBy"
                      className="text-[13px] font-medium text-[#080707]"
                    >
                      Determined By{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="decidedBy"
                      value={decidedBy}
                      onChange={(e) =>
                        setDecidedBy(e.target.value)
                      }
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        borderColor:
                          "var(--slds-g-color-border-base-1)",
                      }}
                      placeholder="Enter decision maker name"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="determinationNotes"
                    className="text-[13px] font-medium text-[#080707]"
                  >
                    Summary{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="determinationNotes"
                    value={determinationNotes}
                    onChange={(e) =>
                      setDeterminationNotes(e.target.value)
                    }
                    className="min-h-[150px] text-[13px] rounded resize-y"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                    placeholder="Enter summary..."
                  />
                </div>

                {/* Program Enrollment Section - Only show when Determination is "Accepted" */}
                {determinationStatus === "Accepted" && (
                  <div
                    className="pt-6 mt-6"
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div
                      className="overflow-hidden rounded"
                      style={{
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <div
                        className="px-4 py-3 flex items-center justify-between"
                        style={{
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor:
                            "var(--slds-g-color-background-alt)",
                        }}
                      >
                        <h4 className="text-[13px] font-semibold text-[#080707]">
                          Program Enrollment
                        </h4>
                        <Button
                          size="sm"
                          className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                          onClick={() =>
                            handleOpenEnrollmentModal()
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New Program Enrollment
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                          <thead>
                            <tr
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                              }}
                            >
                              <th
                                className="px-4 py-2 text-left text-[12px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Move In Date
                              </th>
                              <th
                                className="px-4 py-2 text-left text-[12px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Move Out Date
                              </th>
                              <th
                                className="px-4 py-2 text-left text-[12px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Program
                              </th>
                              <th
                                className="px-4 py-2 text-left text-[12px] font-semibold"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Available Beds
                              </th>
                              <th
                                className="px-4 py-2 text-left text-[12px] font-semibold w-20"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                  borderBottom:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {programEnrollments.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-4 py-8 text-center text-[13px]"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-weak)",
                                  }}
                                >
                                  No program enrollments yet.
                                  Click "New Program Enrollment"
                                  to add one.
                                </td>
                              </tr>
                            ) : (
                              programEnrollments.map(
                                (enrollment) => (
                                  <tr
                                    key={enrollment.id}
                                    style={{
                                      borderBottom:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <td
                                      className="px-4 py-3 text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {formatDateForDisplay(
                                        enrollment.moveInDate,
                                      )}
                                    </td>
                                    <td
                                      className="px-4 py-3 text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {enrollment.moveOutDate
                                        ? formatDateForDisplay(
                                            enrollment.moveOutDate,
                                          )
                                        : "—"}
                                    </td>
                                    <td
                                      className="px-4 py-3 text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {enrollment.program}
                                    </td>
                                    <td
                                      className="px-4 py-3 text-[13px]"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {getAvailableBeds(
                                        enrollment.program,
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() =>
                                            handleOpenEnrollmentModal(
                                              enrollment,
                                            )
                                          }
                                          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                          title="Edit"
                                        >
                                          <Pencil className="h-3.5 w-3.5 text-[#706e6b]" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteEnrollment(
                                              enrollment.id,
                                            )
                                          }
                                          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ),
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Closure Reasons - Only show when Determination is "Other" */}
                {determinationStatus === "Other" &&
                  determinationDate && (
                    <div className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="closureReason"
                          className="text-[13px] font-medium text-[#080707]"
                        >
                          Closure Reasons{" "}
                          <span className="text-red-600">
                            *
                          </span>
                        </Label>
                        <Select
                          value={closureReason}
                          onValueChange={setClosureReason}
                        >
                          <SelectTrigger
                            id="closureReason"
                            className="h-9 text-[13px] rounded"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <SelectValue placeholder="Select closure reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Agency Decision">
                              Agency Decision
                            </SelectItem>
                            <SelectItem value="File Review">
                              File Review
                            </SelectItem>
                            <SelectItem value="Youth needs more structure than is available in this setting">
                              Youth needs more structure than is
                              available in this setting
                            </SelectItem>
                            <SelectItem value="Youth needs less structure than is available in this setting">
                              Youth needs less structure than is
                              available in this setting
                            </SelectItem>
                            <SelectItem value="Youth needs to attend to other primary treatment first">
                              Youth needs to attend to other
                              primary treatment first
                            </SelectItem>
                            <SelectItem value="Youth cannot attend community schools available">
                              Youth cannot attend community
                              schools available
                            </SelectItem>
                            <SelectItem value="Youth lacks interest in residential treatment">
                              Youth lacks interest in
                              residential treatment
                            </SelectItem>
                            <SelectItem value="Family lacks interest in residential treatment">
                              Family lacks interest in
                              residential treatment
                            </SelectItem>
                            <SelectItem value="Youth lacks motivation to work on treatment issues">
                              Youth lacks motivation to work on
                              treatment issues
                            </SelectItem>
                            <SelectItem value="Family lacks motivation to work on treatment issues">
                              Family lacks motivation to work on
                              treatment issues
                            </SelectItem>
                            <SelectItem value="Other">
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Conditional Other Closure Reason Text Input */}
                      {closureReason === "Other" && (
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="otherClosureReason"
                            className="text-[13px] font-medium text-[#080707]"
                          >
                            Other Closure Reason{" "}
                            <span className="text-red-600">
                              *
                            </span>
                          </Label>
                          <Textarea
                            id="otherClosureReason"
                            value={otherClosureReason}
                            onChange={(e) =>
                              setOtherClosureReason(
                                e.target.value,
                              )
                            }
                            className="min-h-[100px] text-[13px] rounded resize-y"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              borderColor:
                                "var(--slds-g-color-border-base-1)",
                            }}
                            placeholder="Please specify the closure reason..."
                          />
                        </div>
                      )}
                    </div>
                  )}

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    className="h-9 px-4 rounded-full text-[13px]"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    Save Determination
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications & Referrals Tab Content */}
          {activeSubSection === "notifications" && (
            <div className="space-y-6">
              {/* Referrals Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[13px] font-semibold text-[#080707]">
                    Referrals
                  </h3>
                  <Button
                    onClick={() =>
                      handleOpenReferralDialog("add")
                    }
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    Add Referral
                  </Button>
                </div>

                {/* Referrals Table */}
                <div
                  className="rounded overflow-hidden"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <button
                              className="flex items-center gap-1 hover:text-[#145F33]"
                              onClick={() => handleSort("date")}
                            >
                              Date
                              {sortColumn === "date" &&
                                (sortDirection === "asc" ? (
                                  <ArrowUp
                                    className="h-3 w-3"
                                    style={{ color: "#145F33" }}
                                  />
                                ) : (
                                  <ArrowDown
                                    className="h-3 w-3"
                                    style={{ color: "#145F33" }}
                                  />
                                ))}
                            </button>
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <button
                              className="flex items-center gap-1 hover:text-[#145F33]"
                              onClick={() =>
                                handleSort("staffName")
                              }
                            >
                              Staff Name
                              {sortColumn === "staffName" &&
                                (sortDirection === "asc" ? (
                                  <ArrowUp
                                    className="h-3 w-3"
                                    style={{ color: "#145F33" }}
                                  />
                                ) : (
                                  <ArrowDown
                                    className="h-3 w-3"
                                    style={{ color: "#145F33" }}
                                  />
                                ))}
                            </button>
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <button
                              className="flex items-center gap-1 hover:text-[#145F33]"
                              onClick={() =>
                                handleSort("agency")
                              }
                            >
                              Agency
                              {sortColumn === "agency" &&
                                (sortDirection === "asc" ? (
                                  <ArrowUp
                                    className="h-3 w-3"
                                    style={{ color: "#145F33" }}
                                  />
                                ) : (
                                  <ArrowDown
                                    className="h-3 w-3"
                                    style={{ color: "#145F33" }}
                                  />
                                ))}
                            </button>
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <button
                              className="flex items-center gap-1 hover:text-[#145F33]"
                              onClick={() =>
                                handleSort("referred")
                              }
                            >
                              Referred
                              {sortColumn === "referred" &&
                                (sortDirection === "asc" ? (
                                  <ArrowUp
                                    className="h-3 w-3"
                                    style={{ color: "#145F33" }}
                                  />
                                ) : (
                                  <ArrowDown
                                    className="h-3 w-3"
                                    style={{ color: "#145F33" }}
                                  />
                                ))}
                            </button>
                          </th>
                          <th
                            className="px-3 py-2 text-right font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedReferrals.map(
                          (referral, index) => (
                            <tr
                              key={referral.id}
                              style={{
                                borderBottom:
                                  index <
                                  sortedReferrals.length - 1
                                    ? "1px solid var(--slds-g-color-border-base-1)"
                                    : "none",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <td className="px-3 py-3 text-[#080707]">
                                {referral.date}
                              </td>
                              <td className="px-3 py-3 text-[#080707]">
                                {referral.staffName || "—"}
                              </td>
                              <td className="px-3 py-3 text-[#080707]">
                                {referral.referredOutTo}
                              </td>
                              <td className="px-3 py-3 text-[#080707]">
                                {referral.referred}
                              </td>
                              <td className="px-3 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="text-[#0176d3] hover:text-[#014486] p-1"
                                    onClick={() =>
                                      handleOpenReferralDialog(
                                        "view",
                                        referral,
                                      )
                                    }
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    className="text-[#0176d3] hover:text-[#014486] p-1"
                                    onClick={() =>
                                      handleOpenReferralDialog(
                                        "edit",
                                        referral,
                                      )
                                    }
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                    onClick={() => {
                                      setDeleteReferralId(
                                        referral.id,
                                      );
                                      setDeleteConfirmOpen(
                                        true,
                                      );
                                    }}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Dialog */}
      <Dialog
        open={referralDialogOpen}
        onOpenChange={setReferralDialogOpen}
      >
        <DialogContent className="p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {referralDialogMode === "add"
                ? "Add Referral"
                : referralDialogMode === "edit"
                  ? "Edit Referral"
                  : "View Referral"}
            </DialogTitle>
            <DialogDescription>
              {referralDialogMode === "add"
                ? "Add a new referral for the constituent."
                : referralDialogMode === "edit"
                  ? "Edit the selected referral."
                  : "View referral details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Date - Required */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="referralDate"
                  className="text-[11px] font-medium text-[#080707]"
                >
                  Date <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="referralDate"
                  value={referralFormData.date}
                  onChange={(e) =>
                    setReferralFormData({
                      ...referralFormData,
                      date: e.target.value,
                    })
                  }
                  placeholder="MM/DD/YYYY"
                  className="h-8 text-[13px]"
                  disabled={referralDialogMode === "view"}
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>

              {/* Type - Required */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="referralType"
                  className="text-[11px] font-medium text-[#080707]"
                >
                  Type <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={referralFormData.type}
                  onValueChange={(
                    value: "Constituent" | "Non-Constituent",
                  ) =>
                    setReferralFormData({
                      ...referralFormData,
                      type: value,
                    })
                  }
                  disabled={referralDialogMode === "view"}
                >
                  <SelectTrigger
                    id="referralType"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Constituent">
                      Constituent
                    </SelectItem>
                    <SelectItem value="Non-Constituent">
                      Non-Constituent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Referred Out To - Required, conditional input type */}
              <div className="space-y-1.5 md:col-span-2">
                <Label
                  htmlFor="referralOutTo"
                  className="text-[11px] font-medium text-[#080707]"
                >
                  Referred Out To{" "}
                  <span className="text-red-600">*</span>
                  {referralFormData.type === "Constituent" && (
                    <span className="text-[10px] text-[#706e6b] ml-1">
                      (Account Lookup)
                    </span>
                  )}
                </Label>
                <Input
                  id="referralOutTo"
                  value={referralFormData.referredOutTo}
                  onChange={(e) =>
                    setReferralFormData({
                      ...referralFormData,
                      referredOutTo: e.target.value,
                    })
                  }
                  className="h-8 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                  placeholder={
                    referralFormData.type === "Constituent"
                      ? "Search accounts..."
                      : "Enter agency name"
                  }
                  disabled={referralDialogMode === "view"}
                />
              </div>

              {/* Contact at Agency - Optional, only visible for Non-Constituent */}
              {referralFormData.type === "Non-Constituent" && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label
                    htmlFor="referralContactAtAgency"
                    className="text-[11px] font-medium text-[#080707]"
                  >
                    Contact at Agency
                  </Label>
                  <Input
                    id="referralContactAtAgency"
                    value={referralFormData.contactAtAgency}
                    onChange={(e) =>
                      setReferralFormData({
                        ...referralFormData,
                        contactAtAgency: e.target.value,
                      })
                    }
                    className="h-8 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                    placeholder="Enter contact name"
                    disabled={referralDialogMode === "view"}
                  />
                </div>
              )}

              {/* Date Referring Agency Notified - Optional */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="referralDateNotified"
                  className="text-[11px] font-medium text-[#080707]"
                >
                  Date Referring Agency Notified
                </Label>
                <Input
                  id="referralDateNotified"
                  value={referralFormData.dateNotified}
                  onChange={(e) =>
                    setReferralFormData({
                      ...referralFormData,
                      dateNotified: e.target.value,
                    })
                  }
                  placeholder="MM/DD/YYYY"
                  className="h-8 text-[13px]"
                  disabled={referralDialogMode === "view"}
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>

              {/* Staff Name - Optional */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="referralStaffName"
                  className="text-[11px] font-medium text-[#080707]"
                >
                  Staff Name{" "}
                  <span className="text-[10px] text-[#706e6b]">
                    (Lookup)
                  </span>
                </Label>
                <Input
                  id="referralStaffName"
                  value={referralFormData.staffName}
                  onChange={(e) =>
                    setReferralFormData({
                      ...referralFormData,
                      staffName: e.target.value,
                    })
                  }
                  className="h-8 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                  placeholder="Search staff..."
                  disabled={referralDialogMode === "view"}
                />
              </div>

              {/* Referred - Required */}
              <div className="space-y-1.5 md:col-span-2">
                <Label
                  htmlFor="referralReferred"
                  className="text-[11px] font-medium text-[#080707]"
                >
                  Referred{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={referralFormData.referred}
                  onValueChange={(
                    value: "Youth" | "Family" | "",
                  ) =>
                    setReferralFormData({
                      ...referralFormData,
                      referred: value,
                    })
                  }
                  disabled={referralDialogMode === "view"}
                >
                  <SelectTrigger
                    id="referralReferred"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      borderColor:
                        "var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <SelectValue placeholder="Select referred" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Youth">Youth</SelectItem>
                    <SelectItem value="Family">
                      Family
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Referral Reasons - Multi-select */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[11px] font-medium text-[#080707]">
                  Referral Reasons
                </Label>

                {referralDialogMode !== "view" && (
                  <Button
                    onClick={() => setReasonDialogOpen(true)}
                    className="h-8 px-3 rounded-full text-[13px] w-full"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Reason
                  </Button>
                )}

                {/* List of added reasons */}
                <div className="space-y-1">
                  {referralFormData.referralReasons &&
                  referralFormData.referralReasons.length >
                    0 ? (
                    referralFormData.referralReasons.map(
                      (reason) => (
                        <div
                          key={reason.id}
                          className="flex items-center justify-between p-2 rounded"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <span className="text-[13px] text-[#080707]">
                            {reason.value}
                          </span>
                          {referralDialogMode !== "view" && (
                            <button
                              className="text-[#c23934] hover:text-[#8a2a27] p-1"
                              onClick={() =>
                                handleRemoveReason(reason.id)
                              }
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-[11px] text-[#706e6b] italic">
                      No reasons added
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            {referralDialogMode !== "view" && (
              <Button
                onClick={handleSaveReferral}
                className="h-9 px-4 rounded-full text-[13px]"
                style={{
                  backgroundColor: "#145F33",
                  color: "white",
                }}
              >
                {referralDialogMode === "add"
                  ? "Add Referral"
                  : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Reason Dialog */}
      <Dialog
        open={reasonDialogOpen}
        onOpenChange={setReasonDialogOpen}
      >
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Add Referral Reason</DialogTitle>
            <DialogDescription>
              Select a reason for the referral from the list
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="newReasonValue"
                className="text-[11px] font-medium text-[#080707]"
              >
                Reason <span className="text-red-600">*</span>
              </Label>
              <Select
                value={newReasonValue}
                onValueChange={setNewReasonValue}
              >
                <SelectTrigger
                  id="newReasonValue"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {availableReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setReasonDialogOpen(false)}
              variant="outline"
              className="h-9 px-4 rounded-full text-[13px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddReason}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Add Reason
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
      >
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this referral?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              variant="outline"
              className="h-9 px-4 rounded-full text-[13px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteReferralConfirm}
              className="h-9 px-4 rounded-full text-[13px]"
              style={{
                backgroundColor: "#c23934",
                color: "white",
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Program Enrollment Modal */}
      <Dialog
        open={showEnrollmentModal}
        onOpenChange={setShowEnrollmentModal}
      >
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {editingEnrollment
                ? "Edit Program Enrollment"
                : "New Program Enrollment"}
            </DialogTitle>
            <DialogDescription
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {editingEnrollment
                ? "Update the program enrollment details below."
                : "Add a new program enrollment record."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Row 1: Move In Date + Start Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="moveInDate"
                  className="text-[13px] font-medium text-[#080707]"
                >
                  Move In Date{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <DateInput
                  id="moveInDate"
                  value={isoToMdy(
                    enrollmentFormData.moveInDate,
                  )}
                  onChange={(v) =>
                    ((e) =>
                      setEnrollmentFormData({
                        ...enrollmentFormData,
                        moveInDate: e.target.value,
                      }))({ target: { value: mdyToIso(v) } })
                  }
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="startTime"
                  className="text-[13px] font-medium text-[#080707]"
                >
                  Start Time
                </Label>
                <select
                  id="startTime"
                  value={enrollmentFormData.startTime}
                  onChange={(e) =>
                    setEnrollmentFormData({
                      ...enrollmentFormData,
                      startTime: e.target.value,
                    })
                  }
                  className="h-9 w-full px-3 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {Array.from({ length: 24 }, (_, h) =>
                    [0, 30].map((m) => {
                      const hour12 = h % 12 === 0 ? 12 : h % 12;
                      const ampm = h < 12 ? "AM" : "PM";
                      const label = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
                      return (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      );
                    }),
                  )}
                </select>
              </div>
            </div>

            {/* Row 2: Move Out Date + End Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="moveOutDate"
                  className="text-[13px] font-medium text-[#080707]"
                >
                  Move Out Date
                </Label>
                <DateInput
                  id="moveOutDate"
                  value={isoToMdy(
                    enrollmentFormData.moveOutDate,
                  )}
                  onChange={(v) =>
                    ((e) =>
                      setEnrollmentFormData({
                        ...enrollmentFormData,
                        moveOutDate: e.target.value,
                      }))({ target: { value: mdyToIso(v) } })
                  }
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="endTime"
                  className="text-[13px] font-medium text-[#080707]"
                >
                  End Time
                </Label>
                <select
                  id="endTime"
                  value={enrollmentFormData.endTime}
                  onChange={(e) =>
                    setEnrollmentFormData({
                      ...enrollmentFormData,
                      endTime: e.target.value,
                    })
                  }
                  className="h-9 w-full px-3 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {Array.from({ length: 24 }, (_, h) =>
                    [0, 30].map((m) => {
                      const hour12 = h % 12 === 0 ? 12 : h % 12;
                      const ampm = h < 12 ? "AM" : "PM";
                      const label = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
                      return (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      );
                    }),
                  )}
                </select>
              </div>
            </div>

            {/* Program */}
            <div className="space-y-1.5">
              <Label
                htmlFor="program"
                className="text-[13px] font-medium text-[#080707]"
              >
                Program <span className="text-red-600">*</span>
              </Label>
              <Select
                value={enrollmentFormData.program}
                onValueChange={(value) =>
                  setEnrollmentFormData({
                    ...enrollmentFormData,
                    program: value,
                  })
                }
              >
                <SelectTrigger
                  id="program"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                  }}
                >
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Program #2">
                    A Program #2
                  </SelectItem>
                  <SelectItem value="Bernardin">
                    Bernardin
                  </SelectItem>
                  <SelectItem value="Bosco">Bosco</SelectItem>
                  <SelectItem value="Campbell">
                    Campbell
                  </SelectItem>
                  <SelectItem value="Cooke">Cooke</SelectItem>
                  <SelectItem value="Couderc">
                    Couderc
                  </SelectItem>
                  <SelectItem value="Daley">Daley</SelectItem>
                  <SelectItem value="Kelly">Kelly</SelectItem>
                  <SelectItem value="Mahoney">
                    Mahoney
                  </SelectItem>
                  <SelectItem value="Noha">Noha</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Quille">Quille</SelectItem>
                  <SelectItem value="Self-Awareness">
                    Self-Awareness
                  </SelectItem>
                  <SelectItem value="Seton">Seton</SelectItem>
                  <SelectItem value="Shell">Shell</SelectItem>
                  <SelectItem value="Speh">Speh</SelectItem>
                  <SelectItem value="Walgreen">
                    Walgreen
                  </SelectItem>
                </SelectContent>
              </Select>
              {enrollmentFormData.program && (
                <span className="text-[11px] text-[#706e6b] mt-1 block">
                  Available Beds:{" "}
                  {getAvailableBeds(enrollmentFormData.program)}
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEnrollmentModal(false)}
              className="h-9 px-4 rounded-full text-[13px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEnrollment}
              className="h-9 px-4 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
            >
              {editingEnrollment ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}