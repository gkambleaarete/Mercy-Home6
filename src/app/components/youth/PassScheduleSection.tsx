import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Plus, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import {
  isoToMdy,
  mdyToIso,
  formatMdy,
} from "../../lib/dateFormat";

export function PassScheduleSection() {
  const [passSchedules, setPassSchedules] = useState([
    {
      id: 1,
      youth: "Marcus Johnson",
      program: "Residential",
      location: "Home Visit - Chicago, IL",
      startDate: "2025-01-15",
      departureTime: "09:00",
      endDate: "2025-01-17",
      returnTime: "18:00",
      scheduleFrequency: "Weekly",
      startDay: "Friday",
      endDay: "Sunday",
      departureTransport: "Pick-Up",
      pickupPerson: "Mother - Sarah Johnson",
      returnTransport: "Drop Off",
      dropoffPerson: "Mother - Sarah Johnson",
      stayingWith: "Mother",
      stayingWhere: "Family Home",
      summary:
        "Supervised visit with biological mother. Check-in required at 12pm and 6pm daily.",
      noteworthy:
        "Emergency contact: Mother's cell (555-0123). Youth must maintain curfew of 10pm.",
      status: "Approved",
    },
    {
      id: 2,
      youth: "Marcus Johnson",
      program: "Residential",
      location: "Therapy Session - Downtown Clinic",
      startDate: "2025-01-18",
      departureTime: "14:00",
      endDate: "2025-01-18",
      returnTime: "16:00",
      scheduleFrequency: "Weekly",
      startDay: "Thursday",
      endDay: "Thursday",
      departureTransport: "Self Transportation",
      pickupPerson: "",
      returnTransport: "Self Transportation",
      dropoffPerson: "",
      stayingWith: "N/A",
      stayingWhere: "N/A",
      summary: "Weekly therapy appointment with Dr. Martinez.",
      noteworthy:
        "Transportation arranged. Youth has bus pass and route directions.",
      status: "Scheduled",
    },
    {
      id: 3,
      youth: "Marcus Johnson",
      program: "Residential",
      location: "School Event - Lincoln High School",
      startDate: "2025-01-20",
      departureTime: "17:30",
      endDate: "2025-01-20",
      returnTime: "21:00",
      scheduleFrequency: "One-Time",
      startDay: "Saturday",
      endDay: "Saturday",
      departureTransport: "Drop Off",
      pickupPerson: "",
      returnTransport: "Pick-Up",
      dropoffPerson: "Staff - John Davis",
      stayingWith: "N/A",
      stayingWhere: "N/A",
      summary: "Basketball game with peer group.",
      noteworthy:
        "Staff supervision provided. Will sit in designated section with group.",
      status: "Approved",
    },
    {
      id: 4,
      youth: "Marcus Johnson",
      program: "Residential",
      location: "Family Gathering - Oak Park",
      startDate: "2025-01-22",
      departureTime: "11:00",
      endDate: "2025-01-22",
      returnTime: "20:00",
      scheduleFrequency: "One-Time",
      startDay: "Monday",
      endDay: "Monday",
      departureTransport: "Pick-Up",
      pickupPerson: "Aunt - Maria Lopez",
      returnTransport: "Drop Off",
      dropoffPerson: "Aunt - Maria Lopez",
      stayingWith: "Extended Family",
      stayingWhere: "Aunt's Residence",
      summary: "Birthday celebration for younger sibling.",
      noteworthy:
        "Contact person: Aunt Maria (555-0123). No alcohol will be present.",
      status: "Pending",
    },
    {
      id: 5,
      youth: "Marcus Johnson",
      program: "Residential",
      location: "Medical Appointment - Northwestern Medicine",
      startDate: "2025-01-25",
      departureTime: "10:00",
      endDate: "2025-01-25",
      returnTime: "12:30",
      scheduleFrequency: "Monthly",
      startDay: "Thursday",
      endDay: "Thursday",
      departureTransport: "Drop Off",
      pickupPerson: "",
      returnTransport: "Pick-Up",
      dropoffPerson: "Staff - Emily Chen",
      stayingWith: "N/A",
      stayingWhere: "N/A",
      summary: "Follow-up with Dr. Chen.",
      noteworthy:
        "Staff escort required for medical documentation. Bring insurance card.",
      status: "Approved",
    },
    {
      id: 6,
      youth: "Marcus Johnson",
      program: "Residential",
      location: "Weekend Pass - Grandparents Home",
      startDate: "2025-01-27",
      departureTime: "15:00",
      endDate: "2025-01-29",
      returnTime: "19:00",
      scheduleFrequency: "Bi-Weekly",
      startDay: "Friday",
      endDay: "Sunday",
      departureTransport: "Pick-Up",
      pickupPerson: "Grandfather - Robert Johnson",
      returnTransport: "Drop Off",
      dropoffPerson: "Grandfather - Robert Johnson",
      stayingWith: "Grandparents",
      stayingWhere: "Grandparents Home",
      summary: "Extended weekend visit.",
      noteworthy:
        "Daily check-ins at 7pm. Emergency contact: Grandfather (555-0456)",
      status: "Approved",
    },
  ]);

  const [showPassDialog, setShowPassDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] =
    useState(false);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [editingPassId, setEditingPassId] = useState<
    number | null
  >(null);
  const [passForm, setPassForm] = useState({
    youth: "",
    displayAllYouths: false,
    program: "",
    location: "",
    startDate: "",
    departureTime: "",
    endDate: "",
    returnTime: "",
    scheduleFrequency: "",
    startDay: "",
    endDay: "",
    departureTransport: "",
    pickupPerson: "",
    returnTransport: "",
    dropoffPerson: "",
    stayingWith: "",
    stayingWhere: "",
    summary: "",
    noteworthy: "",
    status: "",
  });

  const handleAddPass = () => {
    setEditingPassId(null);
    setPassForm({
      youth: "",
      displayAllYouths: false,
      program: "",
      location: "",
      startDate: "",
      departureTime: "",
      endDate: "",
      returnTime: "",
      scheduleFrequency: "",
      startDay: "",
      endDay: "",
      departureTransport: "",
      pickupPerson: "",
      returnTransport: "",
      dropoffPerson: "",
      stayingWith: "",
      stayingWhere: "",
      summary: "",
      noteworthy: "",
      status: "",
    });
    setShowPassDialog(true);
  };

  const handleSavePass = () => {
    if (editingPassId) {
      setPassSchedules(
        passSchedules.map((p) =>
          p.id === editingPassId ? { ...p, ...passForm } : p,
        ),
      );
    } else {
      const newPass = {
        id: Math.max(...passSchedules.map((p) => p.id), 0) + 1,
        ...passForm,
      };
      setPassSchedules([...passSchedules, newPass]);
    }
    setShowPassDialog(false);
  };

  const handleRowClick = (pass: any) => {
    setSelectedPass(pass);
    setShowDetailDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "#4caf50"; // Green
      case "Scheduled":
        return "#2196f3"; // Blue
      case "Pending":
        return "#ff9800"; // Orange
      case "Cancelled":
        return "#c23934"; // Red
      default:
        return "#706e6b"; // Gray
    }
  };

  return (
    <div className="p-6 max-w-6xl">
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
            Pass Schedule
          </h3>
          <Button
            onClick={handleAddPass}
            className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        <div className="p-4">
          {passSchedules.length === 0 ? (
            <div
              className="text-center py-8"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-[13px]">No scheduled passes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <TableHead
                      className="text-[11px] font-semibold text-[#080707] px-3 py-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Location
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-[#080707] px-3 py-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Start Date
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-[#080707] px-3 py-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Departure Time
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-[#080707] px-3 py-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      End Date
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-[#080707] px-3 py-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Return Time
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-[#080707] px-3 py-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Noteworthy
                    </TableHead>
                    <TableHead
                      className="text-[11px] font-semibold text-[#080707] px-3 py-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passSchedules.map((pass, index) => (
                    <TableRow
                      key={pass.id}
                      onClick={() => handleRowClick(pass)}
                      className="cursor-pointer hover:bg-gray-50"
                      style={{
                        borderBottom:
                          index < passSchedules.length - 1
                            ? "1px solid var(--slds-g-color-border-base-1)"
                            : "none",
                      }}
                    >
                      <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[200px]">
                        <div className="line-clamp-1">
                          {pass.location}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                        {formatMdy(new Date(pass.startDate))}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                        {pass.departureTime}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                        {formatMdy(new Date(pass.endDate))}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                        {pass.returnTime}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[300px]">
                        <div className="line-clamp-2">
                          {pass.noteworthy}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-[13px]">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                          style={{
                            backgroundColor:
                              getStatusColor(pass.status) +
                              "15",
                            color: getStatusColor(pass.status),
                          }}
                        >
                          {pass.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Detail View Dialog */}
          <Dialog
            open={showDetailDialog}
            onOpenChange={setShowDetailDialog}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="relative">
                <DialogTitle className="text-[18px] font-semibold">
                  Pass Details
                </DialogTitle>
                <DialogDescription className="text-[14px] text-[#525252]">
                  View complete information about this pass
                  schedule.
                </DialogDescription>
              </DialogHeader>
              {selectedPass && (
                <div className="py-4">
                  {/* Youth & Program Information */}
                  <div className="mb-6">
                    <h3
                      className="text-[14px] font-semibold mb-3 pb-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color: "#080707",
                      }}
                    >
                      Youth & Program
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Youth
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.youth}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Program
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.program}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Information */}
                  <div className="mb-6">
                    <h3
                      className="text-[14px] font-semibold mb-3 pb-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color: "#080707",
                      }}
                    >
                      Schedule
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Location
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.location}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Frequency
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.scheduleFrequency}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Days
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.startDay} -{" "}
                          {selectedPass.endDay}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Start Date & Time
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {formatMdy(
                            new Date(selectedPass.startDate),
                          )}{" "}
                          at {selectedPass.departureTime}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          End Date & Time
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {formatMdy(
                            new Date(selectedPass.endDate),
                          )}{" "}
                          at {selectedPass.returnTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="mb-6">
                    <h3
                      className="text-[14px] font-semibold mb-3 pb-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color: "#080707",
                      }}
                    >
                      Transportation
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Departing Method
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.departureTransport}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Pick-Up Person
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.pickupPerson || "N/A"}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Return Method
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.returnTransport}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Drop-Off Person
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.dropoffPerson || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mb-6">
                    <h3
                      className="text-[14px] font-semibold mb-3 pb-2"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color: "#080707",
                      }}
                    >
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Staying With
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.stayingWith}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">
                          Staying Where
                        </Label>
                        <div className="text-[13px] mt-1 text-[#080707]">
                          {selectedPass.stayingWhere}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Label className="text-[11px] font-semibold text-[#706e6b]">
                        Summary
                      </Label>
                      <div className="text-[13px] mt-1 text-[#080707]">
                        {selectedPass.summary}
                      </div>
                    </div>
                    <div className="mb-3">
                      <Label className="text-[11px] font-semibold text-[#706e6b]">
                        Noteworthy Details
                      </Label>
                      <div className="text-[13px] mt-1 text-[#080707]">
                        {selectedPass.noteworthy}
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-[#706e6b]">
                        Status
                      </Label>
                      <div className="mt-1">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                          style={{
                            backgroundColor:
                              getStatusColor(
                                selectedPass.status,
                              ) + "15",
                            color: getStatusColor(
                              selectedPass.status,
                            ),
                          }}
                        >
                          {selectedPass.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex justify-end gap-2 pt-4"
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <Button
                      onClick={() => setShowDetailDialog(false)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium"
                      style={{
                        backgroundColor: "#145F33",
                        color: "white",
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Add/Edit Pass Dialog */}
          <Dialog
            open={showPassDialog}
            onOpenChange={setShowPassDialog}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[18px] font-semibold">
                  {editingPassId
                    ? "Edit Pass Schedule"
                    : "Add Pass Schedule"}
                </DialogTitle>
                <DialogDescription className="text-[14px] text-[#525252]">
                  {editingPassId
                    ? "Update the details of the existing pass."
                    : "Schedule a new pass for the youth."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                {/* Youth & Program Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Youth *
                    </Label>
                    <Select
                      value={passForm.youth}
                      onValueChange={(value) =>
                        setPassForm({
                          ...passForm,
                          youth: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        className="h-9 text-[13px]"
                      >
                        <SelectValue placeholder="Select youth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marcus Johnson">
                          Marcus Johnson
                        </SelectItem>
                        <SelectItem value="Sarah Williams">
                          Sarah Williams
                        </SelectItem>
                        <SelectItem value="James Chen">
                          James Chen
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Program *
                    </Label>
                    <Select
                      value={passForm.program}
                      onValueChange={(value) =>
                        setPassForm({
                          ...passForm,
                          program: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        className="h-9 text-[13px]"
                      >
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residential">
                          Residential
                        </SelectItem>
                        <SelectItem value="Day Program">
                          Day Program
                        </SelectItem>
                        <SelectItem value="Transitional Living">
                          Transitional Living
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Display All Youths Checkbox */}
                <div className="flex items-center space-x-2 -mt-1">
                  <Checkbox
                    surface="base"
                    id="displayAllYouths"
                    checked={passForm.displayAllYouths}
                    onCheckedChange={(checked) =>
                      setPassForm({
                        ...passForm,
                        displayAllYouths: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor="displayAllYouths"
                    className="text-[12px] text-[#706e6b] cursor-pointer"
                  >
                    Display All Youths
                  </Label>
                </div>

                {/* Divider */}
                <div
                  style={{
                    borderTop:
                      "1px solid var(--slds-g-color-border-base-1)",
                    margin: "20px 0 16px 0",
                  }}
                ></div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-[#080707]">
                    Location *
                  </Label>
                  <Input
                    surface="base"
                    value={passForm.location}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        location: e.target.value,
                      })
                    }
                    className="h-9 text-[13px]"
                    placeholder="e.g., Home Visit - Chicago, IL"
                  />
                </div>

                {/* Frequency & Days */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Frequency *
                    </Label>
                    <Select
                      value={passForm.scheduleFrequency}
                      onValueChange={(value) =>
                        setPassForm({
                          ...passForm,
                          scheduleFrequency: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        className="h-9 text-[13px]"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekly">
                          Weekly
                        </SelectItem>
                        <SelectItem value="Bi-Weekly">
                          Bi-Weekly
                        </SelectItem>
                        <SelectItem value="Monthly">
                          Monthly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Start Day *
                    </Label>
                    <Select
                      value={passForm.startDay}
                      onValueChange={(value) =>
                        setPassForm({
                          ...passForm,
                          startDay: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        className="h-9 text-[13px]"
                      >
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      End Day *
                    </Label>
                    <Select
                      value={passForm.endDay}
                      onValueChange={(value) =>
                        setPassForm({
                          ...passForm,
                          endDay: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        className="h-9 text-[13px]"
                      >
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Start Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Start Date *
                    </Label>
                    <DateInput
                      value={isoToMdy(passForm.startDate)}
                      onChange={(v) =>
                        ((e) =>
                          setPassForm({
                            ...passForm,
                            startDate: e.target.value,
                          }))({
                          target: { value: mdyToIso(v) },
                        })
                      }
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Start Time *
                    </Label>
                    <Input
                      surface="base"
                      type="time"
                      value={passForm.departureTime}
                      onChange={(e) =>
                        setPassForm({
                          ...passForm,
                          departureTime: e.target.value,
                        })
                      }
                      className="h-9 text-[13px]"
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      End Date *
                    </Label>
                    <DateInput
                      value={isoToMdy(passForm.endDate)}
                      onChange={(v) =>
                        ((e) =>
                          setPassForm({
                            ...passForm,
                            endDate: e.target.value,
                          }))({
                          target: { value: mdyToIso(v) },
                        })
                      }
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      End Time *
                    </Label>
                    <Input
                      surface="base"
                      type="time"
                      value={passForm.returnTime}
                      onChange={(e) =>
                        setPassForm({
                          ...passForm,
                          returnTime: e.target.value,
                        })
                      }
                      className="h-9 text-[13px]"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    borderTop:
                      "1px solid var(--slds-g-color-border-base-1)",
                    margin: "20px 0 16px 0",
                  }}
                ></div>

                {/* Transportation - Departing */}
                <div className="space-y-2.5">
                  <Label className="text-[11px] font-semibold text-[#706e6b]">
                    DEPARTING FROM MERCY
                  </Label>
                  <div className="flex gap-6">
                    {[
                      "Pick-Up",
                      "Drop Off",
                      "Self Transportation",
                    ].map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="departureTransport"
                          value={method}
                          checked={
                            passForm.departureTransport ===
                            method
                          }
                          onChange={(e) =>
                            setPassForm({
                              ...passForm,
                              departureTransport:
                                e.target.value,
                            })
                          }
                          className="w-4 h-4"
                          style={{ accentColor: "#145F33" }}
                        />
                        <span className="text-[13px] text-[#080707]">
                          {method}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Pick-Up Person */}
                  {passForm.departureTransport ===
                    "Pick-Up" && (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-[11px] font-semibold text-[#080707]">
                        Pick-Up Person *
                      </Label>
                      <Select
                        value={passForm.pickupPerson}
                        onValueChange={(value) =>
                          setPassForm({
                            ...passForm,
                            pickupPerson: value,
                          })
                        }
                      >
                        <SelectTrigger
                          surface="base"
                          className="h-9 text-[13px]"
                        >
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mother - Sarah Johnson">
                            Mother - Sarah Johnson
                          </SelectItem>
                          <SelectItem value="Father - David Johnson">
                            Father - David Johnson
                          </SelectItem>
                          <SelectItem value="Aunt - Maria Lopez">
                            Aunt - Maria Lopez
                          </SelectItem>
                          <SelectItem value="Grandfather - Robert Johnson">
                            Grandfather - Robert Johnson
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Transportation - Returning */}
                <div className="space-y-2.5">
                  <Label className="text-[11px] font-semibold text-[#706e6b]">
                    RETURNING TO MERCY
                  </Label>
                  <div className="flex gap-6">
                    {[
                      "Pick-Up",
                      "Drop Off",
                      "Self Transportation",
                    ].map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="returnTransport"
                          value={method}
                          checked={
                            passForm.returnTransport === method
                          }
                          onChange={(e) =>
                            setPassForm({
                              ...passForm,
                              returnTransport: e.target.value,
                            })
                          }
                          className="w-4 h-4"
                          style={{ accentColor: "#145F33" }}
                        />
                        <span className="text-[13px] text-[#080707]">
                          {method}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Drop-Off Person */}
                  {passForm.returnTransport === "Drop Off" && (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-[11px] font-semibold text-[#080707]">
                        Drop-Off Person *
                      </Label>
                      <Select
                        value={passForm.dropoffPerson}
                        onValueChange={(value) =>
                          setPassForm({
                            ...passForm,
                            dropoffPerson: value,
                          })
                        }
                      >
                        <SelectTrigger
                          surface="base"
                          className="h-9 text-[13px]"
                        >
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mother - Sarah Johnson">
                            Mother - Sarah Johnson
                          </SelectItem>
                          <SelectItem value="Father - David Johnson">
                            Father - David Johnson
                          </SelectItem>
                          <SelectItem value="Aunt - Maria Lopez">
                            Aunt - Maria Lopez
                          </SelectItem>
                          <SelectItem value="Grandfather - Robert Johnson">
                            Grandfather - Robert Johnson
                          </SelectItem>
                          <SelectItem value="Staff - John Davis">
                            Staff - John Davis
                          </SelectItem>
                          <SelectItem value="Staff - Emily Chen">
                            Staff - Emily Chen
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div
                  style={{
                    borderTop:
                      "1px solid var(--slds-g-color-border-base-1)",
                    margin: "20px 0 16px 0",
                  }}
                ></div>

                {/* Staying With & Where */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Staying With *
                    </Label>
                    <Select
                      value={passForm.stayingWith}
                      onValueChange={(value) =>
                        setPassForm({
                          ...passForm,
                          stayingWith: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        className="h-9 text-[13px]"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mother">
                          Mother
                        </SelectItem>
                        <SelectItem value="Father">
                          Father
                        </SelectItem>
                        <SelectItem value="Grandparents">
                          Grandparents
                        </SelectItem>
                        <SelectItem value="Extended Family">
                          Extended Family
                        </SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Staying Where *
                    </Label>
                    <Select
                      value={passForm.stayingWhere}
                      onValueChange={(value) =>
                        setPassForm({
                          ...passForm,
                          stayingWhere: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        className="h-9 text-[13px]"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Family Home">
                          Family Home
                        </SelectItem>
                        <SelectItem value="Grandparents Home">
                          Grandparents Home
                        </SelectItem>
                        <SelectItem value="Aunt's Residence">
                          Aunt's Residence
                        </SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-[#080707]">
                    Summary *
                  </Label>
                  <Textarea
                    surface="base"
                    value={passForm.summary}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        summary: e.target.value,
                      })
                    }
                    className="min-h-[70px] text-[13px] resize-none"
                    placeholder="Brief summary of the pass purpose..."
                  />
                </div>

                {/* Noteworthy Details */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-[#080707]">
                    Noteworthy Details *
                  </Label>
                  <Textarea
                    surface="base"
                    value={passForm.noteworthy}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        noteworthy: e.target.value,
                      })
                    }
                    className="min-h-[70px] text-[13px] resize-none"
                    placeholder="Important details, contacts, or special instructions..."
                  />
                </div>

                {/* Status */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-[#080707]">
                      Status *
                    </Label>
                    <Select
                      value={passForm.status}
                      onValueChange={(value) =>
                        setPassForm({
                          ...passForm,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger
                        surface="base"
                        className="h-9 text-[13px]"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved">
                          Approved
                        </SelectItem>
                        <SelectItem value="Scheduled">
                          Scheduled
                        </SelectItem>
                        <SelectItem value="Pending">
                          Pending
                        </SelectItem>
                        <SelectItem value="Cancelled">
                          Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className="flex justify-end gap-2 pt-4"
                  style={{
                    borderTop:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <Button
                    onClick={() => setShowPassDialog(false)}
                    className="h-9 px-4 rounded-full text-[13px] font-medium"
                    style={{
                      backgroundColor: "transparent",
                      color: "#706e6b",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePass}
                    disabled={
                      !passForm.youth ||
                      !passForm.program ||
                      !passForm.location ||
                      !passForm.startDate ||
                      !passForm.departureTime ||
                      !passForm.endDate ||
                      !passForm.returnTime ||
                      !passForm.scheduleFrequency ||
                      !passForm.startDay ||
                      !passForm.endDay ||
                      !passForm.departureTransport ||
                      !passForm.returnTransport ||
                      !passForm.stayingWith ||
                      !passForm.stayingWhere ||
                      !passForm.summary ||
                      !passForm.noteworthy ||
                      !passForm.status
                    }
                    className="h-9 px-4 rounded-full text-[13px] font-medium"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                      opacity:
                        !passForm.youth ||
                        !passForm.program ||
                        !passForm.location ||
                        !passForm.startDate ||
                        !passForm.departureTime ||
                        !passForm.endDate ||
                        !passForm.returnTime ||
                        !passForm.scheduleFrequency ||
                        !passForm.startDay ||
                        !passForm.endDay ||
                        !passForm.departureTransport ||
                        !passForm.returnTransport ||
                        !passForm.stayingWith ||
                        !passForm.stayingWhere ||
                        !passForm.summary ||
                        !passForm.noteworthy ||
                        !passForm.status
                          ? 0.5
                          : 1,
                    }}
                  >
                    {editingPassId ? "Update Pass" : "Add Pass"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}