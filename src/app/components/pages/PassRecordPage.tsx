import { useMemo, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import {
  ArrowLeft,
  Ban,
  Copy,
  Pencil,
  Ticket,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  PassForm,
  type PassFormHandle,
} from "../passes/PassForm";
import { PassActionDialog } from "../passes/PassActionDialog";
import {
  type PassRecord,
  PASS_STATUS_BADGE_VARIANT,
  addPassHistory,
  deletePass,
  getPassById,
  getPassHistory,
  getSeriesPasses,
  usePasses,
  savePasses,
} from "../../data/mockPassData";
import { CURRENT_USER_NAME } from "../../data/mockProgramsData";
import { getActiveYouth } from "../../data/mockYouthProgramData";
import { formatMdy } from "../../lib/dateFormat";
import { linkPassToPackMed } from "../../lib/passPackMedAssociation";
import { createPassesFromForm } from "../../lib/passCreate";
import {
  type PassFormValues,
  type PassSeriesScope,
  applyPassEdit,
  buildPassRecordName,
  diffPassHistory,
  formToPassFields,
  isShortenedOrExtended,
  scopeTargets,
} from "../../lib/passes";

// Pass Record page (19998) — /pass/new, /pass/:id, /pass/:id/edit, the
// same one-component/three-routes convention as ProgramRecordPage. All three
// modes render the shared PassForm. Entry points pass context through
// location.state: { defaultYouthId?, defaultProgramId? } (create only).
//
// Record actions: Edit (series scope prompt when recurring), Cancel Pass
// (reason + scope; the record is kept), Delete (records entered in error).

interface PassCreateState {
  defaultYouthId?: string;
  defaultProgramId?: number;
  defaultStartDate?: string;
  /** "Copy": id of the Pass whose carried-over fields prefill Create. */
  copyFromId?: number;
}

export function PassRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<PassFormHandle>(null);

  const isCreate = id === undefined;
  const mode: "create" | "edit" | "view" = isCreate
    ? "create"
    : location.pathname.endsWith("/edit")
      ? "edit"
      : "view";

  // Live canonical data — any Pass write (save, cancel, Pack Med link)
  // re-renders this page; no manual refresh state.
  const allPasses = usePasses();
  const pass = useMemo(
    () =>
      isCreate
        ? null
        : (allPasses.find((p) => p.id === Number(id)) ?? null),
    [allPasses, id, isCreate],
  );
  const series = useMemo(
    () =>
      pass?.seriesId ? getSeriesPasses(pass.seriesId) : [],
    [pass],
  );
  const isRecurring = series.length > 1;
  const history = useMemo(
    // History is written alongside the Pass, so a new `pass` object means
    // any new history is already in place.
    () => (pass ? getPassHistory(pass.id) : []),
    [pass],
  );

  const createState = (location.state ?? {}) as PassCreateState;
  const copySource = useMemo(
    () =>
      isCreate && createState.copyFromId !== undefined
        ? (allPasses.find(
            (p) => p.id === createState.copyFromId,
          ) ?? null)
        : null,
    [allPasses, isCreate, createState.copyFromId],
  );

  // Pending edit awaiting a series-scope choice (+ its Pack Med choice).
  const [pendingEdit, setPendingEdit] =
    useState<PassRecord | null>(null);
  const [pendingPackMedId, setPendingPackMedId] = useState("");

  /** Applies the form's Pack Med choice to ONE Pass through the shared
   *  association helper (keeps both sides in sync). Occurrence-specific. */
  function applyPackMedChoice(
    passId: number,
    packMedId: string,
  ) {
    const current = getPassById(passId);
    const target = packMedId ? Number(packMedId) : null;
    if (!current || (current.packMedId ?? null) === target)
      return;
    const result = linkPassToPackMed(passId, target);
    if (!result.ok) toast.error(result.error);
  }
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function youthName(youthId: string) {
    return (
      getActiveYouth().find((y) => y.youthId === youthId)
        ?.youthName ?? ""
    );
  }

  /** Persists the given Passes and one history entry per changed tracked
   *  field on EACH affected Pass (compared with its stored version). */
  function persist(next: PassRecord[]) {
    const now = new Date().toISOString();
    addPassHistory(
      next.flatMap((after) => {
        const before = getPassById(after.id);
        return before
          ? diffPassHistory(
              before,
              after,
              CURRENT_USER_NAME,
              now,
            )
          : [];
      }),
    );
    savePasses(next);
  }

  // ── Create / Edit submit ──────────────────────────────────────────────
  function handleSubmit(values: PassFormValues) {
    const fields = formToPassFields(values);
    const now = new Date().toISOString();

    if (mode === "create") {
      // Shared create algorithm (also used by Global New Pass, 20004).
      const { created, packMedError } =
        createPassesFromForm(values);
      if (packMedError) toast.error(packMedError);
      toast.success(
        created.length === 1
          ? `${created[0].recordName} was created`
          : `${created.length} recurring passes were created`,
        created.length > 1
          ? {
              description: `Starting with ${created[0].recordName}`,
            }
          : undefined,
      );
      navigate(`/pass/${created[0].id}`, { replace: true });
      return;
    }

    if (!pass) return;
    // Build from the stored record (a Pack Med may have been linked while
    // the form was open), so no association is overwritten by a stale copy.
    const stored = getPassById(pass.id) ?? pass;
    const edited: PassRecord = {
      ...stored,
      ...fields,
      recordName: buildPassRecordName(
        youthName(fields.youthId),
        fields.startDate,
      ),
      updatedAt: now,
    };
    if (isRecurring) {
      setPendingEdit(edited); // choose scope before anything is applied
      setPendingPackMedId(values.packMedId);
      return;
    }
    persist([edited]);
    applyPackMedChoice(pass.id, values.packMedId);
    toast.success(`${edited.recordName} was saved`);
    navigate(`/pass/${pass.id}`, { replace: true });
  }

  function applySeriesEdit(scope: PassSeriesScope) {
    if (!pass || !pendingEdit) return;
    const updated = applyPassEdit(
      getPassById(pass.id) ?? pass,
      pendingEdit,
      pass.seriesId ? getSeriesPasses(pass.seriesId) : series,
      scope,
    );
    persist(updated);
    // Pack Med stays occurrence-specific: only the edited Pass is linked.
    applyPackMedChoice(pass.id, pendingPackMedId);
    setPendingEdit(null);
    toast.success(
      updated.length === 1
        ? `${pendingEdit.recordName} was saved`
        : `${updated.length} passes were saved`,
    );
    navigate(`/pass/${pass.id}`, { replace: true });
  }

  // ── Cancel Pass (status → Cancelled; records are kept) ────────────────
  function confirmCancel(
    scope: PassSeriesScope,
    reason: string,
  ) {
    if (!pass) return;
    const now = new Date().toISOString();
    const targets = scopeTargets(pass, series, scope).map(
      (p) => ({
        ...p,
        status: "Cancelled" as const,
        cancellationReason: reason,
        actualReturnDate: "",
        actualReturnTime: "",
        changeReason: "",
        updatedAt: now,
      }),
    );
    persist(targets);
    setCancelOpen(false);
    toast.success(
      targets.length === 1
        ? `${pass.recordName} was cancelled`
        : `${targets.length} passes were cancelled`,
    );
  }

  // ── Delete (records entered in error) ─────────────────────────────────
  function confirmDelete() {
    if (!pass) return;
    const name = pass.recordName;
    deletePass(pass.id);
    setDeleteOpen(false);
    toast.success(`${name} was deleted`);
    navigate(-1);
  }

  function handleCancelEdit() {
    if (mode === "edit" && pass) navigate(`/pass/${pass.id}`);
    else navigate(-1);
  }

  if (!isCreate && !pass) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--slds-g-color-text-default)]">
            Pass Not Found
          </h2>
          <p className="mb-4 text-[var(--slds-g-color-text-weak)]">
            The pass you're looking for doesn't exist.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    // Single vertical scroll region (the shell's <main> is overflow-hidden);
    // pb-16 clears the fixed 40px UtilityBar — same as ProgramRecordPage.
    <div className="flex-1 min-h-0 overflow-y-auto pb-16 bg-[var(--slds-g-color-background-alt-2)]">
      {/* Header */}
      <div className="px-6 py-4 bg-[var(--slds-g-color-background-base)] border-b border-border">
        {/* Back to the Pass list (View and Edit). A fixed target, not
            history: after Edit → Save the previous history entry is this
            same record. */}
        {mode !== "create" && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
            onClick={() => navigate("/pass")}
          >
            <ArrowLeft /> Back to Passes
          </Button>
        )}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Ticket className="h-8 w-8 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" />
            <div className="min-w-0">
              <p className="slds-text-3 uppercase tracking-widest font-semibold text-[var(--slds-g-color-text-weak)]">
                Pass
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="slds-page-header-title truncate text-[var(--slds-g-color-text-default)]">
                  {pass ? pass.recordName : "New Pass"}
                </h1>
                {pass && (
                  <Badge
                    variant={
                      PASS_STATUS_BADGE_VARIANT[pass.status]
                    }
                  >
                    {pass.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {mode === "view" && pass && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline-primary"
                onClick={() =>
                  navigate(`/pass/${pass.id}/edit`)
                }
              >
                <Pencil /> Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate("/pass/new", {
                    state: { copyFromId: pass.id },
                  })
                }
              >
                <Copy /> Copy
              </Button>
              {pass.status !== "Cancelled" && (
                <Button
                  variant="accent"
                  onClick={() => setCancelOpen(true)}
                >
                  <Ban /> Cancel Pass
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-6 space-y-4">
        <PassForm
          ref={formRef}
          mode={mode}
          pass={pass}
          defaultYouthId={
            isCreate ? createState.defaultYouthId : undefined
          }
          defaultProgramId={
            isCreate ? createState.defaultProgramId : undefined
          }
          defaultStartDate={
            isCreate ? createState.defaultStartDate : undefined
          }
          copyFrom={copySource}
          onSubmit={handleSubmit}
        />

        {mode === "view" && pass && (
          <Card variant="section">
            <CardHeader size="sm" separated>
              <CardTitle size="sm">Field History</CardTitle>
            </CardHeader>
            <CardContent size="sm">
              {history.length === 0 ? (
                <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
                  No changes to Start Date, Departure Time, End
                  Date, Return Time, who or where the youth is
                  staying, or Status yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow hoverable={false}>
                        <TableHead variant="slds">
                          Date
                        </TableHead>
                        <TableHead variant="slds">
                          Field
                        </TableHead>
                        <TableHead variant="slds">
                          Original Value
                        </TableHead>
                        <TableHead variant="slds">
                          New Value
                        </TableHead>
                        <TableHead variant="slds">
                          Changed By
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell>
                            {formatMdy(h.changedAt)}{" "}
                            {new Date(
                              h.changedAt,
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>{h.field}</TableCell>
                          <TableCell>
                            {h.previousValue || "—"}
                          </TableCell>
                          <TableCell>
                            {h.newValue || "—"}
                          </TableCell>
                          <TableCell>{h.changedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {mode !== "view" && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button onClick={() => formRef.current?.submit()}>
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Edit scope — recurring occurrences only */}
      <PassActionDialog
        open={pendingEdit !== null}
        onOpenChange={(o) => !o && setPendingEdit(null)}
        title="Edit Recurring Pass"
        description="This pass is part of a recurring series. Choose which passes your changes apply to. Each pass keeps its own dates."
        confirmLabel="Save"
        showScope
        disabledScopes={
          pendingEdit &&
          isShortenedOrExtended(pendingEdit.status)
            ? {
                scopes: ["future", "series"],
                reason:
                  "Shortened and Extended record one pass's actual return, so they apply to This Pass only.",
              }
            : undefined
        }
        requireReason={false}
        onConfirm={(scope) => applySeriesEdit(scope)}
      />

      {/* Cancel Pass — the record is kept with Status = Cancelled */}
      <PassActionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Pass"
        description={`${pass?.recordName ?? "This pass"} will be marked Cancelled and kept on record.`}
        confirmLabel="Cancel Pass"
        confirmVariant="accent"
        showScope={isRecurring}
        requireReason
        onConfirm={confirmCancel}
      />

      {/* Delete — records entered in error */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pass</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete "{pass?.recordName}"? Use this
              only for a pass entered in error — to keep the
              record, use Cancel Pass instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}