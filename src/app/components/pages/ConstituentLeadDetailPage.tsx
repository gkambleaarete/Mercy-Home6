/**
 * ConstituentLeadDetailPage
 *
 * Wraps LeadDetailView so that clicking a constituent in the Constituents
 * module opens the exact same detail experience as the Admissions youth
 * profile.  The constituent's data is mapped to the `lead` shape that
 * LeadDetailView expects.
 */

import {
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router";
import { LeadDetailView } from "../admissions/LeadDetailView";
import { CONSTITUENTS } from "../../data/mockConstituents";
import { OrganizationConstituentDetailPage } from "./OrganizationConstituentDetailPage";
// Brings constituents created from Mentor Applications into CONSTITUENTS
// as soon as this page loads (side-effect import).
import "../../data/ffMentorApplicationStore";

/** Map a constituent record to the minimal `lead` shape LeadDetailView uses. */
function constituentToLead(
  constituent: (typeof CONSTITUENTS)[number],
) {
  return {
    id: String(constituent.id),
    name: constituent.name,
    program: constituent.program,
    guardian: "Not Specified",
    stage:
      constituent.status === "Active"
        ? "Active Enrollment"
        : constituent.status,
    daysInStage: 0,
    status: constituent.status,
    lastActivity: constituent.lastUpdated,
    alerts: [] as string[],
    phone: constituent.phone ?? "",
    email: constituent.email ?? "",
    completedStages: [] as string[],
    // Optional demographic fields surfaced from the constituent record
    constituentType: constituent.type,
    role: constituent.role,
    gender: "",
    ageGroup: "Youth",
    campus: "",
    createdDate: constituent.lastUpdated,
  };
}

/** Fallback lead used when no constituent matches the URL id. */
function fallbackLead(id: string) {
  return {
    id,
    name: "Unknown Constituent",
    program: "",
    guardian: "",
    stage: "Active Enrollment",
    daysInStage: 0,
    status: "Active",
    lastActivity: new Date().toISOString().split("T")[0],
    alerts: [] as string[],
    phone: "",
    email: "",
    completedStages: [] as string[],
    createdDate: new Date().toISOString().split("T")[0],
  };
}

export function ConstituentLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const constituent = CONSTITUENTS.find(
    (c) => String(c.id) === id,
  );

  const INDIVIDUAL_ROLES_WITH_ORG_TABS = new Set([
    "Case Manager",
    "Community Care Member",
    "Community Care Manager of Care Coordination",
    "Community Care Staff",
    "Contractor",
    "External Constituent",
    "Friends First Mentee",
    "Friends First Mentor",
    "Instructor",
    "Masters Level Administrative Staff",
    "MHBG Staff",
    "Nurse",
    "Residential Program Authorization Agent",
    "Tutor",
  ]);

  // Organization constituents — and the 12 specified Individual roles — get the
  // tailored detail page with Contact / Constituent Roles / Relationships / Connections tabs
  if (
    constituent?.type === "Organization" ||
    (constituent?.type === "Individual" &&
      INDIVIDUAL_ROLES_WITH_ORG_TABS.has(constituent.role))
  ) {
    return (
      <OrganizationConstituentDetailPage
        // Remount per record so the active tab, selected rows and open
        // dialogs never carry over to another constituent.
        key={constituent.id}
        constituent={constituent}
        onBack={() => navigate("/constituents")}
      />
    );
  }

  const lead = constituent
    ? constituentToLead(constituent)
    : fallbackLead(id ?? "0");

  return (
    <LeadDetailView
      lead={lead}
      onBack={() => navigate("/constituents")}
      backLabel="Constituents"
      initialOverviewSection={
        searchParams.get("section") === "documents"
          ? "documents"
          : "constituent-details"
      }
      hideConvertButton={true}
      hidePipelineProgress={true}
      hideStatusSelect={true}
      hideOtcDashboard={true}
      hideTreatmentPlanningTabs={["supplementalPlans"]}
      useConstituentIncidentDialog={true}
      showTransitionSummary={true}
      initialTransitionSummaryId={
        searchParams.get("section") === "transition-summary"
          ? (searchParams.get("summary") ?? undefined)
          : undefined
      }
      useGeneralAccordion={true}
    />
  );
}