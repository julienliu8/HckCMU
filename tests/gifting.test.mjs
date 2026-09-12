import test from "node:test";
import assert from "node:assert/strict";
import { createDemoServer } from "../server/demo.mjs";
import { flowerShapes, makePot } from "../store/model.ts";
import { validateGift } from "../store/gifting.ts";
const gift = {
  id: "test-gift",
  senderId: "alex-cottage",
  senderName: "Alex",
  recipientId: "maya-cottage",
  shape: "star",
  color: "#AABBCC",
  pot: makePot(),
  createdAt: new Date().toISOString(),
};
test("shared payload rejects journals and invalid pixels", () => {
  assert.throws(() => validateGift({ ...gift, journal: "private words" }));
  assert.throws(() => validateGift({ ...gift, pot: [[null]] }));
  assert.throws(() => validateGift({ ...gift, recipientId: "alex-cottage" }));
  assert.throws(() =>
    validateGift({ ...gift, note: "x".repeat(161) }),
  );
  assert.deepEqual(validateGift(gift), gift);
  assert.deepEqual(validateGift({ ...gift, note: "  thinking of you  " }), {
    ...gift,
    note: "thinking of you",
  });
  for (const shape of flowerShapes) {
    assert.equal(validateGift({ ...gift, shape }).shape, shape);
  }
});
test("live server delivers across clients, isolates rooms, and deduplicates retries", async () => {
  const server = createDemoServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = (payload) =>
    fetch(base + "/api/rooms/test/gifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  try {
    const giftWithNote = { ...gift, note: "a small hello" };
    assert.equal((await send(giftWithNote)).status, 201);
    assert.equal((await send(giftWithNote)).status, 200);
    const state = await (await fetch(base + "/api/rooms/test")).json();
    assert.equal(state.gifts.length, 1);
    assert.equal(state.gifts[0].recipientId, "maya-cottage");
    assert.equal(state.gifts[0].note, "a small hello");
    assert.deepEqual(
      (await (await fetch(base + "/api/rooms/other")).json()).gifts,
      [],
    );
    assert.equal(
      (await send({ ...gift, id: "private-test", journal: "do not share" }))
        .status,
      400,
    );
    assert.equal((await send({ ...gift, color: "#112233" })).status, 409);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
