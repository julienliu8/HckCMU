export type Shape = "daisy" | "tulip" | "star";
export type Feeling = "bright" | "quiet" | "heavy";
export type Pixels = (string | null)[][];
export type Bloom = {
  id: string;
  date: string;
  shape: Shape;
  color: string;
  feeling: Feeling;
  journal: string;
  trimmed: boolean;
};
export type Friend = {
  id: string;
  name: string;
  note: string;
  pot: Pixels;
  flowers: [
    Pick<Bloom, "shape" | "color">,
    Pick<Bloom, "shape" | "color">,
    Pick<Bloom, "shape" | "color">,
  ];
};
export type FriendContact = {
  id: string;
  name: string;
};
export const MAX_FRIENDS = 8;
export const palette = [
  "#D64545",
  "#F5822A",
  "#F7C948",
  "#6B8E3B",
  "#4F9ED9",
  "#74BCA8",
];
export const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function makePot(base = "#9E451C", accent = "#F7C948"): Pixels {
  return Array.from({ length: 20 }, (_, y) =>
    Array.from({ length: 20 }, (_, x) => {
      if (y < 7 || y > 18) return null;
      if (y < 10)
        return x >= 2 && x <= 17 ? (y === 7 ? "#662305" : accent) : null;
      const inset = y > 16 ? 5 : y > 12 ? 4 : 3;
      if (x < inset || x > 19 - inset) return null;
      if (x === inset || x === 19 - inset || y === 18) return "#662305";
      if (y >= 12 && y <= 14 && x >= 8 && x <= 11) return accent;
      return base;
    }),
  );
}
export function paintPixel(
  pixels: Pixels,
  row: number,
  col: number,
  color: string | null,
): Pixels {
  if (
    !Number.isInteger(row) ||
    !Number.isInteger(col) ||
    row < 0 ||
    row >= 20 ||
    col < 0 ||
    col >= 20
  )
    return pixels;
  return pixels.map((line, r) =>
    r === row ? line.map((cell, c) => (c === col ? color : cell)) : line,
  );
}
export function createHistory(now = new Date()): Bloom[] {
  const notes = [
    "I let myself take the long way home.",
    "Too much noise today. Writing it down helps.",
    "A small win: I asked for help.",
    "Tea with a friend made the afternoon softer.",
    "I felt a little far away from everyone.",
    "Nothing big happened. That was enough.",
    "We laughed until the bus came.",
  ];
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (14 - i));
    return {
      id: `seed-${i}`,
      date: localDay(d),
      shape: (["daisy", "tulip", "star"] as Shape[])[i % 3],
      color: palette[i % palette.length],
      feeling: (
        [
          "bright",
          "heavy",
          "quiet",
          "bright",
          "heavy",
          "quiet",
          "bright",
        ] as Feeling[]
      )[i % 7],
      journal: notes[i % 7],
      trimmed: false,
    };
  });
}
export const mockFriends: Friend[] = [
  {
    id: "maya",
    name: "Maya",
    note: "a little sunshine",
    pot: makePot("#C46A3D", "#F7C948"),
    flowers: [
      { shape: "daisy", color: palette[0] },
      { shape: "tulip", color: palette[1] },
      { shape: "star", color: palette[2] },
    ],
  },
  {
    id: "ian",
    name: "Ian",
    note: "taking it slowly",
    pot: makePot("#4F9ED9", "#74BCA8"),
    flowers: [
      { shape: "star", color: palette[4] },
      { shape: "daisy", color: palette[5] },
      { shape: "tulip", color: palette[3] },
    ],
  },
  {
    id: "leo",
    name: "Leo",
    note: "finding my rhythm",
    pot: makePot("#6B8E3B", "#F7C948"),
    flowers: [
      { shape: "tulip", color: palette[6] },
      { shape: "star", color: palette[2] },
      { shape: "daisy", color: palette[1] },
    ],
  },
];
export function nightAmount(date: Date): number {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < 6 || hour >= 20) return 1;
  if (hour < 8) return 1 - (hour - 6) / 2;
  if (hour < 18) return 0;
  return (hour - 18) / 2;
}
