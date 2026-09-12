import type { Pixels, Shape } from "./model";
export type Gift = {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  shape: Shape;
  color: string;
  pot: Pixels;
  createdAt: string;
  note?: string;
};
const hex = /^#[0-9a-f]{6}$/i;
const idPattern = /^[a-z0-9-]{3,32}$/;
const giftShapes: readonly Shape[] = [
  "daisy",
  "tulip",
  "star",
  "rose",
  "sunflower",
  "lavender",
];
export const MAX_GIFT_NOTE_LENGTH = 160;
/** Shared data is intentionally allowlisted. No journal or draft object can enter a gift. */
export function validateGift(input: unknown): Gift {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid flower");
  const g = input as Record<string, unknown>;
  const keys = [
    "id",
    "senderId",
    "senderName",
    "recipientId",
    "shape",
    "color",
    "pot",
    "createdAt",
    "note",
  ];
  if (Object.keys(g).some((k) => !keys.includes(k)))
    throw new Error("Only flower gifts and notes may be shared");
  if (typeof g.id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(g.id))
    throw new Error("Invalid gift ID");
  if (
    typeof g.senderId !== "string" ||
    typeof g.recipientId !== "string" ||
    !idPattern.test(g.senderId) ||
    !idPattern.test(g.recipientId) ||
    g.senderId === g.recipientId
  )
    throw new Error("Choose another friend code");
  if (typeof g.senderName !== "string" || !g.senderName.trim())
    throw new Error("Sender name is required");
  if (
    !giftShapes.includes(g.shape as Shape) ||
    typeof g.color !== "string" ||
    !hex.test(g.color)
  )
    throw new Error("Invalid flower appearance");
  if (
    !Array.isArray(g.pot) ||
    g.pot.length !== 20 ||
    !g.pot.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 20 &&
        row.every((c) => c === null || (typeof c === "string" && hex.test(c))),
    )
  )
    throw new Error("Pot must contain 20 by 20 color pixels");
  if (
    typeof g.createdAt !== "string" ||
    !Number.isFinite(Date.parse(g.createdAt))
  )
    throw new Error("Invalid date");
  const note = typeof g.note === "string" ? g.note.trim() : "";
  if (
    g.note !== undefined &&
    (typeof g.note !== "string" || note.length > MAX_GIFT_NOTE_LENGTH)
  )
    throw new Error("Invalid note");
  return {
    id: g.id,
    senderId: g.senderId as string,
    senderName: g.senderName.trim().slice(0, 32),
    recipientId: g.recipientId as string,
    shape: g.shape as Shape,
    color: g.color,
    pot: g.pot as Pixels,
    createdAt: g.createdAt,
    ...(note ? { note: note.slice(0, MAX_GIFT_NOTE_LENGTH) } : {}),
  };
}
