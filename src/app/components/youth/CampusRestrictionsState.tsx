// Campus Restrictions State - To be imported into ProfileContentRenderer.tsx
export const useCampusRestrictionsState = () => {
    const [campusRestrictions, setCampusRestrictions] = useState([
        {
            id: 1,
            type: "Library Access",
            startDate: "2025-01-10",
            endDate: null,
            reason: "Inappropriate behavior during study time. Needs additional supervision before returning to library privileges.",
            implementedBy: "Sarah Johnson, Program Director",
            campusContact: "Mike Stevens",
            restorativeMeasures: "Complete conflict resolution workshop and demonstrate improved behavior for 2 weeks.",
            status: "Active"
        },
        {
            id: 2,
            type: "Gym Access",
            startDate: "2025-01-05",
            endDate: "2025-01-20",
            reason: "Physical altercation with peer during basketball game.",
            implementedBy: "David Martinez, Youth Counselor",
            campusContact: "Tom Bradley",
            restorativeMeasures: "Attend anger management sessions and issue formal apology.",
            status: "Active"
        }
    ]);
    
    const [showRestrictionDialog, setShowRestrictionDialog] = useState(false);
    const [editingRestrictionId, setEditingRestrictionId] = useState<number | null>(null);
    const [restrictionForm, setRestrictionForm] = useState({
        type: "",
        startDate: "",
        endDate: "",
        reason: "",
        implementedBy: "",
        campusContact: "",
        restorativeMeasures: ""
    });

    return {
        campusRestrictions,
        setCampusRestrictions,
        showRestrictionDialog,
        setShowRestrictionDialog,
        editingRestrictionId,
        setEditingRestrictionId,
        restrictionForm,
        setRestrictionForm
    };
};
