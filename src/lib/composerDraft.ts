import type { Person } from "@/lib/api/types";

// v3: state + city collapsed into a single free-text `location` field.
const DRAFT_KEY = "dnc:composer-draft:v3";

export type ComposerDraft = {
  step: number;
  personName: string;
  designation: string;
  organization: string;
  attachedPerson: Person | null;
  location: string;
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
