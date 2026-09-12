import test from "node:test";
import assert from "node:assert/strict";
import {
  createHistory,
  makePot,
  paintPixel,
  mockFriends,
  nightAmount,
  localDay,
} from "../store/model.ts";
test("history is fourteen previous local dates across month boundaries", () => {
  const now = new Date(2026, 8, 3, 12);
  const history = createHistory(now);
  assert.equal(history.length, 14);
  assert.equal(new Set(history.map((b) => b.date)).size, 14);
  assert.equal(history[0].date, "2026-08-20");
  assert.equal(history.at(-1).date, "2026-09-02");
  assert.ok(history.some((b) => b.feeling === "heavy"));
  assert.ok(history.some((b) => b.feeling === "bright"));
  assert.ok(history.every((b) => b.date !== localDay(now)));
});
test("each friend has exactly three flowers and a separately painted 20x20 pot", () => {
  assert.equal(mockFriends.length, 3);
  for (const friend of mockFriends) {
    assert.equal(friend.flowers.length, 3);
    assert.equal(friend.pot.length, 20);
    assert.ok(friend.pot.every((r) => r.length === 20));
  }
  assert.notDeepEqual(mockFriends[0].pot, mockFriends[1].pot);
});
test("painting changes one cell without mutating previous state and supports erasing", () => {
  const before = makePot();
  const after = paintPixel(before, 10, 10, "#123456");
  assert.equal(after[10][10], "#123456");
  assert.notEqual(before[10][10], "#123456");
  assert.equal(after[9], before[9]);
  assert.equal(paintPixel(after, 10, 10, null)[10][10], null);
  assert.equal(paintPixel(before, -1, 20, "#000000"), before);
});
test("day and night transition smoothly around dawn and dusk", () => {
  const at = (hour) => new Date(2026, 8, 12, hour);
  assert.equal(nightAmount(at(2)), 1);
  assert.equal(nightAmount(at(6)), 1);
  assert.equal(nightAmount(at(7)), 0.5);
  assert.equal(nightAmount(at(8)), 0);
  assert.equal(nightAmount(at(18)), 0);
  assert.equal(nightAmount(at(19)), 0.5);
  assert.equal(nightAmount(at(20)), 1);
});
