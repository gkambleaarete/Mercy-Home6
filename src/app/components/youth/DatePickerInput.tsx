import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseMDY(value: string): Date | null {
    if (!value || value.length !== 10) return null;
    const parts = value.split("/");
    if (parts.length !== 3) return null;
    const [m, d, y] = parts.map(Number);
    if (!m || !d || !y || y < 1900 || y > 2200) return null;
    const date = new Date(y, m - 1, d);
    if (date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
}

function toMDY(date: Date): string {
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

interface DatePickerInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    maxLength?: number;
}

export function DatePickerInput({
    value,
    onChange,
    placeholder = "MM/DD/YYYY",
    id,
    className = "",
    style,
    maxLength = 10,
}: DatePickerInputProps) {
    const today = new Date();
    const parsed = parseMDY(value);

    const [isOpen, setIsOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(parsed ? parsed.getMonth() : today.getMonth());
    const [viewYear, setViewYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear());

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync calendar view when a valid date is typed
    useEffect(() => {
        const p = parseMDY(value);
        if (p) {
            setViewMonth(p.getMonth());
            setViewYear(p.getFullYear());
        }
    }, [value]);

    // Close on outside click or Escape
    useEffect(() => {
        if (!isOpen) return;
        const onDown = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [isOpen]);

    const selectDate = (date: Date) => {
        onChange(toMDY(date));
        setIsOpen(false);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Build day grid
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDow).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const isSelected = (day: number) =>
        parsed &&
        parsed.getFullYear() === viewYear &&
        parsed.getMonth() === viewMonth &&
        parsed.getDate() === day;

    const isToday = (day: number) =>
        today.getFullYear() === viewYear &&
        today.getMonth() === viewMonth &&
        today.getDate() === day;

    return (
        <div ref={wrapperRef} style={{ position: "relative" }}>
            {/* Input with calendar icon */}
            <div style={{ position: "relative" }}>
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onClick={() => setIsOpen(true)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    autoComplete="off"
                    className={className}
                    style={{ ...style, paddingRight: "32px" }}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setIsOpen(o => !o)}
                    aria-label="Open calendar"
                    style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        color: isOpen ? "#145F33" : "var(--slds-g-color-text-weak)",
                    }}
                >
                    <Calendar size={14} />
                </button>
            </div>

            {/* Calendar — absolute, anchored directly below the input */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Date picker"
                    style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        minWidth: "272px",
                        zIndex: 9999,
                        backgroundColor: "var(--slds-g-color-background-base)",
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        borderRadius: "8px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                        padding: "14px",
                    }}
                >
                    {/* Month / Year navigation */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                        <button
                            type="button"
                            onClick={prevMonth}
                            style={{ padding: "4px 6px", borderRadius: "4px", border: "none", background: "none", cursor: "pointer", color: "var(--slds-g-color-text-default)", display: "flex", alignItems: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                            aria-label="Previous month"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--slds-g-color-text-default)" }}>
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            style={{ padding: "4px 6px", borderRadius: "4px", border: "none", background: "none", cursor: "pointer", color: "var(--slds-g-color-text-default)", display: "flex", alignItems: "center" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--slds-g-color-background-alt)")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                            aria-label="Next month"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Day-of-week headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
                        {DAY_LABELS.map(label => (
                            <div
                                key={label}
                                style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--slds-g-color-text-weak)", padding: "2px 0" }}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                        {cells.map((day, idx) => (
                            <div key={idx} style={{ textAlign: "center" }}>
                                {day !== null ? (
                                    <button
                                        type="button"
                                        onClick={() => selectDate(new Date(viewYear, viewMonth, day))}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: isSelected(day) ? 700 : isToday(day) ? 600 : 400,
                                            backgroundColor: isSelected(day) ? "#145F33" : isToday(day) ? "#e6f2eb" : "transparent",
                                            color: isSelected(day) ? "white" : isToday(day) ? "#145F33" : "var(--slds-g-color-text-default)",
                                            transition: "background-color 0.1s",
                                        }}
                                        onMouseEnter={e => {
                                            if (!isSelected(day)) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#e6f2eb";
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected(day)) (e.currentTarget as HTMLButtonElement).style.backgroundColor = isToday(day) ? "#e6f2eb" : "transparent";
                                        }}
                                        aria-label={`${MONTHS[viewMonth]} ${day}, ${viewYear}`}
                                        aria-pressed={isSelected(day) ? true : undefined}
                                    >
                                        {day}
                                    </button>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    {/* Today shortcut */}
                    <div style={{ borderTop: "1px solid var(--slds-g-color-border-base-1)", marginTop: "10px", paddingTop: "8px", textAlign: "center" }}>
                        <button
                            type="button"
                            onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); selectDate(today); }}
                            style={{ fontSize: "12px", fontWeight: 500, color: "#145F33", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
