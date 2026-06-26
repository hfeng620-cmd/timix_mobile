export type SubmissionStatus = "pending" | "approved" | "rejected";

export type StationSubmission = {
  id: string;
  kind: "新站点" | "纠错" | "补充备注";
  stationName: string;
  url: string;
  priceOrRate: string;
  note: string;
  contact: string;
  status: SubmissionStatus;
  adminNote: string;
  submittedAt: string;
  reviewedAt?: string;
};

const STORAGE_KEY = "timin-station-submissions";
const RECENT_DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

type StationSubmissionInput = Omit<
  StationSubmission,
  "id" | "status" | "adminNote" | "submittedAt"
>;

function isSubmissionKind(value: unknown): value is StationSubmission["kind"] {
  return value === "新站点" || value === "纠错" || value === "补充备注";
}

function isSubmissionStatus(value: unknown): value is SubmissionStatus {
  return value === "pending" || value === "approved" || value === "rejected";
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function normalizeStoredSubmission(value: unknown): StationSubmission | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const reviewedAt = candidate.reviewedAt;

  if (
    typeof candidate.id !== "string" ||
    !isSubmissionKind(candidate.kind) ||
    typeof candidate.stationName !== "string" ||
    typeof candidate.url !== "string" ||
    typeof candidate.priceOrRate !== "string" ||
    typeof candidate.note !== "string" ||
    typeof candidate.contact !== "string" ||
    !isSubmissionStatus(candidate.status) ||
    typeof candidate.adminNote !== "string" ||
    !isValidIsoDate(candidate.submittedAt) ||
    (reviewedAt !== undefined && reviewedAt !== null && !isValidIsoDate(reviewedAt))
  ) {
    return null;
  }

  return {
    id: candidate.id,
    kind: candidate.kind,
    stationName: candidate.stationName,
    url: candidate.url,
    priceOrRate: candidate.priceOrRate,
    note: candidate.note,
    contact: candidate.contact,
    status: candidate.status,
    adminNote: candidate.adminNote,
    submittedAt: candidate.submittedAt,
    reviewedAt: typeof reviewedAt === "string" ? reviewedAt : undefined,
  };
}

function isRecentDuplicateSubmission(
  item: StationSubmission,
  input: StationSubmissionInput,
  now: number,
) {
  if (item.status !== "pending") {
    return false;
  }

  const submittedAt = Date.parse(item.submittedAt);
  if (!Number.isFinite(submittedAt) || now - submittedAt > RECENT_DUPLICATE_WINDOW_MS) {
    return false;
  }

  return (
    item.kind === input.kind &&
    item.stationName === input.stationName &&
    item.url === input.url &&
    item.priceOrRate === input.priceOrRate &&
    item.note === input.note &&
    item.contact === input.contact
  );
}

export function loadStationSubmissions(): StationSubmission[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeStoredSubmission(item))
      .filter((item): item is StationSubmission => item !== null);
  } catch {
    return [];
  }
}

export function saveStationSubmissions(submissions: StationSubmission[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch {
    throw new Error("本地保存失败，请检查浏览器存储权限后重试。");
  }
}

export function createSubmission(
  input: StationSubmissionInput,
) {
  const current = loadStationSubmissions();
  const now = Date.now();
  const duplicate = current.find((item) =>
    isRecentDuplicateSubmission(item, input, now),
  );

  if (duplicate) {
    throw new Error("相同内容已在最近 5 分钟内提交，无需重复提交。");
  }

  const next: StationSubmission = {
    ...input,
    id: `${now}-${Math.random().toString(16).slice(2, 8)}`,
    status: "pending",
    adminNote: "",
    submittedAt: new Date().toISOString(),
  };

  saveStationSubmissions([next, ...current]);
  return next;
}

export function updateSubmissionReview(
  id: string,
  updates: Pick<StationSubmission, "status" | "adminNote">,
) {
  const current = loadStationSubmissions();
  const next = current.map((item) =>
    item.id === id
      ? {
          ...item,
          status: updates.status,
          adminNote: updates.adminNote,
          reviewedAt: new Date().toISOString(),
        }
      : item,
  );

  saveStationSubmissions(next);
  return next;
}
