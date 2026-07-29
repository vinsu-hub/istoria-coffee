import { getServiceClient } from "./adminAuth.js";

// Community submissions are Supabase-only, same rationale as server/menu.ts —
// this is brand-new data with no legacy fallback path to preserve.

const BUCKET = "community-uploads";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // stays well under Vercel's ~4.5MB function body limit
const MAX_COMMENT_LENGTH = 500;

export interface PublicSubmission {
  id: string;
  comment: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface PendingSubmission extends PublicSubmission {
  deviceId: string | null;
}

interface DbSubmissionRow {
  id: string;
  comment: string | null;
  image_path: string | null;
  created_at: string;
  device_id?: string | null;
}

function toPublicUrl(
  supabase: ReturnType<typeof getServiceClient>,
  path: string | null
): string | null {
  if (!path) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function toPublic(
  supabase: ReturnType<typeof getServiceClient>,
  row: DbSubmissionRow
): PublicSubmission {
  return {
    id: row.id,
    comment: row.comment,
    imageUrl: toPublicUrl(supabase, row.image_path),
    createdAt: row.created_at,
  };
}

function decodeImage(
  imageBase64: string
): { buffer: Buffer; contentType: string; ext: string } | null {
  // Expects a data URL, e.g. "data:image/jpeg;base64,...." — produced by the
  // client-side canvas resize step before upload.
  const match = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/i.exec(imageBase64);
  if (!match) return null;
  const contentType = match[1];
  const ext = /jpe?g/i.test(match[2]) ? "jpg" : match[2];
  const buffer = Buffer.from(match[3], "base64");
  return { buffer, contentType, ext };
}

export type CreateSubmissionResult =
  | { ok: true; submission: PublicSubmission }
  | { ok: false; status: number; error: string };

interface CreateSubmissionInput {
  comment?: unknown;
  imageBase64?: unknown;
  deviceId?: unknown;
}

export async function createSubmission(
  input: CreateSubmissionInput
): Promise<CreateSubmissionResult> {
  const comment = typeof input.comment === "string" ? input.comment.trim() : undefined;
  const deviceId = typeof input.deviceId === "string" ? input.deviceId : undefined;
  const imageBase64 = typeof input.imageBase64 === "string" ? input.imageBase64 : undefined;

  if (comment && comment.length > MAX_COMMENT_LENGTH) {
    return { ok: false, status: 400, error: "comment_too_long" };
  }
  if (!comment && !imageBase64) {
    return { ok: false, status: 400, error: "empty_submission" };
  }

  const supabase = getServiceClient();
  let imagePath: string | null = null;

  if (imageBase64) {
    const decoded = decodeImage(imageBase64);
    if (!decoded) {
      return { ok: false, status: 400, error: "invalid_image" };
    }
    if (decoded.buffer.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false, status: 400, error: "image_too_large" };
    }

    const path = `${crypto.randomUUID()}.${decoded.ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, decoded.buffer, { contentType: decoded.contentType });
    if (uploadError) throw uploadError;
    imagePath = path;
  }

  const { data, error } = await supabase
    .from("community_submissions")
    .insert({ comment: comment ?? null, image_path: imagePath, device_id: deviceId ?? null })
    .select("id, comment, image_path, created_at")
    .single();

  if (error) throw error;
  return { ok: true, submission: toPublic(supabase, data as DbSubmissionRow) };
}

export async function listApprovedSubmissions(): Promise<PublicSubmission[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("community_submissions")
    .select("id, comment, image_path, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) throw error;
  return (data ?? []).map((row) => toPublic(supabase, row as DbSubmissionRow));
}

export async function listPendingSubmissions(): Promise<PendingSubmission[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("community_submissions")
    .select("id, comment, image_path, created_at, device_id")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => {
    const r = row as DbSubmissionRow;
    return { ...toPublic(supabase, r), deviceId: r.device_id ?? null };
  });
}

export async function moderateSubmission(
  id: string,
  decision: "approved" | "rejected"
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("community_submissions")
    .update({ status: decision, moderated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");

  if (error) throw error;
  if (!data || data.length === 0) {
    return { ok: false, status: 404, error: "not_found" };
  }
  return { ok: true };
}
