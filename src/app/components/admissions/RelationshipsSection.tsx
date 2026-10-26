import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Plus, Pencil, Trash2, Save, Search, ChevronDown, ChevronUp, Check, X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface Relationship {
    id: string;
    relatedTo: string;
    relationship: string;
    startDate: string;
    endDate: string;
    involvementLevel: string;
    relationshipQuality: string;
    comments: string;
    emergencyContact: boolean;
    legalGuardian: boolean;
    eligibleForPass: boolean;
    hasNotes: boolean;
    emergencyContactSortOrder?: number;
    emergencyContactIsPrimary?: boolean;
}

interface Constituent {
    id: string;
    constituentType: string;
    firstName: string;
    lastName: string;
    legalGuardian: boolean;
    eligibleForPass: boolean;
    startDate: string;
    endDate: string;
    relationship: string;
    active: boolean;
    role?: string;
    roleStartDate?: string;
    hasPrimaryPhone: boolean;
    phone?: string;
    phoneExtension?: string;
    phoneType?: string;
    hasPrimaryEmail: boolean;
    email?: string;
    emailType?: string;
    hasPrimaryAddress: boolean;
    streetAddress?: string;
    addressType?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipPlus4?: string;
}

interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    address: string;
    isPrimary: boolean;
    sortOrder: number;
}

// Mock emergency contacts data
const mockEmergencyContacts: EmergencyContact[] = [
    {
        id: "ec1",
        name: "Shaun Fleming",
        relationship: "Admissions Parent",
        phone: "(408)931-0354",
        address: "1312 Crescent Avenue, Chicago, IL 60647",
        isPrimary: true,
        sortOrder: 1,
    },
    {
        id: "ec2",
        name: "Chicago, IL - Admissions",
        relationship: "Admissions",
        phone: "(773)151-2222",
        address: "1101 West Lawrence Avenue, Chicago, IL 60640",
        isPrimary: false,
        sortOrder: 2,
    },
    {
        id: "ec3",
        name: "PhonePerson",
        relationship: "Admissions",
        phone: "(312)555-0198",
        address: "456 North State Street, Chicago, IL 60654",
        isPrimary: false,
        sortOrder: 3,
    },
];

// Mock data for Related Constituent dropdown
const mockRelatedConstituents = [
    { id: "1135", name: "St. XXXX's High School (1135)" },
    { id: "1138", name: "XXXX Community Academy High School (1138)" },
    { id: "1141", name: "De La Salle Institute (1141)" },
    { id: "1144", name: "Christ the XXXX Jesuit College Preparatory School (1144)" },
    { id: "1145", name: "Chicago Tech Academy (1145)" },
    { id: "1146", name: "XXXX Military Academy (1146)" },
    { id: "1147", name: "Percy XXXX High School (1147)" },
    { id: "1150", name: "XXXX Park Academy/Middle School (1150)" },
    { id: "1154", name: "Queen of the Universe (1154)" },
    { id: "1155", name: "Ridge Academy (1155)" },
    { id: "1156", name: "St. Bede the Venerable (1156)" },
    { id: "1157", name: "St. XXXX (1157)" },
    { id: "1158", name: "XXXX Park Academy/High School (1158)" }
];

// Mock constituent details for pre-filling emergency contacts
const mockConstituentDetails: Record<string, { name: string; phone: string; address: string }> = {
    "1135": { name: "Shaun Fleming", phone: "(408)931-0354", address: "1312 Crescent Avenue, Chicago, IL 60647" },
    "1138": { name: "Maria Gonzalez", phone: "(773)555-0142", address: "2450 West Division Street, Chicago, IL 60622" },
    "1141": { name: "James Patterson", phone: "(312)555-0198", address: "801 South Wabash Avenue, Chicago, IL 60605" },
    "1144": { name: "Linda Chen", phone: "(773)555-0267", address: "3500 South Michigan Avenue, Chicago, IL 60653" },
    "1145": { name: "Robert Williams", phone: "(312)555-0331", address: "1200 West 35th Street, Chicago, IL 60609" },
    "1146": { name: "Patricia Davis", phone: "(773)555-0415", address: "5600 South Cottage Grove Avenue, Chicago, IL 60637" },
    "1147": { name: "Michael Johnson", phone: "(312)555-0489", address: "8150 South Vincennes Avenue, Chicago, IL 60620" },
    "1150": { name: "Jennifer Martinez", phone: "(773)555-0563", address: "4300 North Austin Avenue, Chicago, IL 60634" },
    "1154": { name: "David Brown", phone: "(312)555-0637", address: "7200 South Pulaski Road, Chicago, IL 60629" },
    "1155": { name: "Susan Taylor", phone: "(773)555-0711", address: "6500 North Ridge Boulevard, Chicago, IL 60626" },
    "1156": { name: "Christopher Wilson", phone: "(312)555-0785", address: "8300 South Kedzie Avenue, Chicago, IL 60652" },
    "1157": { name: "Karen Anderson", phone: "(773)555-0859", address: "2900 East 91st Street, Chicago, IL 60617" },
    "1158": { name: "Daniel Thomas", phone: "(312)555-0933", address: "4700 West Irving Park Road, Chicago, IL 60641" },
};

// Relationship types for emergency contacts matching Add Relationship dialog
const EMERGENCY_CONTACT_RELATIONSHIP_TYPES = [
    "Admissions Clinician",
    "Adoptive Brother",
    "Adoptive Daughter",
    "Adoptive Father",
    "Adoptive Granddaughter",
    "Adoptive Grandfather",
    "Adoptive Grandmother",
    "Adoptive Grandson",
    "Adoptive Mother",
    "Adoptive Sister",
    "Adoptive Son",
    "Advisee",
    "Advisor",
    "Aunt",
    "Brother",
    "Case Worker",
    "Cousin",
    "Father",
    "Foster Parent",
    "Grandfather",
    "Grandmother",
    "Grandparent",
    "Guardian",
    "Mother",
    "Other",
    "Sibling",
    "Sister",
    "Uncle",
];

export function RelationshipsSection() {
    // Relationships State
    const [relationships, setRelationships] = useState<Relationship[]>([
        {
            id: "1",
            relatedTo: "1135",
            relationship: "Mother",
            startDate: "2023-01-01",
            endDate: "",
            involvementLevel: "Very Involved",
            relationshipQuality: "Excellent",
            comments: "Strong maternal bond, consistent communication",
            emergencyContact: true,
            legalGuardian: true,
            eligibleForPass: true,
            hasNotes: true,
            emergencyContactSortOrder: 1,
            emergencyContactIsPrimary: true
        },
        {
            id: "2",
            relatedTo: "1138",
            relationship: "Foster Parent",
            startDate: "2023-06-15",
            endDate: "",
            involvementLevel: "Somewhat Involved",
            relationshipQuality: "Good",
            comments: "",
            emergencyContact: true,
            legalGuardian: false,
            eligibleForPass: false,
            hasNotes: false,
            emergencyContactSortOrder: 2,
            emergencyContactIsPrimary: false
        }
    ]);
    const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
    const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
    const [relationshipFormData, setRelationshipFormData] = useState<Partial<Relationship>>({});
    const [showRelationshipNotes, setShowRelationshipNotes] = useState<string | null>(null);

    // Constituent State
    const [isConstituentDialogOpen, setIsConstituentDialogOpen] = useState(false);
    const [constituentFormData, setConstituentFormData] = useState<Partial<Constituent>>({});

    // Search State
    const [relationshipsSearchTerm, setRelationshipsSearchTerm] = useState("");

    // Emergency Contacts State (for popup inline editing only)
    const [isEmergencyContactDialogOpen, setIsEmergencyContactDialogOpen] = useState(false);
    const [inlineEditingECId, setInlineEditingECId] = useState<string | null>(null);
    const [isAddingInlineEC, setIsAddingInlineEC] = useState(false);
    const [inlineECEditData, setInlineECEditData] = useState<{
        name: string;
        relationship: string;
        phone: string;
        address: string;
    }>({ name: "", relationship: "", phone: "", address: "" });
    const [inlineECAddData, setInlineECAddData] = useState<{
        name: string;
        relationship: string;
        phone: string;
        address: string;
    }>({ name: "", relationship: "", phone: "", address: "" });

    // Standalone Emergency Contacts State (for the main section, not popup)
    const [inlineEditingECIdStandalone, setInlineEditingECIdStandalone] = useState<string | null>(null);
    const [isAddingInlineECStandalone, setIsAddingInlineECStandalone] = useState(false);
    const [inlineECEditDataStandalone, setInlineECEditDataStandalone] = useState<{
        name: string;
        relationship: string;
        phone: string;
        address: string;
    }>({ name: "", relationship: "", phone: "", address: "" });
    const [inlineECAddDataStandalone, setInlineECAddDataStandalone] = useState<{
        sortOrder?: number;
        relationship: string;
    }>({ relationship: "" });

    // Confirmation Dialog State for Emergency Contact Deletion
    const [isDeleteECConfirmOpen, setIsDeleteECConfirmOpen] = useState(false);
    const [deletingECId, setDeletingECId] = useState<string | null>(null);

    // Selection Dialog State for Adding Emergency Contact from Existing Relationships
    const [isSelectRelationshipDialogOpen, setIsSelectRelationshipDialogOpen] = useState(false);
    const [selectedRelationshipForEC, setSelectedRelationshipForEC] = useState<string>("");

    // Primary Conflict Resolution State
    const [isPrimaryConflictDialogOpen, setIsPrimaryConflictDialogOpen] = useState(false);
    const [newPrimaryId, setNewPrimaryId] = useState<string | null>(null);

    // Compute Emergency Contacts from Relationships
    const emergencyContacts: EmergencyContact[] = useMemo(() => {
        return relationships
            .filter(rel => rel.emergencyContact)
            .map(rel => {
                const constituent = mockConstituentDetails[rel.relatedTo];
                return {
                    id: rel.id,
                    name: constituent?.name || "Unknown",
                    relationship: rel.relationship,
                    phone: constituent?.phone || "",
                    address: constituent?.address || "",
                    isPrimary: rel.emergencyContactIsPrimary || false,
                    sortOrder: rel.emergencyContactSortOrder || 999
                };
            })
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }, [relationships]);

    // Compute available relationships that can be added as emergency contacts
    const availableRelationshipsForEC = useMemo(() => {
        return relationships
            .filter(rel => !rel.emergencyContact)
            .map(rel => {
                const constituent = mockConstituentDetails[rel.relatedTo];
                const constituentInfo = mockRelatedConstituents.find(c => c.id === rel.relatedTo);
                return {
                    id: rel.id,
                    name: constituent?.name || constituentInfo?.name || "Unknown",
                    relationship: rel.relationship,
                    phone: constituent?.phone || "",
                    address: constituent?.address || ""
                };
            });
    }, [relationships]);

    // Compute the next available constituent for inline add
    const nextAvailableConstituent = useMemo(() => {
        const constituents = Object.entries(mockConstituentDetails).map(([id, details]) => ({ id, ...details }));
        const usedConstituentIds = relationships.filter(r => r.emergencyContact).map(r => r.relatedTo);
        const available = constituents.find(c => !usedConstituentIds.includes(c.id));
        return available || constituents[0];
    }, [relationships]);

    // Relationship Handlers
    const handleAddRelationship = () => {
        setEditingRelationship(null);
        setRelationshipFormData({ emergencyContact: false });
        setIsRelationshipDialogOpen(true);
    };

    const handleEditRelationship = (relationship: Relationship) => {
        setEditingRelationship(relationship);
        setRelationshipFormData(relationship);
        setIsRelationshipDialogOpen(true);
    };

    const handleSaveRelationship = () => {
        if (!relationshipFormData.relationship || !relationshipFormData.relatedTo) {
            return;
        }

        if (editingRelationship) {
            setRelationships(relationships.map(r => 
                r.id === editingRelationship.id 
                    ? { ...editingRelationship, ...relationshipFormData } as Relationship
                    : r
            ));

        } else {
            // Calculate next sort order if this is an emergency contact
            let sortOrder: number | undefined;
            let isPrimary = false;
            
            if (relationshipFormData.emergencyContact) {
                const maxSortOrder = emergencyContacts.length > 0
                    ? Math.max(...emergencyContacts.map(ec => ec.sortOrder))
                    : 0;
                sortOrder = maxSortOrder + 1;
                isPrimary = emergencyContacts.length === 0; // First one becomes primary
            }

            const newRelationship: Relationship = {
                id: Date.now().toString(),
                relatedTo: relationshipFormData.relatedTo || "",
                relationship: relationshipFormData.relationship || "",
                startDate: relationshipFormData.startDate || "",
                endDate: relationshipFormData.endDate || "",
                involvementLevel: relationshipFormData.involvementLevel || "",
                relationshipQuality: relationshipFormData.relationshipQuality || "",
                comments: relationshipFormData.comments || "",
                emergencyContact: relationshipFormData.emergencyContact || false,
                emergencyContactSortOrder: sortOrder,
                emergencyContactIsPrimary: isPrimary,
                legalGuardian: relationshipFormData.legalGuardian || false,
                eligibleForPass: relationshipFormData.eligibleForPass || false,
                hasNotes: relationshipFormData.hasNotes || false
            };
            setRelationships([...relationships, newRelationship]);

        }
        setIsRelationshipDialogOpen(false);
        setRelationshipFormData({});
    };

    const handleDeleteRelationship = (id: string) => {
        setRelationships(relationships.filter(r => r.id !== id));

    };

    // Constituent Handlers
    const handleAddConstituent = () => {
        setConstituentFormData({});
        setIsConstituentDialogOpen(true);
    };

    const handleSaveConstituent = () => {
        if (!constituentFormData.firstName || !constituentFormData.lastName || !constituentFormData.constituentType) {
            return;
        }

        setIsConstituentDialogOpen(false);
        setConstituentFormData({});
    };

    // Emergency Contact Handlers
    const handleAddEmergencyContact = () => {
        if (isAddingInlineEC || inlineEditingECId) return;
        const selectedId = relationshipFormData.relatedTo || "";
        const details = mockConstituentDetails[selectedId];
        // If a constituent is selected and found in lookup, use it; otherwise fall back to first available entry
        const fallbackDetails = Object.values(mockConstituentDetails)[0];
        const resolvedDetails = details || fallbackDetails;
        setInlineECAddData({
            name: resolvedDetails?.name || "",
            relationship: "",
            phone: resolvedDetails?.phone || "",
            address: resolvedDetails?.address || "",
        });
        setIsAddingInlineEC(true);
    };

    const handleEditEmergencyContact = (contact: EmergencyContact) => {
        if (isAddingInlineEC || inlineEditingECId) return;
        setInlineECEditData({
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            address: contact.address,
        });
        setInlineEditingECId(contact.id);
    };

    const handleSaveInlineECEdit = () => {
        if (!inlineECEditData.relationship) {
            return;
        }
        // Update the relationship's relationship type
        setRelationships(relationships.map(rel =>
            rel.id === inlineEditingECId
                ? { ...rel, relationship: inlineECEditData.relationship }
                : rel
        ));
        setInlineEditingECId(null);
    };

    const handleCancelInlineECEdit = () => {
        setInlineEditingECId(null);
    };

    const handleSaveInlineECAdd = () => {
        if (!inlineECAddData.relationship) {
            return;
        }
        // This is for adding emergency contacts within the popup - not implemented yet
        // For now, just close the inline add
        setIsAddingInlineEC(false);
        setInlineECAddData({ name: "", relationship: "", phone: "", address: "" });
    };

    const handleCancelInlineECAdd = () => {
        setIsAddingInlineEC(false);
        setInlineECAddData({ name: "", relationship: "", phone: "", address: "" });
    };

    const handleDeleteEmergencyContact = (id: string) => {
        // Check if this is the Primary contact
        const contactToDelete = relationships.find(rel => rel.id === id);
        const isPrimary = contactToDelete?.emergencyContactIsPrimary;
        
        // Show confirmation dialog
        setDeletingECId(id);
        setIsDeleteECConfirmOpen(true);
    };

    const handleConfirmDeleteEmergencyContact = () => {
        if (deletingECId) {
            const contactToDelete = relationships.find(rel => rel.id === deletingECId);
            const isPrimary = contactToDelete?.emergencyContactIsPrimary;
            
            // If deleting primary, auto-assign next contact as primary
            setRelationships(prevRelationships => {
                const updatedRelationships = prevRelationships.map(rel =>
                    rel.id === deletingECId
                        ? { ...rel, emergencyContact: false, emergencyContactSortOrder: undefined, emergencyContactIsPrimary: undefined }
                        : rel
                );
                
                // If we deleted the primary, find the next emergency contact and make it primary
                if (isPrimary) {
                    const remainingECs = updatedRelationships
                        .filter(rel => rel.emergencyContact)
                        .sort((a, b) => (a.emergencyContactSortOrder || 999) - (b.emergencyContactSortOrder || 999));
                    
                    if (remainingECs.length > 0) {
                        const nextPrimaryId = remainingECs[0].id;
                        return updatedRelationships.map(rel =>
                            rel.id === nextPrimaryId
                                ? { ...rel, emergencyContactIsPrimary: true }
                                : rel
                        );
                    }
                }
                
                return updatedRelationships;
            });
        }
        // Close dialog and reset
        setIsDeleteECConfirmOpen(false);
        setDeletingECId(null);
    };

    const handleCancelDeleteEmergencyContact = () => {
        setIsDeleteECConfirmOpen(false);
        setDeletingECId(null);
    };

    const handleSetPrimaryContact = (id: string) => {
        // Check if there's already a primary contact
        const currentPrimary = relationships.find(rel => rel.emergencyContact && rel.emergencyContactIsPrimary);
        
        if (currentPrimary && currentPrimary.id !== id) {
            // Show conflict dialog
            setNewPrimaryId(id);
            setIsPrimaryConflictDialogOpen(true);
        } else {
            // No conflict, proceed with setting primary
            setRelationships(relationships.map(rel => {
                if (rel.emergencyContact) {
                    return {
                        ...rel,
                        emergencyContactIsPrimary: rel.id === id
                    };
                }
                return rel;
            }));
        }
    };

    const handleConfirmPrimaryChange = () => {
        if (!newPrimaryId) return;

        // Find the current primary and the new primary contacts
        const currentPrimary = relationships.find(rel => rel.emergencyContact && rel.emergencyContactIsPrimary);
        const newPrimary = relationships.find(rel => rel.id === newPrimaryId);

        // Update primary status and swap sort orders
        setRelationships(relationships.map(rel => {
            if (rel.emergencyContact) {
                if (rel.id === newPrimaryId) {
                    // New primary gets the old primary's sort order (or 1 if no current primary)
                    return {
                        ...rel,
                        emergencyContactIsPrimary: true,
                        emergencyContactSortOrder: currentPrimary?.emergencyContactSortOrder || 1
                    };
                } else if (rel.id === currentPrimary?.id) {
                    // Old primary gets the new primary's sort order
                    return {
                        ...rel,
                        emergencyContactIsPrimary: false,
                        emergencyContactSortOrder: newPrimary?.emergencyContactSortOrder || 2
                    };
                } else {
                    // Remove primary status from all others
                    return {
                        ...rel,
                        emergencyContactIsPrimary: false
                    };
                }
            }
            return rel;
        }));

        // Close dialog and reset
        setIsPrimaryConflictDialogOpen(false);
        setNewPrimaryId(null);
    };

    const handleSortOrderChange = (contactId: string, newOrder: number) => {
        const contact = emergencyContacts.find(ec => ec.id === contactId);
        
        if (!contact) return;

        // Primary should never reach here (dropdown is disabled), but safety check
        if (contact.isPrimary && newOrder !== 1) {
            return;
        }

        // Check if sort order already exists
        const existingContact = emergencyContacts.find(ec => ec.sortOrder === newOrder && ec.id !== contactId);
        
        if (existingContact) {
            // Automatically swap positions
            setRelationships(relationships.map(rel => {
                if (rel.id === contactId) {
                    return { ...rel, emergencyContactSortOrder: newOrder };
                }
                if (rel.id === existingContact.id) {
                    return { ...rel, emergencyContactSortOrder: contact.sortOrder };
                }
                return rel;
            }));
        } else {
            // No conflict, update sort order
            setRelationships(relationships.map(rel =>
                rel.id === contactId
                    ? { ...rel, emergencyContactSortOrder: newOrder }
                    : rel
            ));
        }
    };

    // Standalone Emergency Contacts Handlers
    const handleAddEmergencyContactStandalone = () => {
        // Open selection dialog to choose from existing relationships
        setSelectedRelationshipForEC("");
        setIsSelectRelationshipDialogOpen(true);
    };

    const handleSelectRelationshipForEC = () => {
        if (!selectedRelationshipForEC) return;

        // Calculate next sort order
        const maxSortOrder = emergencyContacts.length > 0
            ? Math.max(...emergencyContacts.map(ec => ec.sortOrder))
            : 0;
        const nextSortOrder = maxSortOrder + 1;

        // Mark the selected relationship as an emergency contact
        setRelationships(relationships.map(rel =>
            rel.id === selectedRelationshipForEC
                ? {
                    ...rel,
                    emergencyContact: true,
                    emergencyContactSortOrder: nextSortOrder,
                    emergencyContactIsPrimary: emergencyContacts.length === 0 // First one becomes primary
                }
                : rel
        ));

        // Close dialog and reset
        setIsSelectRelationshipDialogOpen(false);
        setSelectedRelationshipForEC("");
    };

    const handleCreateNewRelationshipFromEC = () => {
        // Close the selection dialog
        setIsSelectRelationshipDialogOpen(false);
        // Open the add relationship dialog
        setEditingRelationship(null);
        setRelationshipFormData({ emergencyContact: true }); // Pre-check emergency contact
        setIsRelationshipDialogOpen(true);
    };

    const handleRemoveEmergencyContact = (id: string) => {
        // This is the new "Remove" logic that checks Primary guard
        const contactToRemove = relationships.find(rel => rel.id === id);
        const isPrimary = contactToRemove?.emergencyContactIsPrimary;
        
        // Show confirmation dialog with Primary guard logic
        setDeletingECId(id);
        setIsDeleteECConfirmOpen(true);
    };

    const handleEditEmergencyContactStandalone = (contact: EmergencyContact) => {
        // No longer used - fields are read-only
        // Keeping for backwards compatibility but it does nothing
        return;
    };

    const handleSaveInlineECEditStandalone = () => {
        // No longer used - removed inline editing
        return;
    };

    const handleCancelInlineECEditStandalone = () => {
        setInlineEditingECIdStandalone(null);
    };

    const handleSaveInlineECAddStandalone = () => {
        // No longer used - using selection dialog instead
        return;
    };

    const handleCancelInlineECAddStandalone = () => {
        setIsAddingInlineECStandalone(false);
        setInlineECAddDataStandalone({ relationship: "" });
    };

    // Filter relationships based on search term
    const filteredRelationships = relationships.filter(relationship => {
        if (!relationshipsSearchTerm) return true;
        const search = relationshipsSearchTerm.toLowerCase();
        const relatedConstituent = mockRelatedConstituents.find(c => c.id === relationship.relatedTo);
        return (
            relationship.relationship.toLowerCase().includes(search) ||
            (relatedConstituent?.name || "").toLowerCase().includes(search) ||
            relationship.startDate.toLowerCase().includes(search) ||
            relationship.endDate.toLowerCase().includes(search)
        );
    });



    return (
        <div className="space-y-6 max-w-full">
            {/* Relationships Card */}
            <div 
              className="overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: 'var(--slds-c-card-radius-border)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
                <div 
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-alt)'
                  }}
                >
                    <h3 className="text-[13px] font-semibold text-[#080707]">Relationships</h3>
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={relationshipsSearchTerm}
                                onChange={(e) => setRelationshipsSearchTerm(e.target.value)}
                                className="h-8 pl-9 pr-3 w-64 text-[12px]"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                }}
                            />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-full text-[12px]"
                          onClick={handleAddConstituent}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Constituent
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-full text-[12px]"
                          onClick={handleAddRelationship}
                          style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                          }}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Relationship
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {filteredRelationships.length === 0 ? (
                        <div 
                          className="text-[13px] text-center py-8"
                          style={{ color: 'var(--slds-g-color-text-weak)' }}
                        >
                            {relationshipsSearchTerm ? 'No relationships match your search.' : 'No relationships recorded yet.'}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        RELATED TO
                                    </th>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        RELATIONSHIP
                                    </th>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        START DATE
                                    </th>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        END DATE
                                    </th>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        INVOLVEMENT
                                    </th>

                                    <th className="px-4 py-2 text-center text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        EMERGENCY CONTACT
                                    </th>
                                    <th className="px-4 py-2 text-center text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        LEGAL GUARDIAN
                                    </th>
                                    <th className="px-4 py-2 text-center text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        ELIGIBLE FOR PASS
                                    </th>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRelationships.map((relationship) => {
                                    const relatedConstituent = mockRelatedConstituents.find(c => c.id === relationship.relatedTo);
                                    return (
                                    <tr key={relationship.id}>
                                        <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <a 
                                                href="#" 
                                                className="text-[#0176d3] hover:text-[#014486] hover:underline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    // Handle navigation or action here
                                                }}
                                            >
                                                {relatedConstituent?.name || '\u2014'}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            {relationship.relationship}
                                        </td>
                                        <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            {relationship.startDate}
                                        </td>
                                        <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            {relationship.endDate || '\u2014'}
                                        </td>
                                        <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            {relationship.involvementLevel || '\u2014'}
                                        </td>

                                        <td className="px-4 py-3 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={relationship.emergencyContact} 
                                                disabled
                                                className="cursor-default"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={relationship.legalGuardian} 
                                                disabled
                                                className="cursor-default"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={relationship.eligibleForPass} 
                                                disabled
                                                className="cursor-default"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-[13px]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditRelationship(relationship)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Emergency Contacts Card */}
            <div 
              className="overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: 'var(--slds-c-card-radius-border)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >
                <div 
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                    backgroundColor: 'var(--slds-g-color-background-alt)'
                  }}
                >
                    <h3 className="text-[13px] font-semibold text-[#080707]">Emergency Contacts</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 rounded-full text-[12px]"
                      onClick={handleAddEmergencyContactStandalone}
                      style={{
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                      }}
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '15%' }}>
                                    SORT ORDER
                                </th>
                                <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '18%' }}>
                                    NAME
                                </th>
                                <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '15%' }}>
                                    RELATIONSHIP
                                </th>
                                <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '14%' }}>
                                    PHONE
                                </th>
                                <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '25%' }}>
                                    ADDRESS
                                </th>
                                <th className="px-4 py-2 text-right text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)', width: '13%' }}>
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Existing Contacts - All fields read-only except Sort Order */}
                            {[...emergencyContacts].sort((a, b) => {
                                // Primary contact always comes first
                                if (a.isPrimary) return -1;
                                if (b.isPrimary) return 1;
                                // Otherwise sort by sortOrder
                                return a.sortOrder - b.sortOrder;
                            }).map((contact, index, array) => {
                                return (
                                <tr key={contact.id} className="border-b border-[#e5e5e4] hover:bg-[#fafaf9]">
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-1.5">
                                            <Select
                                                value={String(contact.sortOrder)}
                                                onValueChange={(value) => handleSortOrderChange(contact.id, parseInt(value))}
                                                disabled={contact.isPrimary}
                                            >
                                                <SelectTrigger className="h-7 w-16 text-[12px] px-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contact.isPrimary ? (
                                                        <SelectItem value="1" className="text-[12px]">1</SelectItem>
                                                    ) : (
                                                        Array.from({ length: emergencyContacts.length }, (_, i) => i + 1)
                                                            .filter(pos => pos !== 1)
                                                            .map(pos => (
                                                                <SelectItem key={pos} value={String(pos)} className="text-[12px]">
                                                                    {pos}
                                                                </SelectItem>
                                                            ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {contact.isPrimary && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#e6f2eb] text-[#145F33] whitespace-nowrap">Primary</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-[#080707] font-medium text-[12px] truncate" title={contact.name}>
                                        <a 
                                            href="#" 
                                            className="text-[#0176d3] hover:text-[#014486] hover:underline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Navigate to Person record for viewing/editing
                                                console.log("Navigate to person record:", contact.name);
                                            }}
                                        >
                                            {contact.name}
                                        </a>
                                    </td>
                                    <td className="px-4 py-2 text-[#3e3e3c] text-[12px] truncate" title={contact.relationship}>{contact.relationship}</td>
                                    <td className="px-4 py-2 text-[#3e3e3c] text-[12px] whitespace-nowrap">{contact.phone}</td>
                                    <td className="px-4 py-2 text-[#3e3e3c] text-[12px] truncate" title={contact.address}>{contact.address}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2 justify-end">
                                            {!contact.isPrimary && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetPrimaryContact(contact.id)}
                                                    className="text-[11px] text-[#145F33] hover:underline font-medium whitespace-nowrap"
                                                    title="Set as primary"
                                                >
                                                    Set Primary
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEmergencyContact(contact.id)}
                                                className="p-1 hover:bg-[#fef7f6] rounded transition-colors"
                                                title="Remove from emergency contacts"
                                            >
                                                <XIcon className="h-3.5 w-3.5 text-[#c23934]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                            {/* Empty State */}
                            {emergencyContacts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-[#706e6b] text-[13px]">
                                        No emergency contacts added. Click "Add" to select from existing relationships.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Relationship Dialog */}
            <Dialog open={isRelationshipDialogOpen} onOpenChange={setIsRelationshipDialogOpen}>
                <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[1500px] max-h-[95vh] overflow-y-auto p-6" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{editingRelationship ? "Edit Relationship" : "Add Relationship"}</DialogTitle>
                        <DialogDescription>
                            {editingRelationship ? "Update the relationship details below." : "Enter the relationship details below."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="relatedTo" className="text-[13px]">
                                Related to <span className="text-red-600">*</span>
                            </Label>
                            <Select
                                value={relationshipFormData.relatedTo || ""}
                                onValueChange={(value) => setRelationshipFormData({ ...relationshipFormData, relatedTo: value })}
                            >
                                <SelectTrigger className="text-[13px]">
                                    <SelectValue placeholder="Select constituent" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockRelatedConstituents.map((constituent) => (
                                        <SelectItem key={constituent.id} value={constituent.id} className="text-[13px]">
                                            {constituent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="relationship" className="text-[13px]">
                                Relationship <span className="text-red-600">*</span>
                            </Label>
                            <Select
                                value={relationshipFormData.relationship || ""}
                                onValueChange={(value) => setRelationshipFormData({ ...relationshipFormData, relationship: value })}
                            >
                                <SelectTrigger className="text-[13px]">
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admissions Clinician" className="text-[13px]">Admissions Clinician</SelectItem>
                                    <SelectItem value="Adoptive Brother" className="text-[13px]">Adoptive Brother</SelectItem>
                                    <SelectItem value="Adoptive Daughter" className="text-[13px]">Adoptive Daughter</SelectItem>
                                    <SelectItem value="Adoptive Father" className="text-[13px]">Adoptive Father</SelectItem>
                                    <SelectItem value="Adoptive Granddaughter" className="text-[13px]">Adoptive Granddaughter</SelectItem>
                                    <SelectItem value="Adoptive Grandfather" className="text-[13px]">Adoptive Grandfather</SelectItem>
                                    <SelectItem value="Adoptive Grandmother" className="text-[13px]">Adoptive Grandmother</SelectItem>
                                    <SelectItem value="Adoptive Grandson" className="text-[13px]">Adoptive Grandson</SelectItem>
                                    <SelectItem value="Adoptive Mother" className="text-[13px]">Adoptive Mother</SelectItem>
                                    <SelectItem value="Adoptive Sister" className="text-[13px]">Adoptive Sister</SelectItem>
                                    <SelectItem value="Adoptive Son" className="text-[13px]">Adoptive Son</SelectItem>
                                    <SelectItem value="Advisee" className="text-[13px]">Advisee</SelectItem>
                                    <SelectItem value="Advisor" className="text-[13px]">Advisor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="startDate" className="text-[13px]">Start Date</Label>
                                <DateInput
                                    id="startDate"
value={isoToMdy(relationshipFormData.startDate || "")}
                                    onChange={(v) => ((e) => setRelationshipFormData({ ...relationshipFormData, startDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                    className="text-[13px]"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="endDate" className="text-[13px]">End Date</Label>
                                <DateInput
                                    id="endDate"
value={isoToMdy(relationshipFormData.endDate || "")}
                                    onChange={(v) => ((e) => setRelationshipFormData({ ...relationshipFormData, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                    className="text-[13px]"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="involvementLevel" className="text-[13px]">
                                How involved is the constituent with Alex Doe?
                            </Label>
                            <Select
                                value={relationshipFormData.involvementLevel || ""}
                                onValueChange={(value) => setRelationshipFormData({ ...relationshipFormData, involvementLevel: value })}
                            >
                                <SelectTrigger className="text-[13px]">
                                    <SelectValue placeholder="Select involvement level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Minimal" className="text-[13px]">Minimal</SelectItem>
                                    <SelectItem value="Moderate" className="text-[13px]">Moderate</SelectItem>
                                    <SelectItem value="None" className="text-[13px]">None</SelectItem>
                                    <SelectItem value="Significant" className="text-[13px]">Significant</SelectItem>
                                    <SelectItem value="Deceased" className="text-[13px]">Deceased</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="relationshipQuality" className="text-[13px]">
                                Quality of Relationship
                            </Label>
                            <Select
                                value={relationshipFormData.relationshipQuality || ""}
                                onValueChange={(value) => setRelationshipFormData({ ...relationshipFormData, relationshipQuality: value })}
                            >
                                <SelectTrigger className="text-[13px]">
                                    <SelectValue placeholder="Select quality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Positive" className="text-[13px]">Positive</SelectItem>
                                    <SelectItem value="Negative" className="text-[13px]">Negative</SelectItem>
                                    <SelectItem value="Enmeshed" className="text-[13px]">Enmeshed</SelectItem>
                                    <SelectItem value="Turbulent" className="text-[13px]">Turbulent</SelectItem>
                                    <SelectItem value="Distant" className="text-[13px]">Distant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="comments" className="text-[13px]">
                                Comments and other Relationship details
                            </Label>
                            <Textarea
                                id="comments"
                                value={relationshipFormData.comments || ""}
                                onChange={(e) => setRelationshipFormData({ ...relationshipFormData, comments: e.target.value })}
                                className="text-[13px] min-h-[100px]"
                                placeholder="Enter any additional comments or details about the relationship"
                            />
                        </div>

                        {/* Checkboxes Row */}
                        <div className="space-y-3 pt-4 border-t border-[#dddbda]">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="legalGuardian"
                                        checked={relationshipFormData.legalGuardian || false}
                                        onCheckedChange={(checked) => setRelationshipFormData({ ...relationshipFormData, legalGuardian: !!checked })}
                                    />
                                    <Label htmlFor="legalGuardian" className="text-[13px] cursor-pointer">
                                        Legal Guardian
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="eligibleForPass"
                                        checked={relationshipFormData.eligibleForPass || false}
                                        onCheckedChange={(checked) => setRelationshipFormData({ ...relationshipFormData, eligibleForPass: !!checked })}
                                    />
                                    <Label htmlFor="eligibleForPass" className="text-[13px] cursor-pointer">
                                        Eligible for Pass
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRelationshipDialogOpen(false)}
                            className="rounded-full text-[13px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveRelationship}
                            className="rounded-full text-[13px]"
                            style={{ backgroundColor: '#145F33' }}
                        >
                            <Save className="h-3.5 w-3.5 mr-1" />
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Relationship Notes Dialog */}
            <Dialog open={!!showRelationshipNotes} onOpenChange={() => setShowRelationshipNotes(null)}>
                <DialogContent className="sm:max-w-xl" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Relationship Notes</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {relationships.find(r => r.id === showRelationshipNotes)?.comments || "No notes available."}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRelationshipNotes(null)}
                            className="rounded-full text-[13px]"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Constituent Dialog */}
            <Dialog open={isConstituentDialogOpen} onOpenChange={setIsConstituentDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Constituent</DialogTitle>
                        <DialogDescription>
                            Enter the constituent details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="constituentType" className="text-[13px]">
                                Constituent Type <span className="text-red-600">*</span>
                            </Label>
                            <Select
                                value={constituentFormData.constituentType || ""}
                                onValueChange={(value) => setConstituentFormData({ ...constituentFormData, constituentType: value })}
                            >
                                <SelectTrigger className="text-[13px]">
                                    <SelectValue placeholder="Select constituent type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Individual" className="text-[13px]">Individual</SelectItem>
                                    <SelectItem value="Organization" className="text-[13px]">Organization</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName" className="text-[13px]">
                                    First Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="firstName"
                                    value={constituentFormData.firstName || ""}
                                    onChange={(e) => setConstituentFormData({ ...constituentFormData, firstName: e.target.value })}
                                    className="text-[13px]"
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName" className="text-[13px]">
                                    Last Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="lastName"
                                    value={constituentFormData.lastName || ""}
                                    onChange={(e) => setConstituentFormData({ ...constituentFormData, lastName: e.target.value })}
                                    className="text-[13px]"
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        {/* Relationship text display */}
                        <div className="flex items-center gap-2 text-[13px]">
                            <span>
                                {constituentFormData.firstName || constituentFormData.lastName 
                                    ? `${constituentFormData.firstName || ""} ${constituentFormData.lastName || ""}`.trim() + " is the"
                                    : "Constituent is the"}
                            </span>
                            <Select
                                value={constituentFormData.relationship || ""}
                                onValueChange={(value) => setConstituentFormData({ ...constituentFormData, relationship: value })}
                            >
                                <SelectTrigger className="text-[13px] w-[200px]">
                                    <SelectValue placeholder="Please Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Advocatee" className="text-[13px]">Advocatee</SelectItem>
                                    <SelectItem value="After School Programs Coordinator" className="text-[13px]">After School Programs Coordinator</SelectItem>
                                    <SelectItem value="Asst. Principal" className="text-[13px]">Asst. Principal</SelectItem>
                                    <SelectItem value="Attendance Officer" className="text-[13px]">Attendance Officer</SelectItem>
                                    <SelectItem value="Aunt" className="text-[13px]">Aunt</SelectItem>
                                    <SelectItem value="Brother" className="text-[13px]">Brother</SelectItem>
                                    <SelectItem value="Brother-in-law" className="text-[13px]">Brother-in-law</SelectItem>
                                    <SelectItem value="Business Associate" className="text-[13px]">Business Associate</SelectItem>
                                    <SelectItem value="Boyfriend" className="text-[13px]">Boyfriend</SelectItem>
                                    <SelectItem value="Career Resources Coordinator" className="text-[13px]">Career Resources Coordinator</SelectItem>
                                    <SelectItem value="Admissions Case Manager" className="text-[13px]">Admissions Case Manager</SelectItem>
                                    <SelectItem value="Case Worker" className="text-[13px]">Case Worker</SelectItem>
                                    <SelectItem value="Admissions Clinician" className="text-[13px]">Admissions Clinician</SelectItem>
                                    <SelectItem value="Mother" className="text-[13px]">Mother</SelectItem>
                                    <SelectItem value="Father" className="text-[13px]">Father</SelectItem>
                                    <SelectItem value="Parent" className="text-[13px]">Parent</SelectItem>
                                    <SelectItem value="Guardian" className="text-[13px]">Guardian</SelectItem>
                                    <SelectItem value="Sibling" className="text-[13px]">Sibling</SelectItem>
                                    <SelectItem value="Grandparent" className="text-[13px]">Grandparent</SelectItem>
                                    <SelectItem value="Foster Parent" className="text-[13px]">Foster Parent</SelectItem>
                                    <SelectItem value="Other" className="text-[13px]">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-red-600">of Alex Doe</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="constituentLegalGuardian"
                                    checked={constituentFormData.legalGuardian || false}
                                    onCheckedChange={(checked) => setConstituentFormData({ ...constituentFormData, legalGuardian: !!checked })}
                                />
                                <Label htmlFor="constituentLegalGuardian" className="text-[13px] cursor-pointer">
                                    Legal Guardian
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="constituentEligibleForPass"
                                    checked={constituentFormData.eligibleForPass || false}
                                    onCheckedChange={(checked) => setConstituentFormData({ ...constituentFormData, eligibleForPass: !!checked })}
                                />
                                <Label htmlFor="constituentEligibleForPass" className="text-[13px] cursor-pointer">
                                    Eligible For Pass
                                </Label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="constituentStartDate" className="text-[13px]">Start Date</Label>
                                <DateInput
                                    id="constituentStartDate"
value={isoToMdy(constituentFormData.startDate || "")}
                                    onChange={(v) => ((e) => setConstituentFormData({ ...constituentFormData, startDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                    className="text-[13px]"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="constituentEndDate" className="text-[13px]">End Date</Label>
                                <DateInput
                                    id="constituentEndDate"
value={isoToMdy(constituentFormData.endDate || "")}
                                    onChange={(v) => ((e) => setConstituentFormData({ ...constituentFormData, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                    className="text-[13px]"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="constituentActiveStatus" className="text-[13px]">Is this an active constituent?</Label>
                            <Select
                                value={constituentFormData.isActiveConstituent || ""}
                                onValueChange={(value) => setConstituentFormData({ ...constituentFormData, isActiveConstituent: value })}
                            >
                                <SelectTrigger className="text-[13px]">
                                    <SelectValue placeholder="Please Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Yes" className="text-[13px]">Yes</SelectItem>
                                    <SelectItem value="No" className="text-[13px]">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {constituentFormData.isActiveConstituent === "Yes" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="constituentRole" className="text-[13px]">Role</Label>
                                <Select
                                    value={constituentFormData.role || ""}
                                    onValueChange={(value) => setConstituentFormData({ ...constituentFormData, role: value })}
                                >
                                    <SelectTrigger className="text-[13px]">
                                        <SelectValue placeholder="Please Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Primary Contact" className="text-[13px]">Primary Contact</SelectItem>
                                        <SelectItem value="Emergency Contact" className="text-[13px]">Emergency Contact</SelectItem>
                                        <SelectItem value="Case Manager" className="text-[13px]">Case Manager</SelectItem>
                                        <SelectItem value="Therapist" className="text-[13px]">Therapist</SelectItem>
                                        <SelectItem value="Other" className="text-[13px]">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="roleStartDate" className="text-[13px]">Start Date</Label>
                                <DateInput
                                    id="roleStartDate"
value={isoToMdy(constituentFormData.roleStartDate || "")}
                                    onChange={(v) => ((e) => setConstituentFormData({ ...constituentFormData, roleStartDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                    className="text-[13px]"
                                />
                            </div>
                        </div>
                        )}

                        {/* Phone Info Section */}
                        <div className="grid gap-2">
                            <Label className="text-[13px] font-semibold">
                                Phone Info
                            </Label>
                            <div className="grid gap-4 p-3 border border-[#dddbda] rounded">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone" className="text-[13px]">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={constituentFormData.phone || ""}
                                            onChange={(e) => setConstituentFormData({ ...constituentFormData, phone: e.target.value })}
                                            className="text-[13px]"
                                            placeholder="(xxx)xxx-xxxx"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phoneExtension" className="text-[13px]">Extension</Label>
                                        <Input
                                            id="phoneExtension"
                                            value={constituentFormData.phoneExtension || ""}
                                            onChange={(e) => setConstituentFormData({ ...constituentFormData, phoneExtension: e.target.value })}
                                            className="text-[13px]"
                                            placeholder="Enter extension"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phoneType" className="text-[13px]">Phone Type</Label>
                                    <Select
                                        value={constituentFormData.phoneType || ""}
                                        onValueChange={(value) => setConstituentFormData({ ...constituentFormData, phoneType: value })}
                                    >
                                        <SelectTrigger className="text-[13px]">
                                            <SelectValue placeholder="Please Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mobile" className="text-[13px]">Mobile</SelectItem>
                                            <SelectItem value="Home" className="text-[13px]">Home</SelectItem>
                                            <SelectItem value="Work" className="text-[13px]">Work</SelectItem>
                                            <SelectItem value="Other" className="text-[13px]">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Email Info Section */}
                        <div className="grid gap-2">
                            <Label className="text-[13px] font-semibold">
                                Email Info
                            </Label>
                            <div className="grid gap-4 p-3 border border-[#dddbda] rounded">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-[13px]">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={constituentFormData.email || ""}
                                            onChange={(e) => setConstituentFormData({ ...constituentFormData, email: e.target.value })}
                                            className="text-[13px]"
                                            placeholder="Enter email"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="emailType" className="text-[13px]">Email Type</Label>
                                        <Select
                                            value={constituentFormData.emailType || ""}
                                            onValueChange={(value) => setConstituentFormData({ ...constituentFormData, emailType: value })}
                                        >
                                            <SelectTrigger className="text-[13px]">
                                                <SelectValue placeholder="Please Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Personal" className="text-[13px]">Personal</SelectItem>
                                                <SelectItem value="Work" className="text-[13px]">Work</SelectItem>
                                                <SelectItem value="Other" className="text-[13px]">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Info Section */}
                        <div className="grid gap-2">
                            <Label className="text-[13px] font-semibold">
                                Address Info
                            </Label>
                            <div className="grid gap-4 p-3 border border-[#dddbda] rounded">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="streetAddress" className="text-[13px]">Street Address</Label>
                                            <Input
                                                id="streetAddress"
                                                value={constituentFormData.streetAddress || ""}
                                                onChange={(e) => setConstituentFormData({ ...constituentFormData, streetAddress: e.target.value })}
                                                className="text-[13px]"
                                                placeholder="Enter street address"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="addressType" className="text-[13px]">Address Type</Label>
                                            <Select
                                                value={constituentFormData.addressType || ""}
                                                onValueChange={(value) => setConstituentFormData({ ...constituentFormData, addressType: value })}
                                            >
                                                <SelectTrigger className="text-[13px]">
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Home" className="text-[13px]">Home</SelectItem>
                                                    <SelectItem value="Work" className="text-[13px]">Work</SelectItem>
                                                    <SelectItem value="Mailing" className="text-[13px]">Mailing</SelectItem>
                                                    <SelectItem value="Other" className="text-[13px]">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="addressLine2" className="text-[13px]">Address Line 2</Label>
                                        <Input
                                            id="addressLine2"
                                            value={constituentFormData.addressLine2 || ""}
                                            onChange={(e) => setConstituentFormData({ ...constituentFormData, addressLine2: e.target.value })}
                                            className="text-[13px]"
                                            placeholder="Apartment, suite, etc."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="city" className="text-[13px]">City</Label>
                                            <Input
                                                id="city"
                                                value={constituentFormData.city || ""}
                                                onChange={(e) => setConstituentFormData({ ...constituentFormData, city: e.target.value })}
                                                className="text-[13px]"
                                                placeholder="Enter City"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="state" className="text-[13px]">State</Label>
                                            <Select
                                                value={constituentFormData.state || ""}
                                                onValueChange={(value) => setConstituentFormData({ ...constituentFormData, state: value })}
                                            >
                                                <SelectTrigger className="text-[13px]">
                                                    <SelectValue placeholder="Please Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="IL" className="text-[13px]">Illinois</SelectItem>
                                                    <SelectItem value="CA" className="text-[13px]">California</SelectItem>
                                                    <SelectItem value="NY" className="text-[13px]">New York</SelectItem>
                                                    <SelectItem value="TX" className="text-[13px]">Texas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="zipCode" className="text-[13px]">Zip Code</Label>
                                            <Input
                                                id="zipCode"
                                                value={constituentFormData.zipCode || ""}
                                                onChange={(e) => setConstituentFormData({ ...constituentFormData, zipCode: e.target.value })}
                                                className="text-[13px]"
                                                placeholder="Enter Zip"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="zipPlus4" className="text-[13px]">Zip +4</Label>
                                            <Input
                                                id="zipPlus4"
                                                value={constituentFormData.zipPlus4 || ""}
                                                onChange={(e) => setConstituentFormData({ ...constituentFormData, zipPlus4: e.target.value })}
                                                className="text-[13px]"
                                                placeholder="Enter Zip Plus4"
                                            />
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsConstituentDialogOpen(false)}
                            className="rounded-full text-[13px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveConstituent}
                            className="rounded-full text-[13px]"
                            style={{ backgroundColor: '#145F33' }}
                        >
                            <Save className="h-3.5 w-3.5 mr-1" />
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Emergency Contact Confirmation Dialog */}
            <Dialog open={isDeleteECConfirmOpen} onOpenChange={setIsDeleteECConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    {(() => {
                        const contactToDelete = relationships.find(rel => rel.id === deletingECId);
                        const isPrimary = contactToDelete?.emergencyContactIsPrimary;
                        const remainingECs = emergencyContacts.filter(ec => ec.id !== deletingECId);
                        const nextPrimary = remainingECs.length > 0 ? remainingECs[0] : null;

                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-[15px] font-semibold">
                                        {isPrimary ? 'Remove Primary Emergency Contact' : 'Remove Emergency Contact'}
                                    </DialogTitle>
                                    <DialogDescription className="text-[13px] text-[#3e3e3c]">
                                        {isPrimary ? (
                                            <>
                                                This is the <strong>Primary Emergency Contact</strong>. 
                                                {nextPrimary ? (
                                                    <>
                                                        {' '}If you proceed, <strong>{nextPrimary.name}</strong> will automatically become the new Primary Emergency Contact.
                                                    </>
                                                ) : (
                                                    ' This is the last emergency contact.'
                                                )}
                                            </>
                                        ) : (
                                            'Are you sure you want to remove this person from the Emergency Contact list?'
                                        )}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelDeleteEmergencyContact}
                                        className="rounded-full text-[13px]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirmDeleteEmergencyContact}
                                        className="rounded-full text-[13px] text-white hover:bg-[#c23934]/90"
                                        style={{ backgroundColor: '#c23934' }}
                                    >
                                        Remove
                                    </Button>
                                </DialogFooter>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Select Relationship for Emergency Contact Dialog */}
            <Dialog open={isSelectRelationshipDialogOpen} onOpenChange={setIsSelectRelationshipDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[15px] font-semibold">Add Emergency Contact</DialogTitle>
                        <DialogDescription className="text-[13px] text-[#3e3e3c]">
                            Select an existing relationship to add as an emergency contact.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {availableRelationshipsForEC.length > 0 ? (
                            <>
                                <Label htmlFor="select-relationship" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Select Relationship <span className="text-red-600">*</span>
                                </Label>
                                <Select value={selectedRelationshipForEC} onValueChange={setSelectedRelationshipForEC}>
                                    <SelectTrigger 
                                      id="select-relationship"
                                      className="text-[13px] rounded"
                                      style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        color: 'var(--slds-g-color-text-default)'
                                      }}
                                    >
                                        <SelectValue placeholder="--Select a relationship--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRelationshipsForEC.map((rel) => (
                                            <SelectItem key={rel.id} value={rel.id} className="text-[13px]">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{rel.name}</span>
                                                    <span className="text-[11px] text-[#706e6b]">{rel.relationship}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="mt-4 pt-4 border-t border-[#e5e5e4]">
                                    <p className="text-[12px] text-[#706e6b] mb-2">Don't see the person you're looking for?</p>
                                    <Button
                                        variant="outline"
                                        onClick={handleCreateNewRelationshipFromEC}
                                        className="rounded-full text-[13px]"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                        }}
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        Create New Relationship
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="py-6 text-center">
                                <p className="text-[13px] text-[#706e6b] mb-4">
                                    All existing relationships are already added as emergency contacts.
                                </p>
                                <Button
                                    onClick={handleCreateNewRelationshipFromEC}
                                    className="rounded-full text-[13px]"
                                    style={{ backgroundColor: '#145F33' }}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Create New Relationship
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsSelectRelationshipDialogOpen(false);
                                setSelectedRelationshipForEC("");
                            }}
                            className="rounded-full text-[13px]"
                        >
                            Cancel
                        </Button>
                        {availableRelationshipsForEC.length > 0 && (
                            <Button
                                onClick={handleSelectRelationshipForEC}
                                disabled={!selectedRelationshipForEC}
                                className="rounded-full text-[13px]"
                                style={{ backgroundColor: '#145F33' }}
                            >
                                Add Emergency Contact
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Primary Conflict Dialog */}
            <Dialog open={isPrimaryConflictDialogOpen} onOpenChange={setIsPrimaryConflictDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    {(() => {
                        const currentPrimary = relationships.find(rel => rel.emergencyContact && rel.emergencyContactIsPrimary);
                        const newPrimary = relationships.find(rel => rel.id === newPrimaryId);
                        const currentPrimaryContact = emergencyContacts.find(ec => ec.id === currentPrimary?.id);
                        const newPrimaryContact = emergencyContacts.find(ec => ec.id === newPrimaryId);

                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-[15px] font-semibold">Change Primary Emergency Contact?</DialogTitle>
                                    <DialogDescription className="text-[13px] text-[#3e3e3c]">
                                        <strong>{currentPrimaryContact?.name}</strong> is currently set as the Primary Emergency Contact.
                                        {' '}Would you like to change it to <strong>{newPrimaryContact?.name}</strong>?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsPrimaryConflictDialogOpen(false);
                                            setNewPrimaryId(null);
                                        }}
                                        className="rounded-full text-[13px]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirmPrimaryChange}
                                        className="rounded-full text-[13px]"
                                        style={{ backgroundColor: '#145F33' }}
                                    >
                                        Change Primary
                                    </Button>
                                </DialogFooter>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
