import type { Person } from "@/lib/api/types";

// v2: the composer collapsed from a 4-step wizard to a 2-step one (merged
// form + preview), so old `step` values wouldn't map correctly onto it.
const DRAFT_KEY = "dnc:composer-draft:v2";

export type ComposerDraft = {
  step: number;
  personName: string;
  designation: string;
  organization: string;
  attachedPerson: Person | null;
  state: string;
  city: string;
  description: string;
  savedAt: string;
};

export function loadComposerDraft(): ComposerDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ComposerDraft;
  } catch {
    return null;
  }
}

export function saveComposerDraft(draft: Omit<ComposerDraft, "savedAt">): void {
  try {
    const isBlank =
      !draft.personName.trim() && !draft.description.trim() && !draft.attachedPerson;
    if (isBlank) {
      window.localStorage.removeItem(DRAFT_KEY);
      return;
    }
    const toSave: ComposerDraft = { ...draft, savedAt: new Date().toISOString() };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — drafts just won't persist.
  }
}

export function clearComposerDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
