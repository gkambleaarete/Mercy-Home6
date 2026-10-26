import { useState, useMemo, useEffect, useRef } from "react";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import {
  ChevronRight,
  Plus,
  User,
  Users,
  Building2,
  Phone,
  Mail,
  CheckSquare,
  Upload,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  Pencil,
  Trash2,
  ChevronDown,
  FileText,
  ChevronUp,
  Check,
  X as XIcon,
  ChevronUp as ArrowUp,
  ChevronDown as ArrowDown,
  MoreVertical,
  Download,
  Eye,
  File,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { IncidentDetailsDialog } from "../dialogs/IncidentDetailsDialog";
import {
  LegalInvolvementDialog,
  LegalInvolvementRecord,
} from "../dialogs/LegalInvolvementDialog";
import {
  DCFSInvolvementDialog,
  DCFSInvolvementRecord,
} from "../dialogs/DCFSInvolvementDialog";
import { MedicationsTabContent } from "./MedicationsTabContent";
import { MedicationsSection } from "./MedicationsSection";
import { PsychosocialFactorsSection } from "./PsychosocialFactorsSection";
import { RiskFactorsSection } from "./RiskFactorsSection";
import { BiologicalHistorySection } from "./BiologicalHistorySection";
import { SocialHistorySection } from "./SocialHistorySection";
import { FamilyHistorySection } from "./FamilyHistorySection";
import { LegalHistorySection } from "./LegalHistorySection";
import { PhysicalHealthSection } from "./PhysicalHealthSection";
import { MentalHealthSection } from "./MentalHealthSection";
import { MentalStatusExamSection } from "./MentalStatusExamSection";
import { SubstanceUseSection } from "./SubstanceUseSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { ConstituentDetailsSection } from "./ConstituentDetailsSection";
import { CPIEligibilitySection } from "./CPIEligibilitySection";
import { RelationshipsSection } from "./RelationshipsSection";
import { ConnectionsSection } from "./ConnectionsSection";
import { DocumentsSection } from "./DocumentsSection";
import { ContactLogDialogSLDS } from "../ContactLogDialogSLDS";
import { CreateInfoSessionDialog } from "./CreateInfoSessionDialog";
import { CreateClinicalAssessmentDialog } from "./CreateClinicalAssessmentDialog";
import { CreateAdmissionsShadowDialog } from "./CreateAdmissionsShadowDialog";
import { CreateFamilyPartnershipMeetingDialog } from "./CreateFamilyPartnershipMeetingDialog";
import { ClinicalAssessmentsView } from "./ClinicalAssessmentsView";
import { EducationCareerView } from "./EducationCareerView";
import { DeterminationView } from "./DeterminationView";
import { TreatmentPlanningView } from "./TreatmentPlanningView";
import { NeedsTabContent } from "./NeedsTabContent";
import { RichTextEditor } from "../ui/rich-text-editor";
import { StageProgressData } from "./StageProgressData";
import { SubstanceUseTestingModals } from "./SubstanceUseTestingModals";
import { AdditionalDocumentation } from "./AdditionalDocumentation";
import {
  ActivityTimeline,
  TimelineActivity,
} from "../ActivityTimeline";
import { CaseyLifeSkillsCaregiverFields } from "./CaseyLifeSkillsCaregiverFields";
import { CaseyLifeSkillsYouthFields } from "./CaseyLifeSkillsYouthFields";
import { formatMdy } from "../../lib/dateFormat";

interface LeadDetailTestingTabProps {
  activeTab: any;
  lead: any;
  handleCreateNewTest: any;
  handleDeleteTest: any;
  handleEditTestRow: any;
  handleTestingSort: any;
  handleViewTestDocuments: any;
  hoveredTestId: any;
  isSystemAdministrator: any;
  setHoveredTestId: any;
  setSelectedTestId: any;
  setViewTestDialogOpen: any;
  sortedTestingAssessments: any;
  testingSortColumn: any;
  testingSortDirection: any;
}

export function LeadDetailTestingTab({
  activeTab,
  lead,
  handleCreateNewTest,
  handleDeleteTest,
  handleEditTestRow,
  handleTestingSort,
  handleViewTestDocuments,
  hoveredTestId,
  isSystemAdministrator,
  setHoveredTestId,
  setSelectedTestId,
  setViewTestDialogOpen,
  sortedTestingAssessments,
  testingSortColumn,
  testingSortDirection,
}: LeadDetailTestingTabProps) {
  return (
    <>
      {activeTab === "testing" && (
        <div className="space-y-6 max-w-full">
          <div
            className="overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "var(--slds-c-card-radius-border)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
          >
            {/* Toolbar */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                borderBottom:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <h2
                className="text-[13px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Testing & Assessments
              </h2>
              <Button
                onClick={handleCreateNewTest}
                disabled={
                  lead.status !== "Active" &&
                  lead.status !== "Referral"
                }
                className="h-8 px-3 rounded-full text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#145F33",
                  color: "white",
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create New Test
              </Button>
            </div>

            {/* Table */}
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
                      className="px-3 py-2 text-left font-semibold cursor-pointer hover:bg-[var(--slds-g-color-background-row-hover)] select-none"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onClick={() => handleTestingSort("date")}
                    >
                      <div className="flex items-center gap-1">
                        Date of Test / Assessment
                        {testingSortColumn === "date" &&
                          (testingSortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left font-semibold cursor-pointer hover:bg-[var(--slds-g-color-background-row-hover)] select-none"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                      onClick={() => handleTestingSort("test")}
                    >
                      <div className="flex items-center gap-1">
                        Test
                        {testingSortColumn === "test" &&
                          (testingSortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left font-semibold"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Summary
                    </th>
                    <th
                      className="px-3 py-2 text-left font-semibold"
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
                  {sortedTestingAssessments.map((test) => (
                    <tr
                      key={test.id}
                      className="hover:bg-[var(--slds-g-color-background-row-hover)]"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <td
                        className="px-3 py-3"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {(() => {
                          const date = new Date(
                            test.date + "T00:00:00Z",
                          );
                          return formatMdy(date);
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        {/* Every test, ACEs included, opens Standardized Test Details */}
                        {
                          <Popover
                            open={hoveredTestId === test.id}
                            onOpenChange={(open) =>
                              setHoveredTestId(
                                open ? test.id : null,
                              )
                            }
                          >
                            <PopoverTrigger
                              className="text-left hover:underline cursor-pointer bg-transparent border-0 p-0 m-0 text-[14px]"
                              style={{
                                color: "#145F33",
                                fontWeight: 500,
                              }}
                              onClick={() => {
                                setSelectedTestId(test.id);
                                setViewTestDialogOpen(true);
                              }}
                              onMouseEnter={() =>
                                setHoveredTestId(test.id)
                              }
                              onMouseLeave={() =>
                                setTimeout(
                                  () => setHoveredTestId(null),
                                  200,
                                )
                              }
                            >
                              {test.test}
                            </PopoverTrigger>
                            <PopoverContent
                              // Hover preview only: keep focus on the test name
                              onOpenAutoFocus={(e) =>
                                e.preventDefault()
                              }
                              className="w-80 p-4"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                boxShadow:
                                  "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                              onMouseEnter={() =>
                                setHoveredTestId(test.id)
                              }
                              onMouseLeave={() =>
                                setHoveredTestId(null)
                              }
                            >
                              <div className="space-y-2">
                                <h3
                                  className="font-semibold text-[14px]"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {test.test}
                                </h3>
                                <div className="space-y-1 text-[12px]">
                                  <div>
                                    <span
                                      className="font-medium"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Date:{" "}
                                    </span>
                                    <span
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {(() => {
                                        const date = new Date(
                                          test.date +
                                            "T00:00:00Z",
                                        );
                                        return formatMdy(date);
                                      })()}
                                    </span>
                                  </div>
                                  <div>
                                    <span
                                      className="font-medium"
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      Summary:{" "}
                                    </span>
                                    <span
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-default)",
                                      }}
                                    >
                                      {test.summary}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        }
                      </td>
                      <td
                        className="px-3 py-3 text-[12px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        {test.summary}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {test.documents &&
                            test.documents.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 hover:bg-[var(--slds-g-color-background-row-hover)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTestDocuments(
                                    test.id,
                                  );
                                }}
                                title="View Documents"
                              >
                                <Eye
                                  className="h-3.5 w-3.5"
                                  style={{ color: "#145F33" }}
                                />
                              </Button>
                            )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 hover:bg-[var(--slds-g-color-background-row-hover)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTestRow(test.id);
                            }}
                            title="Edit"
                          >
                            <Pencil
                              className="h-3.5 w-3.5"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            />
                          </Button>
                          {isSystemAdministrator &&
                            test.source !== "cssrs" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 hover:bg-[var(--slds-g-color-background-row-hover)]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTest(test.id);
                              }}
                              title="Delete"
                            >
                              <Trash2
                                className="h-3.5 w-3.5"
                                style={{ color: "#c23934" }}
                              />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}