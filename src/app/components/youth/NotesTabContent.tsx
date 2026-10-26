import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
// This is a temporary file to build the Notes tab content
// Will be integrated back into ProfileContentRenderer.tsx

{
  /* NOTES TAB */
}
{
  !showNoteForm ? (
    // TABLE VIEW
    <div className="space-y-4">
      {/* Header with New Note Button */}
      <div className="flex items-center justify-between">
        <h2
          className="text-[16px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Notes
        </h2>
        <Button
          onClick={handleNewNote}
          className="h-9 rounded-full text-[12px] font-medium px-5 flex items-center gap-2"
          style={{
            backgroundColor: "var(--color-brand-primary)",
            color: "white",
            border: "none",
          }}
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Notes Table */}
      <div
        className="overflow-hidden rounded-lg shadow-sm"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <TableHead
                className="text-[11px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Date
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Time
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Subject
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Classification
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Note Type
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Owner
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Timeline
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note) => {
              const badgeStyle = getClassificationBadgeStyle(
                note.classification,
              );
              return (
                <TableRow
                  key={note.id}
                  onClick={() => handleNoteRowClick(note.id)}
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <TableCell
                    className="text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {note.date}
                  </TableCell>
                  <TableCell
                    className="text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {note.time}
                  </TableCell>
                  <TableCell
                    className="text-[13px] font-medium"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {note.subject}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="text-[10px] px-2 py-0 h-5 capitalize"
                      style={{
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                      }}
                    >
                      {note.classification}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {note.noteType}
                  </TableCell>
                  <TableCell
                    className="text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {note.owner}
                  </TableCell>
                  <TableCell
                    className="text-[13px] capitalize"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {note.timeline}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  ) : (
    // FORM VIEW
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-[16px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          {selectedNoteId ? "Edit Note" : "New Note"}
        </h2>
        <Button
          onClick={handleCancelNote}
          variant="ghost"
          className="h-9 rounded-full text-[12px] font-medium px-3"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Note Entry Form */}
      <div
        className="rounded-lg p-5"
        style={{
          backgroundColor:
            "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <div className="space-y-4">
          {/* Row 1: Date, Time, Classification, Subject */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label
                htmlFor="noteDate"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Date <span className="text-red-600">*</span>
              </Label>
              <DateInput
                id="noteDate"
                value={isoToMdy(noteFormData.date)}
                onChange={(v) =>
                  ((e) =>
                    setNoteFormData({
                      ...noteFormData,
                      date: e.target.value,
                    }))({ target: { value: mdyToIso(v) } })
                }
                className="h-9 text-[13px]"
              />
            </div>

            <div>
              <Label
                htmlFor="noteTime"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Time <span className="text-red-600">*</span>
              </Label>
              <Input
                id="noteTime"
                type="time"
                value={noteFormData.time}
                onChange={(e) =>
                  setNoteFormData({
                    ...noteFormData,
                    time: e.target.value,
                  })
                }
                className="h-9 text-[13px]"
              />
            </div>

            <div>
              <Label
                htmlFor="classification"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Classification{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Select
                value={noteFormData.classification}
                onValueChange={(value) =>
                  setNoteFormData({
                    ...noteFormData,
                    classification: value,
                  })
                }
              >
                <SelectTrigger
                  id="classification"
                  className="h-9 text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    General
                  </SelectItem>
                  <SelectItem value="medical">
                    Medical
                  </SelectItem>
                  <SelectItem value="behavioral">
                    Behavioral
                  </SelectItem>
                  <SelectItem value="educational">
                    Educational
                  </SelectItem>
                  <SelectItem value="therapeutic">
                    Therapeutic
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="subject"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Subject <span className="text-red-600">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Enter subject"
                value={noteFormData.subject}
                onChange={(e) =>
                  setNoteFormData({
                    ...noteFormData,
                    subject: e.target.value,
                  })
                }
                className="h-9 text-[13px]"
              />
            </div>
          </div>

          {/* Row 2: Note Content */}
          <div>
            <Label
              htmlFor="noteContent"
              className="text-[11px] font-semibold mb-1.5 block"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Note <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="noteContent"
              placeholder="Enter note details..."
              value={noteFormData.content}
              onChange={(e) =>
                setNoteFormData({
                  ...noteFormData,
                  content: e.target.value,
                })
              }
              className="min-h-[120px] text-[13px] resize-y"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            />
          </div>

          {/* Row 3: Note Type, Timeline, Note For */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label
                htmlFor="noteType"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Note Type
              </Label>
              <Select
                value={noteFormData.noteType}
                onValueChange={(value) =>
                  setNoteFormData({
                    ...noteFormData,
                    noteType: value,
                  })
                }
              >
                <SelectTrigger
                  id="noteType"
                  className="h-9 text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case-note">
                    Case Note
                  </SelectItem>
                  <SelectItem value="progress-note">
                    Progress Note
                  </SelectItem>
                  <SelectItem value="incident-report">
                    Incident Report
                  </SelectItem>
                  <SelectItem value="contact-log">
                    Contact Log
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="timeline"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Timeline
              </Label>
              <Select
                value={noteFormData.timeline}
                onValueChange={(value) =>
                  setNoteFormData({
                    ...noteFormData,
                    timeline: value,
                  })
                }
              >
                <SelectTrigger
                  id="timeline"
                  className="h-9 text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    Current
                  </SelectItem>
                  <SelectItem value="historical">
                    Historical
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="noteFor"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Note For
              </Label>
              <Select
                value={noteFormData.noteFor}
                onValueChange={(value) =>
                  setNoteFormData({
                    ...noteFormData,
                    noteFor: value,
                  })
                }
              >
                <SelectTrigger
                  id="noteFor"
                  className="h-9 text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aaron-ace">
                    Aaron Ace
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Recording Form, Primary Key, Note Owner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label
                htmlFor="recordingForm"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Recording Form
              </Label>
              <Select
                value={noteFormData.recordingForm}
                onValueChange={(value) =>
                  setNoteFormData({
                    ...noteFormData,
                    recordingForm: value,
                  })
                }
              >
                <SelectTrigger
                  id="recordingForm"
                  className="h-9 text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    Standard Form
                  </SelectItem>
                  <SelectItem value="detailed">
                    Detailed Form
                  </SelectItem>
                  <SelectItem value="brief">
                    Brief Form
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="primaryKey"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Primary Key
              </Label>
              <Input
                id="primaryKey"
                value={noteFormData.primaryKey}
                className="h-9 text-[13px]"
                disabled
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="noteOwner"
                className="text-[11px] font-semibold mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Note Owner
              </Label>
              <Select
                value={noteFormData.noteOwner}
                onValueChange={(value) =>
                  setNoteFormData({
                    ...noteFormData,
                    noteOwner: value,
                  })
                }
              >
                <SelectTrigger
                  id="noteOwner"
                  className="h-9 text-[13px]"
                  style={{
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-user">
                    Current User
                  </SelectItem>
                  <SelectItem value="case-manager">
                    Case Manager
                  </SelectItem>
                  <SelectItem value="supervisor">
                    Supervisor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSaveNote}
              disabled={
                !noteFormData.subject || !noteFormData.content
              }
              className="h-9 rounded-full text-[12px] font-medium px-5"
              style={{
                backgroundColor: "var(--color-brand-primary)",
                color: "white",
                border: "none",
                opacity:
                  !noteFormData.subject || !noteFormData.content
                    ? 0.5
                    : 1,
              }}
            >
              Save & Close
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={
                !noteFormData.subject || !noteFormData.content
              }
              variant="outline"
              className="h-9 rounded-full text-[12px] font-medium px-5"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
                opacity:
                  !noteFormData.subject || !noteFormData.content
                    ? 0.5
                    : 1,
              }}
            >
              Save
            </Button>
            {selectedNoteId && (
              <Button
                onClick={handleDeleteNote}
                variant="outline"
                className="h-9 rounded-full text-[12px] font-medium px-5"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  color: "#f44336",
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <Button
              onClick={handleCancelNote}
              variant="outline"
              className="h-9 rounded-full text-[12px] font-medium px-5"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}