import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { toast } from "sonner";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface ProgramEnrollment {
  id: string;
  moveInProgram: string;
  program: string;
  actualMoveInDate: string;
  actualMoveOutDate: string;
  stayNumber: string;
}

export function ProgramEnrolmentSection() {
  const [profileData, setProfileData] = useState({
    id: "1234567890",
    status: "Active",
    type: "Youth",
    age: "17",
    roles: "Client, Student",
  });

  const [programEnrollments, setProgramEnrollments] = useState<
    ProgramEnrollment[]
  >([
    {
      id: "1",
      moveInProgram: "Bernardin",
      program: "Bernardin",
      actualMoveInDate: "",
      actualMoveOutDate: "",
      stayNumber: "1",
    },
    {
      id: "2",
      moveInProgram: "Campbell",
      program: "Campbell",
      actualMoveInDate: "",
      actualMoveOutDate: "",
      stayNumber: "2",
    },
    {
      id: "3",
      moveInProgram: "Seton",
      program: "Seton",
      actualMoveInDate: "01/15/2024",
      actualMoveOutDate: "",
      stayNumber: "3",
    },
    {
      id: "4",
      moveInProgram: "Daley",
      program: "Daley",
      actualMoveInDate: "06/10/2023",
      actualMoveOutDate: "12/20/2023",
      stayNumber: "4",
    },
    {
      id: "5",
      moveInProgram: "Self-Awareness",
      program: "Self-Awareness",
      actualMoveInDate: "09/05/2024",
      actualMoveOutDate: "02/01/2025",
      stayNumber: "5",
    },
  ]);

  const [isProfileEditOpen, setIsProfileEditOpen] =
    useState(false);
  const [editingProfile, setEditingProfile] =
    useState(profileData);

  // Program Enrollment State
  const [isProgramDialogOpen, setIsProgramDialogOpen] =
    useState(false);
  const [editingProgram, setEditingProgram] =
    useState<ProgramEnrollment | null>(null);
  const [programForm, setProgramForm] = useState({
    admission: "",
    moveInProgram: "",
    program: "",
    actualMoveInDate: "",
    actualMoveOutDate: "",
    stayNumber: "",
  });

  // Profile handlers
  const handleProfileEdit = () => {
    setEditingProfile(profileData);
    setIsProfileEditOpen(true);
  };

  const handleProfileSave = () => {
    setProfileData(editingProfile);
    setIsProfileEditOpen(false);
    toast.success("Profile updated successfully");
  };

  // Program Enrollment handlers
  const handleNewProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      admission: "",
      moveInProgram: "",
      program: "",
      actualMoveInDate: "",
      actualMoveOutDate: "",
      stayNumber: "",
    });
    setIsProgramDialogOpen(true);
  };

  const handleEditProgram = (enrollment: ProgramEnrollment) => {
    setEditingProgram(enrollment);
    setProgramForm({
      admission: "",
      moveInProgram: enrollment.moveInProgram,
      program: enrollment.program,
      actualMoveInDate: enrollment.actualMoveInDate,
      actualMoveOutDate: enrollment.actualMoveOutDate,
      stayNumber: enrollment.stayNumber,
    });
    setIsProgramDialogOpen(true);
  };

  const handleDeleteProgram = (id: string) => {
    setProgramEnrollments(
      programEnrollments.filter((e) => e.id !== id),
    );
    toast.success("Program enrollment deleted successfully");
  };

  const handleSaveProgram = () => {
    if (!programForm.program) {
      toast.error("Please select a program");
      return;
    }

    if (!programForm.actualMoveInDate) {
      toast.error("Please enter a move in date");
      return;
    }

    if (editingProgram) {
      setProgramEnrollments(
        programEnrollments.map((e) =>
          e.id === editingProgram.id
            ? {
                ...e,
                moveInProgram: programForm.moveInProgram,
                program: programForm.program,
                actualMoveInDate: programForm.actualMoveInDate,
                actualMoveOutDate:
                  programForm.actualMoveOutDate,
                stayNumber: programForm.stayNumber,
              }
            : e,
        ),
      );
      toast.success("Program enrollment updated successfully");
    } else {
      const newEnrollment: ProgramEnrollment = {
        id: Date.now().toString(),
        moveInProgram: programForm.moveInProgram,
        program: programForm.program,
        actualMoveInDate: programForm.actualMoveInDate,
        actualMoveOutDate: programForm.actualMoveOutDate,
        stayNumber: programForm.stayNumber,
      };
      setProgramEnrollments([
        ...programEnrollments,
        newEnrollment,
      ]);
      toast.success("Program enrollment created successfully");
    }

    setIsProgramDialogOpen(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Program Enrollment Card */}
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
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Program Enrollments
          </h3>
          <Button
            onClick={handleNewProgram}
            size="sm"
            className="h-8 px-3 text-[13px] rounded-full"
            style={{
              backgroundColor: "#145F33",
              color: "white",
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Program
          </Button>
        </div>

        {programEnrollments.length === 0 ? (
          <div className="p-8 text-center">
            <p
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No program enrollments yet. Click "New Program" to
              add one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    PROGRAM
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    MOVE IN DATE
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    MOVE OUT DATE
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {programEnrollments.map((enrollment, index) => (
                  <tr
                    key={enrollment.id}
                    style={{
                      borderBottom:
                        index < programEnrollments.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-3 text-[13px] text-[#080707]">
                      {enrollment.program}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#080707]">
                      {enrollment.actualMoveInDate || "-"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#080707]">
                      {enrollment.actualMoveOutDate || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleEditProgram(enrollment)
                          }
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4 text-[#706e6b]" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteProgram(enrollment.id)
                          }
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-[#706e6b]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Edit Dialog */}
      <Dialog
        open={isProfileEditOpen}
        onOpenChange={setIsProfileEditOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile Information</DialogTitle>
            <DialogDescription>
              Update the constituent's profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-id">ID</Label>
              <Input
                surface="base"
                id="edit-id"
                value={editingProfile.id}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    id: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editingProfile.status}
                onValueChange={(value) =>
                  setEditingProfile({
                    ...editingProfile,
                    status: value,
                  })
                }
              >
                <SelectTrigger surface="base" id="edit-status">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">
                    Approved
                  </SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Admissions Screening">
                    Admissions Screening
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <Input
                surface="base"
                id="edit-type"
                value={editingProfile.type}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    type: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-age">Age</Label>
              <Input
                surface="base"
                id="edit-age"
                type="number"
                value={editingProfile.age}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    age: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-roles">Roles</Label>
              <Input
                surface="base"
                id="edit-roles"
                value={editingProfile.roles}
                onChange={(e) =>
                  setEditingProfile({
                    ...editingProfile,
                    roles: e.target.value,
                  })
                }
                placeholder="e.g., Client, Student"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProfileEditOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProfileSave}
              className="rounded-full"
              style={{ backgroundColor: "#145F33" }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Program Enrollment Dialog */}
      <Dialog
        open={isProgramDialogOpen}
        onOpenChange={setIsProgramDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px] rounded-[8px] bg-white border border-[#dddbda]">
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              {editingProgram
                ? "Edit Program Enrollment"
                : "New Program Enrollment"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b]">
              {editingProgram
                ? "Update the program enrollment details below."
                : "Add a new program enrollment record below."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[65vh] overflow-y-auto px-6">
            <div className="space-y-6">
              {/* Actual Section */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="program"
                    className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                  >
                    Program:{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={programForm.program}
                      onValueChange={(value) =>
                        setProgramForm({
                          ...programForm,
                          program: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        id="program"
                        className="h-9 text-[13px] border-[#dddbda]"
                      >
                        <SelectValue placeholder="Please Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A Program #2">
                          A Program #2
                        </SelectItem>
                        <SelectItem value="Bernardin">
                          Bernardin
                        </SelectItem>
                        <SelectItem value="Bosco">
                          Bosco
                        </SelectItem>
                        <SelectItem value="Campbell">
                          Campbell
                        </SelectItem>
                        <SelectItem value="Cooke">
                          Cooke
                        </SelectItem>
                        <SelectItem value="Couderc">
                          Couderc
                        </SelectItem>
                        <SelectItem value="Daley">
                          Daley
                        </SelectItem>
                        <SelectItem value="Kelly">
                          Kelly
                        </SelectItem>
                        <SelectItem value="Mahoney">
                          Mahoney
                        </SelectItem>
                        <SelectItem value="Noha">
                          Noha
                        </SelectItem>
                        <SelectItem value="Other">
                          Other
                        </SelectItem>
                        <SelectItem value="Quille">
                          Quille
                        </SelectItem>
                        <SelectItem value="Self-Awareness">
                          Self-Awareness
                        </SelectItem>
                        <SelectItem value="Seton">
                          Seton
                        </SelectItem>
                        <SelectItem value="Shell">
                          Shell
                        </SelectItem>
                        <SelectItem value="Speh">
                          Speh
                        </SelectItem>
                        <SelectItem value="Walgreen">
                          Walgreen
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {programForm.program && (
                      <div
                        className="px-3 py-1.5 rounded text-[11px] font-semibold whitespace-nowrap"
                        style={{
                          backgroundColor: "#D1FAE5",
                          color: "#10B981",
                        }}
                      >
                        Available Beds: 2
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="actual-move-in-date"
                    className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                  >
                    Move In Date:{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <DateInput
                    id="actual-move-in-date"
                    value={isoToMdy(
                      programForm.actualMoveInDate,
                    )}
                    onChange={(v) =>
                      ((e) =>
                        setProgramForm({
                          ...programForm,
                          actualMoveInDate: e.target.value,
                        }))({ target: { value: mdyToIso(v) } })
                    }
                    className="h-9 text-[13px] border-[#dddbda]"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="actual-move-out-date"
                    className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                  >
                    Move Out Date:
                  </Label>
                  <DateInput
                    id="actual-move-out-date"
                    value={isoToMdy(
                      programForm.actualMoveOutDate,
                    )}
                    onChange={(v) =>
                      ((e) =>
                        setProgramForm({
                          ...programForm,
                          actualMoveOutDate: e.target.value,
                        }))({ target: { value: mdyToIso(v) } })
                    }
                    className="h-9 text-[13px] border-[#dddbda]"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-[#dddbda] pt-4 px-6">
            <Button
              variant="outline"
              onClick={() => setIsProgramDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProgram}
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
            >
              {editingProgram ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}