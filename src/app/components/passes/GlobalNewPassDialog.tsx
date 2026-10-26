import { useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PassForm, type PassFormHandle } from "./PassForm";
import { createPassesFromForm } from "../../lib/passCreate";

// Global Actions → New Pass (20004). A thin wrapper: it renders the existing
// PassForm (create mode, NO context defaults — Youth and Program start blank
// whatever page is underneath) and saves through the shared create
// algorithm. It is mounted in the app shell, outside <Routes>, so the page
// underneath stays mounted and keeps any unsaved work.

export function GlobalNewPassDialog({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lets the trigger take focus back when the dialog closes. */
  onCloseAutoFocus?: (e: Event) => void;
}) {
  const navigate = useNavigate();
  const formRef = useRef<PassFormHandle>(null);

  function handleSubmit(
    values: Parameters<typeof createPassesFromForm>[0],
  ) {
    const { created, packMedError } =
      createPassesFromForm(values);
    if (packMedError) toast.error(packMedError);
    const first = created[0];
    toast.success(`${first.recordName} was created`, {
      ...(created.length > 1
        ? {
            description: `${created.length} recurring passes in this series`,
          }
        : {}),
      action: {
        label: "View Pass",
        onClick: () => navigate(`/pass/${first.id}`),
      },
    });
    onOpenChange(false); // stay on the current page
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="xl"
        aria-describedby="global-new-pass-description"
        // Same protection as the app's other large create forms (e.g. the
        // Mentor Match modal): a stray click outside can't discard the form.
        onInteractOutside={(e) => e.preventDefault()}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>New Pass</DialogTitle>
          <DialogDescription id="global-new-pass-description">
            Create a Pass without leaving this page.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="bg-[var(--slds-g-color-background-alt-2)]">
          {/* key: a fresh, blank form every time the dialog opens */}
          {open && (
            <PassForm
              key="global-new-pass"
              ref={formRef}
              mode="create"
              onSubmit={handleSubmit}
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={() => formRef.current?.submit()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}