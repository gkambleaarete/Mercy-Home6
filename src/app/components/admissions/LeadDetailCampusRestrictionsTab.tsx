import { useState, useMemo, useEffect, useRef } from "react";
import { YouthAlertIcons } from "../youth/YouthAlertIcons";
import { ChevronRight, Plus, User, Users, Building2, Phone, Mail, CheckSquare, Upload, AlertTriangle, Clock, MapPin, CheckCircle, Pencil, Trash2, ChevronDown, FileText, ChevronUp, Check, X as XIcon, ChevronUp as ArrowUp, ChevronDown as ArrowDown, MoreVertical, Download, Eye, File } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { IncidentDetailsDialog } from "../dialogs/IncidentDetailsDialog";
import { LegalInvolvementDialog, LegalInvolvementRecord } from "../dialogs/LegalInvolvementDialog";
import { DCFSInvolvementDialog, DCFSInvolvementRecord } from "../dialogs/DCFSInvolvementDialog";
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
import { ActivityTimeline, TimelineActivity } from "../ActivityTimeline";
import { CaseyLifeSkillsCaregiverFields } from "./CaseyLifeSkillsCaregiverFields";
import { CaseyLifeSkillsYouthFields } from "./CaseyLifeSkillsYouthFields";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface LeadDetailCampusRestrictionsTabProps {
  MHGB_STAFF: any;
  RESTRICTION_TYPES: any;
  YOUTH_CONSTITUENTS: any;
  activeTab: any;
  campusRestrictions: any;
  crDialogOpen: any;
  crEditingId: any;
  crForm: any;
  crSelectedId: any;
  openCrAdd: any;
  openCrModify: any;
  s: any;
  saveCrForm: any;
  setCrDialogOpen: any;
  setCrForm: any;
  setCrSelectedId: any;
}

export function LeadDetailCampusRestrictionsTab({ MHGB_STAFF, RESTRICTION_TYPES, YOUTH_CONSTITUENTS, activeTab, campusRestrictions, crDialogOpen, crEditingId, crForm, crSelectedId, openCrAdd, openCrModify, s, saveCrForm, setCrDialogOpen, setCrForm, setCrSelectedId }: LeadDetailCampusRestrictionsTabProps) {
  return (
    <>
                        {activeTab === "campusRestrictions" && (
                            <div className="space-y-4">
                                {/* Toolbar */}
                                <div
                                    className="flex items-center justify-between px-4 py-3"
                                    style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: 'var(--slds-c-card-radius-border)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Campus Restrictions</span>
                                        <span className="text-[12px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(20,95,51,0.1)', color: '#145F33' }}>{campusRestrictions.length}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={openCrModify}
                                            disabled={crSelectedId === null}
                                            className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors disabled:opacity-40"
                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                                        >
                                            Modify
                                        </button>
                                        <button
                                            onClick={openCrAdd}
                                            className="h-8 px-3 rounded-full text-[12px] font-medium text-white"
                                            style={{ backgroundColor: '#145F33' }}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>

                                {/* Grid */}
                                <div style={{ border: '1px solid var(--slds-g-color-border-base-1)', borderRadius: 'var(--slds-c-card-radius-border)', overflow: 'hidden', backgroundColor: 'var(--slds-g-color-background-base)' }}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '900px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)', borderBottom: '2px solid var(--slds-g-color-border-base-1)' }}>
                                                    <th className="px-1 py-2.5 w-10" />
                                                    {["YOUTH","TYPE","START DATE","END DATE","IMPLEMENTED BY","CAMPUS CONTACT","RESTORATIVE MEASURES","ENDED BY"].map(h => (
                                                        <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-weak)' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {campusRestrictions.length === 0 ? (
                                                    <tr><td colSpan={9} className="px-6 py-10 text-center text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>No campus restrictions found. Click "Add" to create one.</td></tr>
                                                ) : campusRestrictions.map((r, idx) => (
                                                    <tr
                                                        key={r.id}
                                                        onClick={() => setCrSelectedId(r.id === crSelectedId ? null : r.id)}
                                                        className="cursor-pointer"
                                                        style={{
                                                            borderBottom: idx < campusRestrictions.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                            backgroundColor: r.id === crSelectedId ? 'rgba(20,95,51,0.05)' : idx % 2 === 0 ? 'var(--slds-g-color-background-base)' : 'var(--slds-g-color-background-alt)',
                                                            outline: r.id === crSelectedId ? '2px solid #145F33' : 'none',
                                                            outlineOffset: '-2px',
                                                        }}
                                                    >
                                                        <td className="px-1 py-2.5 text-center">
                                                            <input
                                                                type="radio"
                                                                checked={r.id === crSelectedId}
                                                                onChange={() => setCrSelectedId(r.id)}
                                                                onClick={e => e.stopPropagation()}
                                                                style={{ accentColor: '#145F33' }}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5 text-[13px]" style={{ color: '#0176d3' }}>{r.youth}</td>
                                                        <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.type}</td>
                                                        <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.startDate}</td>
                                                        <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: r.endDate ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)' }}>{r.endDate || '—'}</td>
                                                        <td className="px-3 py-2.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.implementedBy || '—'}</td>
                                                        <td className="px-3 py-2.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.campusContact || '—'}</td>
                                                        <td className="px-3 py-2.5 text-[13px] max-w-[180px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                            <span className="truncate block" title={r.restorativeMeasureDetails}>{r.restorativeMeasureDetails || '—'}</span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>{r.endedBy || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {campusRestrictions.length > 0 && (
                                        <div className="px-4 py-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <span className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>{campusRestrictions.length} record{campusRestrictions.length !== 1 ? 's' : ''}{crSelectedId ? ' · 1 selected' : ''}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Add / Modify Dialog */}
                                {crDialogOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                        <div className="rounded-lg w-full max-w-2xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: '90vh', backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                                            {/* Dialog Header */}
                                            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                <h2 className="text-[15px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{crEditingId !== null ? 'Modify Campus Restriction' : 'Add Campus Restriction'}</h2>
                                                <button onClick={() => setCrDialogOpen(false)} className="p-1.5 rounded hover:bg-gray-200" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>

                                            {/* Dialog Body */}
                                            <div className="overflow-y-auto flex-1 px-6 py-5">
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                                    {/* Youth */}
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>YOUTH <span className="text-red-600">*</span></label>
                                                        <select value={crForm.youth} onChange={e => setCrForm(f => ({ ...f, youth: e.target.value }))}
                                                            className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
                                                            <option value="">Please Select</option>
                                                            {YOUTH_CONSTITUENTS.map(y => <option key={y} value={y}>{y}</option>)}
                                                        </select>
                                                        {!crForm.youth && <p className="text-[11px]" style={{ color: '#c23934' }}>Required</p>}
                                                    </div>

                                                    {/* Type */}
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>TYPE <span className="text-red-600">*</span></label>
                                                        <select value={crForm.type} onChange={e => setCrForm(f => ({ ...f, type: e.target.value }))}
                                                            className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
                                                            <option value="">Please Select</option>
                                                            {RESTRICTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                        {!crForm.type && <p className="text-[11px]" style={{ color: '#c23934' }}>Required</p>}
                                                    </div>

                                                    {/* Start Date */}
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>START DATE <span className="text-red-600">*</span></label>
                                                        <DateInput
value={isoToMdy(crForm.startDate ? crForm.startDate.split('/').reverse().join('-') : '')} onChange={(v) => (e => { const [y,m,d]=e.target.value.split('-'); setCrForm(f=>({...f,startDate:`${m}/${d}/${y}`})); })({ target: { value: mdyToIso(v) } })}
                                                            className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                                        {!crForm.startDate && <p className="text-[11px]" style={{ color: '#c23934' }}>Required</p>}
                                                    </div>

                                                    {/* End Date */}
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>END DATE</label>
                                                        <DateInput
value={isoToMdy(crForm.endDate ? crForm.endDate.split('/').reverse().join('-') : '')} onChange={(v) => (e => { if(!e.target.value){setCrForm(f=>({...f,endDate:''}));return;} const [y,m,d]=e.target.value.split('-'); setCrForm(f=>({...f,endDate:`${m}/${d}/${y}`})); })({ target: { value: mdyToIso(v) } })}
                                                            className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }} />
                                                    </div>

                                                    {/* Implemented By */}
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>IMPLEMENTED BY</label>
                                                        <select value={crForm.implementedBy} onChange={e => setCrForm(f => ({ ...f, implementedBy: e.target.value }))}
                                                            className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
                                                            <option value="">Please Select</option>
                                                            {MHGB_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Campus Contact */}
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>CAMPUS CONTACT</label>
                                                        <select value={crForm.campusContact} onChange={e => setCrForm(f => ({ ...f, campusContact: e.target.value }))}
                                                            className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
                                                            <option value="">Please Select</option>
                                                            {MHGB_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Restriction Reason */}
                                                    <div className="col-span-2 space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>RESTRICTION REASON</label>
                                                        <textarea value={crForm.restrictionReason} onChange={e => setCrForm(f => ({ ...f, restrictionReason: e.target.value }))} rows={3} placeholder="Enter free text explanation…"
                                                            className="w-full px-3 py-2 rounded text-[13px] focus:outline-none resize-y"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)', minHeight: '72px' }} />
                                                    </div>

                                                    {/* Restorative Measure Details */}
                                                    <div className="col-span-2 space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>RESTORATIVE MEASURE DETAILS</label>
                                                        <textarea value={crForm.restorativeMeasureDetails} onChange={e => setCrForm(f => ({ ...f, restorativeMeasureDetails: e.target.value }))} rows={3} placeholder="Describe restorative measures…"
                                                            className="w-full px-3 py-2 rounded text-[13px] focus:outline-none resize-y"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)', minHeight: '72px' }} />
                                                    </div>

                                                    {/* Ended By */}
                                                    <div className="space-y-1.5">
                                                        <label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>ENDED BY</label>
                                                        <select value={crForm.endedBy} onChange={e => setCrForm(f => ({ ...f, endedBy: e.target.value }))}
                                                            className="h-9 w-full px-3 rounded text-[13px] focus:outline-none"
                                                            style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}>
                                                            <option value="">Please Select</option>
                                                            {MHGB_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dialog Footer */}
                                            <div className="px-6 py-4 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                <button onClick={() => setCrDialogOpen(false)} className="h-9 px-4 rounded-full text-[13px] font-medium" style={{ border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)', backgroundColor: 'var(--slds-g-color-background-base)' }}>Cancel</button>
                                                <button onClick={saveCrForm} disabled={!crForm.youth || !crForm.type || !crForm.startDate}
                                                    className="h-9 px-4 rounded-full text-[13px] font-medium text-white disabled:opacity-40"
                                                    style={{ backgroundColor: '#145F33' }}>
                                                    {crEditingId !== null ? 'Save Changes' : 'Add Restriction'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
    </>
  );
}
