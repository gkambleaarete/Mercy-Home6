import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { AlertTriangle } from "lucide-react";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";

interface EndRevokeConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consent: {
    id: number;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  onConfirm: (endDate: string, comment: string, actionType: "end" | "revoke") => void;
  actionType: "end" | "revoke";
}

export function EndRevokeConsentModal({ open, onOpenChange, consent, onConfirm }: EndRevokeConsentModalProps) {
  const [comment, setComment] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [selectedAction, setSelectedAction] = useState<"end" | "revoke">("end");
  const [endDate, setEndDate] = useState("");
  const maxChars = 100;

  // Set default end date to yesterday when modal opens
  useEffect(() => {
    if (open) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setEndDate(yesterday.toISOString().split("T")[0]);
    }
  }, [open]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setComment(value);
      setCharCount(value.length);
    }
  };

  const handleConfirm = () => {
    onConfirm(endDate, comment, selectedAction);
    setComment("");
    setCharCount(0);
  };

  const handleCancel = () => {
    setComment("");
    setCharCount(0);
    onOpenChange(false);
  };

  if (!consent) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatMdy(date);
  };

  // Dynamic text based on action type
  const title = selectedAction === "end" ? "End Consent" : "Revoke Consent";
  const description = selectedAction === "end" 
    ? "This will end the consent on the specified date. This action cannot be undone."
    : "This will revoke the consent permanently. This action cannot be undone.";
  const warningText = selectedAction === "end"
    ? "Ending this consent will revoke authorization for all OTC medications on this consent."
    : "Revoking this consent will permanently invalidate it and immediately revoke authorization for all OTC medications.";
  const buttonText = selectedAction === "end" ? "Confirm - End Consent" : "Confirm - Revoke Consent";
  const labelText = selectedAction === "end" 
    ? "Reason for Ending Consent Early (Optional)"
    : "Reason for Revoking Consent (Optional)";
  const placeholderText = selectedAction === "end"
    ? "Enter optional comment explaining why this consent is being ended early..."
    : "Enter optional comment explaining why this consent is being revoked...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Box */}
          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{
              backgroundColor: "#FEF3C7",
              border: "1px solid #FDE68A",
            }}
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#D97706" }} />
            <div>
              <h4 className="text-[14px] font-semibold" style={{ color: "#78350F" }}>
                Warning
              </h4>
              <p className="text-[13px] mt-1" style={{ color: "#92400E" }}>
                {warningText}
              </p>
            </div>
          </div>

          {/* Consent Details */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "#F9FAFB",
              border: "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <h4 className="text-[13px] font-semibold mb-2" style={{ color: "var(--slds-g-color-text-default)" }}>
              Consent Details
            </h4>
            <div className="space-y-1 text-[12px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              <p>Start Date: {formatDate(consent.startDate)}</p>
              <p>Current End Date: {formatDate(consent.endDate)}</p>
              <p>Status: {consent.status}</p>
            </div>
          </div>

          {/* End Date Field */}
          <div className="space-y-1.5">
            <Label htmlFor="end-date" className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
              End Date <span className="text-red-600">*</span>
            </Label>
            <DateInput
              id="end-date"
value={isoToMdy(endDate)}
              onChange={(v) => ((e) => setEndDate(e.target.value))({ target: { value: mdyToIso(v) } })}
              className="w-full"
              style={{
                borderColor: "var(--slds-g-color-border-base-1)",
              }}
            />
            <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
              Defaults to yesterday. Consents are inclusive of the End Date. To stop medication immediately (e.g., allergic reaction), set to the previous day.
            </p>
          </div>

          {/* Optional Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="revocation-comment" className="text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
              {labelText}
            </Label>
            <Textarea
              id="revocation-comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder={placeholderText}
              className="resize-none text-[13px]"
              rows={3}
              style={{
                borderColor: "var(--slds-g-color-border-base-1)",
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                This comment will be saved in the consent history.
              </p>
              <p className="text-[11px]" style={{ color: charCount >= maxChars ? "#DC2626" : "var(--slds-g-color-text-weak)" }}>
                {charCount}/{maxChars}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-4"
              style={{ backgroundColor: "#DC2626", color: "white" }}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}