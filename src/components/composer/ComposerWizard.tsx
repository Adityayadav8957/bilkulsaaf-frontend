"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ApiClientError,
  createPost,
  getUploadUrl,
  listPeopleClient,
} from "@/lib/api/browser";
import { ChevronLeftIcon } from "@/components/icons";
import { locationLabel } from "@/lib/format";
import {
  clearComposerDraft,
  loadComposerDraft,
  saveComposerDraft,
} from "@/lib/composerDraft";
import type { Media, MediaType, Person } from "@/lib/api/types";

type Step = 0 | 1 | 2 | 3;

const TOP_TITLES = ["Who is this about?", "Where's this?", "Add your post", "Preview & post"];

const HEADINGS = [
  "Who is this about?",
  "Where does this definitely not happen?",
  "What's happening?",
  "Here's how it lands",
];

const ATTACHMENT_ACCEPT: Record<"image" | "video", string> = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4",
};

function personSubtitle(person: { designation?: string; organization?: string }): string {
  return [person.designation, person.organization].filter(Boolean).join(", ") || "Reported by citizens";
}

export function ComposerWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingMediaKind = useRef<"image" | "video">("image");

  const [step, setStep] = useState<Step>(0);
  const [restoredDraft, setRestoredDraft] = useState(false);

  const [personName, setPersonName] = useState("");
  const [designation, setDesignation] = useState("");
  const [organization, setOrganization] = useState("");
  const [attachedPerson, setAttachedPerson] = useState<Person | null>(null);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKind, setFileKind] = useState<"image" | "video">("image");

  const [suggestions, setSuggestions] = useState<Person[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load an initial "who's trending" suggestion list before the user types
  // anything, and restore a locally-saved draft (if any) from a prior visit.
  useEffect(() => {
    listPeopleClient("")
      .then((result) => setSuggestions((prev) => (prev.length > 0 ? prev : result.items.slice(0, 5))))
      .catch(() => {});

    // One-time restore of a locally-saved draft from a prior visit — several
    // fields are seeded together here by design, so they're batched as a
    // single React 18 update rather than split into separate effects.
    /* eslint-disable react-hooks/set-state-in-effect */
    const draft = loadComposerDraft();
    if (draft) {
      setStep(draft.step as Step);
      setPersonName(draft.personName);
      setDesignation(draft.designation);
      setOrganization(draft.organization);
      setAttachedPerson(draft.attachedPerson);
      setState(draft.state);
      setCity(draft.city);
      setDescription(draft.description);
      setRestoredDraft(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Autosave a draft (media/files aren't serializable, so they're excluded).
  useEffect(() => {
    saveComposerDraft({
      step,
      personName,
      designation,
      organization,
      attachedPerson,
      state,
      city,
      description,
    });
  }, [step, personName, designation, organization, attachedPerson, state, city, description]);

  async function searchPeople(q: string) {
    setPersonName(q);
    setAttachedPerson(null);
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const result = await listPeopleClient(q);
      setSuggestions(result.items.slice(0, 5));
    } catch {
      setSuggestions([]);
    }
  }

  function pickSuggestion(person: Person) {
    setAttachedPerson(person);
    setPersonName(person.name);
    setDesignation(person.designation || "");
    setOrganization(person.organization || "");
    setState(person.location.state);
    setCity(person.location.city || "");
  }

  function detachPerson() {
    setAttachedPerson(null);
    setPersonName("");
    setDesignation("");
    setOrganization("");
  }

  function discardDraft() {
    clearComposerDraft();
    setStep(0);
    setPersonName("");
    setDesignation("");
    setOrganization("");
    setAttachedPerson(null);
    setState("");
    setCity("");
    setDescription("");
    setFile(null);
    setRestoredDraft(false);
  }

  function openFilePicker(kind: "image" | "video") {
    pendingMediaKind.current = kind;
    if (fileInputRef.current) {
      fileInputRef.current.accept = ATTACHMENT_ACCEPT[kind];
      fileInputRef.current.click();
    }
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0] ?? null;
    setFile(chosen);
    setFileKind(pendingMediaKind.current);
    e.target.value = "";
  }

  function canContinue() {
    if (step === 0) return personName.trim().length > 0;
    if (step === 1) return state.trim().length > 0;
    if (step === 2) return description.trim().length > 0;
    return true;
  }

  function goBack() {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => Math.max(0, s - 1) as Step);
  }

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const media: Media[] = [];
      if (file) {
        const uploadInfo = await getUploadUrl({ fileName: file.name, contentType: file.type });
        await fetch(uploadInfo.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        media.push({
          url: uploadInfo.publicUrl,
          key: uploadInfo.key,
          type: fileKind as MediaType,
          size: file.size,
        });
      }

      const post = await createPost({
        personName,
        designation: designation || undefined,
        organization: organization || undefined,
        state,
        city: city || undefined,
        description,
        media,
      });
      clearComposerDraft();
      router.push(`/posts/${post.slug || post._id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong posting this.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const previewLocation = attachedPerson
    ? locationLabel(attachedPerson.location.state, attachedPerson.location.city)
    : locationLabel(state, city);
  const previewSubtitle = attachedPerson ? personSubtitle(attachedPerson) : personSubtitle({ designation, organization });
  const identityLabel = user?.anonymousIdentity.displayName ?? "";

  return (
    <div className="fixed inset-0 z-[1300] flex flex-col bg-bg-outer">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFileChosen}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="flex flex-none items-center gap-3 border-b border-border-3 px-4 py-3">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-text-muted hover:bg-border-4 hover:text-ink"
        >
          <ChevronLeftIcon />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-ink">{TOP_TITLES[step]}</p>
          <p className="truncate font-mono text-xs text-meta-2">
            Step {step + 1} of 4{identityLabel ? ` · posting as ${identityLabel}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Close"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-xl leading-none text-text-muted hover:bg-border-4 hover:text-ink"
        >
          ×
        </button>
      </div>

      <div className="flex flex-none gap-1 px-4 py-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-ink" : "bg-border-5"}`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {restoredDraft && step === 0 && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-card border border-border-5 bg-white px-3.5 py-2.5">
            <p className="text-xs text-text-muted">Draft restored from your last visit.</p>
            <button
              type="button"
              onClick={discardDraft}
              className="flex-none font-mono text-xs font-medium text-meta-2 underline hover:text-ink"
            >
              Discard
            </button>
          </div>
        )}

        <h1 className="text-2xl font-bold text-ink">{HEADINGS[step]}</h1>

        {step === 0 && (
          <div className="mt-6">
            <input
              value={personName}
              onChange={(e) => searchPeople(e.target.value)}
              placeholder="Start typing a name, office or position"
              className="w-full rounded-pill border border-border-5 bg-white px-4 py-3.5 text-sm outline-none focus:border-ink"
            />

            {attachedPerson && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-ink pl-3 pr-2 py-1.5 font-mono text-xs text-white">
                  <span className="text-white/60">ABOUT</span> {attachedPerson.name}
                  <button
                    type="button"
                    onClick={detachPerson}
                    aria-label="Detach person, choose someone else"
                    className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-white/70 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

            {attachedPerson && (
              <div className="mt-3 rounded-card border border-border-3 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="texture-avatar flex h-11 w-11 flex-none items-center justify-center rounded-xl"
                  >
                    <span className="font-mono text-[9px] text-meta-3">FACE</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-meta-2">
                      You&apos;re posting about
                    </p>
                    <p className="mt-0.5 text-base font-bold text-ink">{attachedPerson.name}</p>
                    <p className="mt-0.5 truncate text-xs text-meta-2">
                      {personSubtitle(attachedPerson)}
                      {" · "}
                      {locationLabel(attachedPerson.location.state, attachedPerson.location.city)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 font-mono text-[11px] leading-relaxed text-meta-2">
                  {attachedPerson.stats.postsCount} post
                  {attachedPerson.stats.postsCount === 1 ? "" : "s"} already on file · this post
                  will be publicly visible and appear on this person&apos;s page.
                </p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="mt-4">
                <p className="font-mono text-xs text-meta-2">Suggestions</p>
                <ul className="mt-2 space-y-2">
                  {suggestions.map((person) => (
                    <li key={person._id}>
                      <button
                        type="button"
                        onClick={() => pickSuggestion(person)}
                        className="flex w-full items-center gap-3 rounded-card border border-border-3 bg-white px-3.5 py-3 text-left hover:border-border-7"
                      >
                        <span
                          aria-hidden="true"
                          className="texture-avatar h-10 w-10 flex-none rounded-lg"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {person.name}
                          </span>
                          <span className="block truncate text-xs text-meta-2">
                            {personSubtitle(person)}
                            {" · "}
                            {locationLabel(person.location.state, person.location.city)}
                          </span>
                        </span>
                        <span className="flex-none font-mono text-xs text-meta-3">
                          {person.stats.postsCount} post{person.stats.postsCount === 1 ? "" : "s"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-3">
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className="w-full rounded-pill border border-border-5 bg-white px-4 py-3.5 text-sm outline-none focus:border-ink"
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full rounded-pill border border-border-5 bg-white px-4 py-3.5 text-sm outline-none focus:border-ink"
            />
          </div>
        )}

        {step === 2 && (
          <div className="mt-6">
            {(attachedPerson || personName) && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-border-4 px-3 py-1 font-mono text-xs text-meta-1">
                <span className="text-meta-3">ABOUT</span> {attachedPerson?.name || personName}
              </span>
            )}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Be funny. Be vague. Be legally careful."
              maxLength={5000}
              rows={7}
              className="mt-3 w-full rounded-card border border-border-5 bg-white px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openFilePicker("image")}
                className={`rounded-pill border px-4 py-2 text-sm font-medium ${
                  file && fileKind === "image"
                    ? "border-ink bg-ink text-white"
                    : "border-border-5 text-text-muted hover:bg-border-4"
                }`}
              >
                Photo
              </button>
              <button
                type="button"
                onClick={() => openFilePicker("video")}
                className={`rounded-pill border px-4 py-2 text-sm font-medium ${
                  file && fileKind === "video"
                    ? "border-ink bg-ink text-white"
                    : "border-border-5 text-text-muted hover:bg-border-4"
                }`}
              >
                Video
              </button>
              <button
                type="button"
                disabled
                title="Document attachments aren't supported yet"
                className="cursor-not-allowed rounded-pill border border-border-4 px-4 py-2 text-sm font-medium text-disabled-text"
              >
                Document
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`rounded-pill border px-4 py-2 text-sm font-medium ${
                  state
                    ? "border-ink bg-ink text-white"
                    : "border-border-5 text-text-muted hover:bg-border-4"
                }`}
              >
                {state ? locationLabel(state, city) : "Location"}
              </button>
            </div>
            {file && (
              <p className="mt-2 truncate font-mono text-xs text-meta-2">
                Attached: {file.name}
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-2 text-meta-3 underline hover:text-ink"
                >
                  remove
                </button>
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="mt-6">
            <div className="rounded-card border border-border-3 bg-white p-4">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="texture-avatar flex h-11 w-11 flex-none items-center justify-center rounded-full"
                >
                  <span className="font-mono text-[9px] text-meta-3">FACE</span>
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{attachedPerson?.name || personName}</p>
                  <p className="text-xs text-meta-2">
                    {previewSubtitle} · {previewLocation}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-text">&ldquo;{description}&rdquo;</p>
              <p className="mt-4 font-mono text-[11px] text-meta-3">
                Posted by {identityLabel || "Anonymous Citizen"}
              </p>
            </div>

            <div className="mt-4 divide-y divide-border-3 overflow-hidden rounded-card border border-border-3 bg-white">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" /> Home feed
                </p>
                <p className="font-mono text-xs text-meta-2">
                  under {identityLabel || "Anonymous Citizen"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" />{" "}
                  {(attachedPerson?.name || personName || "Their").split(" ")[0]}&apos;s page
                </p>
                <p className="font-mono text-xs text-meta-2">listed as a post about them</p>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" /> Search &amp; trending
                </p>
                <p className="font-mono text-xs text-meta-2">findable by name, city or department</p>
              </div>
            </div>

            <div className="mt-4 rounded-card bg-border-4 p-4">
              <p className="text-xs leading-relaxed text-text-muted">
                Your real account never appears. The feed only ever sees{" "}
                {identityLabel || "your citizen number"}. We don&apos;t sell or share your data,
                and we never post as you.
              </p>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex-none border-t border-border-3 bg-bg-outer p-4">
        {step < 3 ? (
          <button
            type="button"
            disabled={!canContinue()}
            onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
            className="w-full rounded-pill bg-ink py-3.5 text-sm font-semibold text-white disabled:bg-disabled-bg disabled:text-disabled-text"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={submit}
            className="w-full rounded-pill bg-ink py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Posting…" : "Post Anonymously"}
          </button>
        )}
      </div>
    </div>
  );
}
