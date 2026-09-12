import type { Pixels, Shape } from "./model";
export const demoPeople = [
  { id: "you", name: "Alex" },
  { id: "maya", name: "Maya" },
  { id: "ian", name: "Ian" },
  { id: "leo", name: "Leo" },
];
export type Gift = {
  id: string;
  sender: string;
  recipient: string;
  shape: Shape;
  color: string;
  pot: Pixels;
  createdAt: string;
};
const hex = /^#[0-9a-f]{6}$/i;
/** Shared data is intentionally allowlisted. No journal or draft object can enter a gift. */
export function validateGift(input: unknown): Gift {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid flower");
  const g = input as Record<string, unknown>;
  const keys = [
    "id",
    "sender",
    "recipient",
    "shape",
    "color",
    "pot",
    "createdAt",
  ];
  if (Object.keys(g).some((k) => !keys.includes(k)))
    throw new Error("Only flower appearance and pot pixels may be shared");
  if (typeof g.id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(g.id))
    throw new Error("Invalid gift ID");
  if (
    !demoPeople.some((p) => p.id === g.sender) ||
    !demoPeople.some((p) => p.id === g.recipient) ||
    g.sender === g.recipient
  )
    throw new Error("Choose another demo person");
  if (
    !["daisy", "tulip", "star"].includes(String(g.shape)) ||
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
  return {
    id: g.id,
    sender: g.sender as string,
    recipient: g.recipient as string,
    shape: g.shape as Shape,
    color: g.color,
    pot: g.pot as Pixels,
    createdAt: g.createdAt,
  };
}
export const personName = (id: string) =>
  demoPeople.find((p) => p.id === id)?.name ?? id;

