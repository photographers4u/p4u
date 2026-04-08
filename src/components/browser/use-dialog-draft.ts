"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

export function useDialogDraft<TDraft>(initialDraft: TDraft) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initialDraft);

  function openDialog(nextDraft: TDraft) {
    setDraft(nextDraft);
    setOpen(true);
  }

  function applyDraft(onApply: (draft: TDraft) => void) {
    onApply(draft);
    setOpen(false);
  }

  return {
    open,
    setOpen,
    draft,
    setDraft: setDraft as Dispatch<SetStateAction<TDraft>>,
    openDialog,
    applyDraft,
  };
}
