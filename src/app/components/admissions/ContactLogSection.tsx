import { useState } from "react";
import { Button } from "../ui/button";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface ContactLogEntry {
    id: number;
    userName: string;
    action: string;
    timestamp: string;
    status: "Complete" | "Overdue" | "In Progress" | "Scheduled";
    isFlagged: boolean;
    title: string;
    description: string;
    contactDate: string;
    contactTime: string;
    assignedTo: string;
    contactType: string;
}

const CONTACT_TYPE_OPTIONS = [
    "All",
    "DCFS",
    "Guardian/Family",
    "School",
    "Hospital/Medical",
    "Attorney/Legal",
    "Therapist",
    "Court",
    "Placement Agency",
    "Internal Staff",
    "Other"
];

export function ContactLogSection() {
    const [contacts, setContacts] = useState<ContactLogEntry[]>([
        {
            id: 1,
            userName: "Sarah Johnson",
            action: "Completed initial intake assessment and reviewed program eligibility",
            timestamp: "2 hours ago",
            status: "Complete",
            isFlagged: false,
            title: "Initial intake assessment",
            description: "Conducted comprehensive intake assessment. Reviewed program eligibility criteria with family. Discussed next steps and timeline for admission process.",
            contactDate: "2024-12-10",
            contactTime: "10:30",
            assignedTo: "Sarah Johnson",
            contactType: "Guardian/Family"
        },
        {
            id: 2,
            userName: "Maria Rodriguez",
            action: "Followed up with family regarding documentation requirements",
            timestamp: "5 hours ago",
            status: "Complete",
            isFlagged: true,
            title: "Documentation follow-up",
            description: "Contacted family to request missing documentation. Explained requirements and provided support in gathering necessary paperwork.",
            contactDate: "2024-12-10",
            contactTime: "14:15",
            assignedTo: "Maria Rodriguez",
            contactType: "Guardian/Family"
        },
        {
            id: 3,
            userName: "John Smith",
            action: "Attempted to reach guardian - left voicemail with callback number",
            timestamp: "1 day ago",
            status: "In Progress",
            isFlagged: true,
            title: "Guardian contact attempt",
            description: "Called guardian to discuss program placement. Left detailed voicemail with callback information and office hours.",
            contactDate: "2024-12-09",
            contactTime: "09:00",
            assignedTo: "John Smith",
            contactType: "Guardian/Family"
        },
        {
            id: 4,
            userName: "Lisa Chen",
            action: "Scheduled home visit and confirmed appointment details with family",
            timestamp: "2 days ago",
            status: "Scheduled",
            isFlagged: false,
            title: "Home visit scheduling",
            description: "Coordinated with family to schedule home visit. Confirmed date, time, and address. Sent calendar invitation and reminder.",
            contactDate: "2024-12-08",
            contactTime: "11:00",
            assignedTo: "Lisa Chen",
            contactType: "Guardian/Family"
        },
        {
            id: 5,
            userName: "Michael Brown",
            action: "Provided information about financial assistance and payment options",
            timestamp: "3 days ago",
            status: "Complete",
            isFlagged: false,
            title: "Financial assistance consultation",
            description: "Discussed available financial assistance programs. Reviewed payment options and application process for financial aid.",
            contactDate: "2024-12-07",
            contactTime: "15:45",
            assignedTo: "Michael Brown",
            contactType: "Internal Staff"
        },
        {
            id: 6,
            userName: "Emily Davis",
            action: "Reviewed medical records and identified additional documentation needed",
            timestamp: "4 days ago",
            status: "Overdue",
            isFlagged: true,
            title: "Medical records review",
            description: "Reviewed submitted medical records. Identified gaps in documentation and sent request for additional medical information.",
            contactDate: "2024-12-06",
            contactTime: "13:20",
            assignedTo: "Emily Davis",
            contactType: "Hospital/Medical"
        }
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
    const [contactTypeFilter, setContactTypeFilter] = useState("All");

    // Dialog States
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingContactId, setEditingContactId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<ContactLogEntry, 'id'>>({
        userName: "",
        action: "",
        timestamp: "",
        status: "In Progress",
        isFlagged: false,
        title: "",
        description: "",
        contactDate: "",
        contactTime: "",
        assignedTo: "",
        contactType: "All"
    });

    // Handlers
    const handleAdd = () => {
        setEditingContactId(null);
        setFormData({
            userName: "",
            action: "",
            timestamp: "",
            status: "In Progress",
            isFlagged: false,
            title: "",
            description: "",
            contactDate: new Date().toISOString().split('T')[0],
            contactTime: "",
            assignedTo: "",
            contactType: "All"
        });
        setDialogOpen(true);
    };

    const handleEdit = (contact: ContactLogEntry) => {
        setEditingContactId(contact.id);
        setFormData({
            userName: contact.userName,
            action: contact.action,
            timestamp: contact.timestamp,
            status: contact.status,
            isFlagged: contact.isFlagged,
            title: contact.title,
            description: contact.description,
            contactDate: contact.contactDate,
            contactTime: contact.contactTime,
            assignedTo: contact.assignedTo,
            contactType: contact.contactType
        });
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            toast.error("Please enter a title");
            return;
        }
        if (!formData.contactDate.trim()) {
            toast.error("Please enter a contact date");
            return;
        }

        // Auto-generate userName and action from title and assignedTo
        const updatedFormData = {
            ...formData,
            userName: formData.assignedTo || "Unknown",
            action: formData.title,
            timestamp: "Just now"
        };

        if (editingContactId) {
            setContacts(contacts.map(c => 
                c.id === editingContactId 
                    ? { ...c, ...updatedFormData }
                    : c
            ));
            toast.success("Contact log updated successfully");
        } else {
            const newId = Math.max(...contacts.map(c => c.id), 0) + 1;
            setContacts([{ id: newId, ...updatedFormData }, ...contacts]);
            toast.success("Contact log added successfully");
        }

        setDialogOpen(false);
        setEditingContactId(null);
    };

    const handleDelete = (id: number) => {
        setContacts(contacts.filter(contact => contact.id !== id));
        toast.success("Contact log deleted");
    };

    // Filter contacts based on search and filter
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = 
            contact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFlagged = !showFlaggedOnly || contact.isFlagged;
        
        const matchesContactType = contactTypeFilter === "All" || contact.contactType === contactTypeFilter;
        
        return matchesSearch && matchesFlagged && matchesContactType;
    });

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case "Complete":
                return "bg-green-50 text-green-700 border-green-200";
            case "Overdue":
                return "bg-red-50 text-red-700 border-red-200";
            case "In Progress":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "Scheduled":
                return "bg-orange-50 text-orange-700 border-orange-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="space-y-6 max-w-full">
            {/* Contact Log Card */}
            <div 
              className="overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: 'var(--slds-c-card-radius-border)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
                {/* Header with Filters */}
                <div 
                  className="px-4 py-3 space-y-3"
                  style={{
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-alt)'
                  }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-semibold text-[#080707]">Log History ({filteredContacts.length})</h3>
                        <Select 
                            value={contactTypeFilter} 
                            onValueChange={(value) => setContactTypeFilter(value)}
                        >
                            <SelectTrigger 
                                className="h-8 w-[180px] rounded-full text-[12px]"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                }}
                            >
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                {CONTACT_TYPE_OPTIONS.map(option => (
                                    <SelectItem key={option} value={option} className="text-[12px]">
                                        {option === "All" ? "All Contact Types" : option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="p-4">
                    {filteredContacts.length === 0 ? (
                        <div className="text-center py-8 text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            No contact logs found.
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {filteredContacts.map((contact, index) => (
                                <div key={contact.id} className="relative flex gap-3 pb-6">
                                    {/* Timeline line */}
                                    {index < filteredContacts.length - 1 && (
                                        <div 
                                            className="absolute left-[15px] top-[32px] bottom-0 w-[2px]" 
                                            style={{ backgroundColor: '#e5e5e5' }}
                                        />
                                    )}
                                    
                                    {/* Icon */}
                                    <div className="relative flex-shrink-0">
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0176d3]"
                                        >
                                            <FileText className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {contact.userName}
                                                    </span>
                                                    <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {contact.action}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] mt-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    {contact.timestamp}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Badge 
                                                    variant="outline" 
                                                    className={`text-[11px] px-2 py-0.5 rounded-sm ${getStatusBadgeStyle(contact.status)}`}
                                                >
                                                    {contact.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Log Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[8px] bg-white border border-[#dddbda]">
                    <DialogHeader className="border-b border-[#dddbda] pb-4">
                        <DialogTitle className="text-[16px] font-bold text-[#080707]">
                            {editingContactId ? "Edit Contact Log" : "Add Contact Log"}
                        </DialogTitle>
                        <DialogDescription className="text-[13px] text-[#706e6b]">
                            {editingContactId ? "Edit the contact log below." : "Add a new contact log below."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto px-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="status" className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">
                                    Status
                                </Label>
                                <Select 
                                    value={formData.status} 
                                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Complete">Complete</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Overdue">Overdue</SelectItem>
                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <Label htmlFor="title" className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">
                                    Title
                                </Label>
                                <Input 
                                    id="title" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="h-9 text-[13px] border-[#dddbda]"
                                    placeholder="Enter log title"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">
                                    Description
                                </Label>
                                <Textarea 
                                    id="description" 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[80px] text-[13px] border-[#dddbda]"
                                    placeholder="Enter log description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="contactDate" className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">
                                        Date
                                    </Label>
                                    <DateInput 
                                        id="contactDate"
value={isoToMdy(formData.contactDate)} 
                                        onChange={(v) => ((e) => setFormData({ ...formData, contactDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                        className="h-9 text-[13px] border-[#dddbda]"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contactTime" className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">
                                        Time
                                    </Label>
                                    <Input 
                                        id="contactTime" 
                                        type="time" 
                                        value={formData.contactTime} 
                                        onChange={(e) => setFormData({ ...formData, contactTime: e.target.value })}
                                        className="h-9 text-[13px] border-[#dddbda]"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="assignedTo" className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">
                                    Staff Member
                                </Label>
                                <Input 
                                    id="assignedTo" 
                                    value={formData.assignedTo} 
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                    className="h-9 text-[13px] border-[#dddbda]"
                                    placeholder="Enter staff member name"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is-flagged"
                                    checked={formData.isFlagged}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isFlagged: !!checked })}
                                />
                                <Label htmlFor="is-flagged" className="text-[13px] cursor-pointer">
                                    Flag this log
                                </Label>
                            </div>

                            <div>
                                <Label htmlFor="contactType" className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">
                                    Contact Type
                                </Label>
                                <Select 
                                    value={formData.contactType} 
                                    onValueChange={(value: any) => setFormData({ ...formData, contactType: value })}
                                >
                                    <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                                        <SelectValue placeholder="Select contact type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONTACT_TYPE_OPTIONS.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-[#dddbda] pt-4 px-6">
                        <Button 
                            variant="outline" 
                            onClick={() => setDialogOpen(false)} 
                            className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none" 
                            onClick={handleSave}
                        >
                            {editingContactId ? "Update" : "Add"} Log
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}