import { useState } from "react";
import { Input } from "./input";
import { cn } from "./utils";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  id?: string;
  /** Forwarded to Input; "base" renders the white page surface. */
  surface?: React.ComponentProps<typeof Input>["surface"];
  /** Additive, optional accessibility/validation state for the Input. */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

// Exported for use in default-value initializers
export function getCurrentAmPm(): "AM" | "PM" {
  return new Date().getHours() >= 12 ? "PM" : "AM";
}

function inferAmPm(hours: number): "AM" | "PM" {
  if (hours === 12) return "PM"; // noon
  if (hours === 0) return "AM"; // midnight
  return getCurrentAmPm();
}

// Exported standalone parser — accepts shorthand ("430", "4", "915") or
// already-formatted ("4:00 PM") strings.
export function parseTimeInput(input: string): string | null {
  if (!input.trim()) return null;

  const upper = input.toUpperCase().trim();

  // Already formatted: "4:00 PM", "12:30 AM"
  const formatted = upper.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/,
  );
  if (formatted) {
    const h = parseInt(formatted[1]);
    const m = parseInt(formatted[2]);
    const ap = formatted[3] as "AM" | "PM";
    if (h >= 1 && h <= 12 && m >= 0 && m <= 59)
      return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
    return null;
  }

  // Extract explicit AM/PM suffix
  let explicitAmPm: "AM" | "PM" | null = null;
  if (upper.endsWith("PM") || upper.endsWith("P"))
    explicitAmPm = "PM";
  else if (upper.endsWith("AM") || upper.endsWith("A"))
    explicitAmPm = "AM";

  const digits = input.replace(/\D/g, "");
  if (!digits) return null;

  let hours: number, minutes: number;

  switch (digits.length) {
    case 1:
      hours = parseInt(digits);
      minutes = 0;
      break;
    case 2: {
      const val = parseInt(digits);
      if (val <= 12) {
        hours = val;
        minutes = 0;
      } else {
        // e.g. "43" → 4:30
        hours = parseInt(digits[0]);
        minutes = parseInt(digits[1]) * 10;
      }
      break;
    }
    case 3:
      // "430" → 4:30, "915" → 9:15
      hours = parseInt(digits[0]);
      minutes = parseInt(digits.slice(1));
      break;
    default:
      // "1230" → 12:30
      hours = parseInt(digits.slice(0, 2));
      minutes = parseInt(digits.slice(2, 4));
      break;
  }

  if (hours === 0) hours = 12;
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59)
    return null;

  const ampm = explicitAmPm ?? inferAmPm(hours);
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

// Convert a 24-hour "HH:MM" value to "H:MM AM/PM" for display.
// Values already containing AM/PM are returned unchanged.
function to12Hour(val: string): string {
  if (!val || val.includes("AM") || val.includes("PM"))
    return val;
  const match = val.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return val;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

export function TimeInput({
  value,
  onChange,
  className,
  style,
  placeholder = "",
  id,
  surface,
  ...aria
}: TimeInputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const displayValue = editing ? draft : to12Hour(value ?? "");

  const handleFocus = () => {
    setEditing(true);
    setDraft(to12Hour(value ?? ""));
  };

  const handleBlur = () => {
    setEditing(false);
    const parsed = parseTimeInput(draft);
    if (parsed !== null) {
      onChange(parsed);
    } else if (!draft.trim()) {
      onChange("");
    }
  };

  return (
    <Input
      id={id}
      type="text"
      value={displayValue}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn("h-9 slds-text-4", className)}
      style={style}
      surface={surface}
      placeholder={placeholder}
      {...aria}
    />
  );
}