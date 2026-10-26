export interface Constituent {
  id: number;
  name: string;
  type: "Individual" | "Organization";
  role:
    | "Organization"
    | "Community Referral Organization"
    | "Employer"
    | "PSO Organization"
    | "School"
    | "Youth"
    | "MHBG Staff"
    | "Case Manager"
    | "Community Care Member"
    | "Contractor"
    | "Community Care Manager of Care Coordination"
    | "Community Care Staff"
    | "External Constituent"
    | "Friends First Mentee"
    | "Instructor"
    | "Friends First Mentor"
    | "Masters Level Administrative Staff"
    | "Nurse"
    | "Residential Program Authorization Agent"
    | "Tutor";
  status: "Active" | "Inactive" | "Pending";
  program: string;
  lastUpdated: string;
  email?: string;
  phone?: string;
  endDate?: string | null;
  orgName?: string;
  startDate?: string;
  /** Set only on records created from a Friends First Mentor Application:
   *  the stable applicant id that links the record to the mentor. */
  ffMentorApplicantId?: string;
  /** Individual details mapped from the application at Ready for Match
   *  (US 20039). Values keep the application's own formats (DOB is
   *  MM/DD/YYYY). */
  mentorDetails?: ConstituentMentorDetails;
}

export interface ConstituentMentorDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  sex: string;
  ethnicity: string;
  maritalStatus: string;
  religion: string;
  address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
}

export function getConstituentStatus(
  c: Constituent,
): "Active" | "Inactive" {
  if (!c.endDate) return "Active";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(c.endDate);
  end.setHours(0, 0, 0, 0);
  return end >= today ? "Active" : "Inactive";
}

export const CONSTITUENTS: Constituent[] = [
  {
    id: 1,
    name: "Emily Johnson",
    type: "Individual",
    role: "Youth",
    status: "Active",
    program: "Residential Treatment",
    lastUpdated: "2026-04-25",
    email: "emily.johnson@example.com",
    phone: "(555) 123-4567",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    type: "Individual",
    role: "Youth",
    status: "Active",
    program: "Day Treatment",
    lastUpdated: "2026-04-24",
    email: "michael.r@example.com",
    phone: "(555) 234-5678",
  },
  {
    id: 3,
    name: "Sarah Chen",
    type: "Individual",
    role: "External Constituent",
    status: "Active",
    program: "Family Support Services",
    lastUpdated: "2026-04-23",
    email: "sarah.chen@example.com",
    phone: "(555) 345-6789",
  },
  {
    id: 5,
    name: "David Thompson",
    type: "Individual",
    role: "Residential Program Authorization Agent",
    status: "Active",
    program: "Guardianship Services",
    lastUpdated: "2026-04-21",
    email: "d.thompson@example.com",
    phone: "(555) 567-8901",
  },
  {
    id: 6,
    name: "Gaurav Kamble",
    type: "Individual",
    role: "MHBG Staff",
    status: "Active",
    program: "—",
    lastUpdated: "2026-04-20",
    email: "",
    phone: "",
  },
  {
    id: 7,
    name: "Community Health Partners",
    type: "Organization",
    role: "Community Referral Organization",
    status: "Active",
    program: "Healthcare Services",
    lastUpdated: "2026-04-19",
    email: "info@healthpartners.org",
    phone: "(555) 789-0123",
  },
  {
    id: 8,
    name: "Robert Anderson",
    type: "Individual",
    role: "Youth",
    status: "Active",
    program: "Outpatient Services",
    lastUpdated: "2026-04-18",
    email: "robert.a@example.com",
    phone: "(555) 890-1234",
  },
  {
    id: 9,
    name: "Maria Garcia",
    type: "Individual",
    role: "External Constituent",
    status: "Active",
    program: "Family Support Services",
    lastUpdated: "2026-04-17",
    email: "maria.garcia@example.com",
    phone: "(555) 901-2345",
  },
  {
    id: 11,
    name: "James Miller",
    type: "Individual",
    role: "External Constituent",
    status: "Active",
    program: "Development & Fundraising",
    lastUpdated: "2026-04-15",
    email: "james.miller@example.com",
    phone: "(555) 123-4568",
  },
  {
    id: 12,
    name: "Patricia Lee",
    type: "Individual",
    role: "Youth",
    status: "Active",
    program: "Crisis Intervention",
    lastUpdated: "2026-04-14",
    email: "patricia.lee@example.com",
    phone: "(555) 234-5679",
  },
  {
    id: 13,
    name: "Educational Support Foundation",
    type: "Organization",
    role: "PSO Organization",
    status: "Active",
    program: "Educational Services",
    lastUpdated: "2026-04-13",
    email: "contact@edusfoundation.org",
    phone: "(555) 345-6780",
  },
  {
    id: 14,
    name: "Christopher Davis",
    type: "Individual",
    role: "Residential Program Authorization Agent",
    status: "Active",
    program: "Legal Services",
    lastUpdated: "2026-04-12",
    email: "c.davis@example.com",
    phone: "(555) 456-7891",
  },
  {
    id: 15,
    name: "Amanda Brown",
    type: "Individual",
    role: "Friends First Mentor",
    status: "Active",
    program: "Recreation Programs",
    lastUpdated: "2026-04-11",
    email: "amanda.b@example.com",
    phone: "(555) 567-8902",
  },
  {
    id: 17,
    name: "Kevin Martinez",
    type: "Individual",
    role: "Youth",
    status: "Inactive",
    program: "Outpatient Services",
    lastUpdated: "2026-03-15",
    email: "kevin.m@example.com",
    phone: "(555) 789-0124",
    endDate: "2026-03-01",
  },
  {
    id: 18,
    name: "Lisa Taylor",
    type: "Individual",
    role: "External Constituent",
    status: "Active",
    program: "Family Support Services",
    lastUpdated: "2026-04-09",
    email: "lisa.taylor@example.com",
    phone: "(555) 890-1235",
  },
  {
    id: 19,
    name: "Youth Mentorship Alliance",
    type: "Organization",
    role: "Community Referral Organization",
    status: "Active",
    program: "Mentorship Programs",
    lastUpdated: "2026-04-08",
    email: "info@youthmentorship.org",
    phone: "(555) 901-2346",
  },
  {
    id: 20,
    name: "Daniel White",
    type: "Individual",
    role: "Youth",
    status: "Active",
    program: "Residential Treatment",
    lastUpdated: "2026-04-07",
    email: "daniel.white@example.com",
    phone: "(555) 012-3457",
  },
  {
    id: 21,
    name: "Jennifer Moore",
    type: "Individual",
    role: "Friends First Mentor",
    status: "Pending",
    program: "Community Outreach",
    lastUpdated: "2026-04-06",
    email: "jennifer.m@example.com",
    phone: "(555) 123-4569",
  },
  {
    id: 23,
    name: "Thomas Harris",
    type: "Individual",
    role: "Residential Program Authorization Agent",
    status: "Active",
    program: "Guardianship Services",
    lastUpdated: "2026-04-04",
    email: "thomas.h@example.com",
    phone: "(555) 345-6781",
  },
  {
    id: 24,
    name: "Mental Health Alliance",
    type: "Organization",
    role: "Community Referral Organization",
    status: "Active",
    program: "Clinical Services",
    lastUpdated: "2026-04-03",
    email: "contact@mhalliance.org",
    phone: "(555) 456-7892",
  },
  {
    id: 25,
    name: "Rachel Clark",
    type: "Individual",
    role: "Youth",
    status: "Active",
    program: "Day Treatment",
    lastUpdated: "2026-04-02",
    email: "rachel.clark@example.com",
    phone: "(555) 567-8903",
  },
  // Demo Instructors (US 20096). Linked to Classes-module instructors only
  // through INSTRUCTOR_CONSTITUENT_LINKS (data/instructorConstituentLinks),
  // never by name. Ids sit well above the seed range so they never collide.
  {
    id: 9001,
    name: "Sandra Okafor",
    type: "Individual",
    role: "Instructor",
    status: "Active",
    program: "Demo – Instructor (US 20096)",
    lastUpdated: "2026-10-15",
    email: "",
    phone: "",
  },
  {
    id: 9002,
    name: "Angela Brooks",
    type: "Individual",
    role: "Instructor",
    status: "Active",
    program: "Demo – Instructor (US 20096)",
    lastUpdated: "2026-10-15",
    email: "",
    phone: "",
  }, // Demo Individual Contractors (US 20119). Contractor details start empty
  // so Add can be reviewed; two records demonstrate per-constituent isolation.
  {
    id: 9101,
    name: "Marcus Delgado",
    type: "Individual",
    role: "Contractor",
    status: "Active",
    program: "Demo – Contractor (US 20119)",
    lastUpdated: "2026-10-21",
    email: "",
    phone: "",
  },
  {
    id: 9102,
    name: "Priya Raman",
    type: "Individual",
    role: "Contractor",
    status: "Active",
    program: "Demo – Contractor (US 20119)",
    lastUpdated: "2026-10-21",
    email: "",
    phone: "",
  },
  // Demo MHBG Staff for Program Staff History (US 20130). Fictional.
  {
    id: 9201,
    name: "Maya Bennett",
    type: "Individual",
    role: "MHBG Staff",
    status: "Active",
    program: "Demo – Staff History (US 20130)",
    lastUpdated: "2026-10-23",
    email: "",
    phone: "",
  },
  {
    id: 9202,
    name: "Ethan Parker",
    type: "Individual",
    role: "MHBG Staff",
    status: "Active",
    program: "Demo – Staff History (US 20130)",
    lastUpdated: "2026-10-23",
    email: "",
    phone: "",
  },
  {
    id: 9203,
    name: "Sophia Collins",
    type: "Individual",
    role: "MHBG Staff",
    status: "Active",
    program: "Demo – Staff History (US 20130)",
    lastUpdated: "2026-10-23",
    email: "",
    phone: "",
  },
  {
    id: 9204,
    name: "Noah Reed",
    type: "Individual",
    role: "MHBG Staff",
    status: "Active",
    program: "Demo – Staff History (US 20130)",
    lastUpdated: "2026-10-23",
    email: "",
    phone: "",
  },
  {
    id: 9205,
    name: "Olivia Brooks",
    type: "Individual",
    role: "MHBG Staff",
    status: "Active",
    program: "Demo – Staff History (US 20130)",
    lastUpdated: "2026-10-23",
    email: "",
    phone: "",
  },
  {
    id: 9206,
    name: "Lucas Morgan",
    type: "Individual",
    role: "MHBG Staff",
    status: "Active",
    program: "Demo – Staff History (US 20130)",
    lastUpdated: "2026-10-23",
    email: "",
    phone: "",
  },
  {
    id: 9207,
    name: "Amelia Foster",
    type: "Individual",
    role: "MHBG Staff",
    status: "Active",
    program: "Demo – Staff History (US 20130)",
    lastUpdated: "2026-10-23",
    email: "",
    phone: "",
  },
];

// Helper function to get unique values for filters
export const getUniquePrograms = (): string[] => {
  return Array.from(
    new Set(CONSTITUENTS.map((c) => c.program)),
  ).sort();
};

export const getUniqueTypes = (): (
  "Individual" | "Organization"
)[] => {
  return ["Individual", "Organization"];
};

export const getUniqueRoles = (): Constituent["role"][] => {
  return Array.from(
    new Set(CONSTITUENTS.map((c) => c.role)),
  ).sort();
};

export const getUniqueStatuses = (): (
  "Active" | "Inactive" | "Pending"
)[] => {
  return ["Active", "Inactive", "Pending"];
};