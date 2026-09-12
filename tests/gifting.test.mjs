import test from "node:test";
import assert from "node:assert/strict";
import { createDemoServer } from "../server/demo.mjs";
import { makePot } from "../store/model.ts";
import { validateGift } from "../store/gifting.ts";
const gift = {
  id: "test-gift",
  sender: "you",
  recipient: "maya",
  shape: "star",
  color: "#AABBCC",
  pot: makePot(),
  createdAt: new Date().toISOString(),
};
test("shared payload rejects journals and invalid pixels", () => {
  assert.throws(() => validateGift({ ...gift, journal: "private words" }));
  assert.throws(() => validateGift({ ...gift, pot: [[null]] }));
  assert.throws(() => validateGift({ ...gift, recipient: "you" }));
  assert.deepEqual(validateGift(gift), gift);
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
    assert.equal((await send(gift)).status, 201);
    assert.equal((await send(gift)).status, 200);
    const state = await (await fetch(base + "/api/rooms/test")).json();
    assert.equal(state.gifts.length, 1);
    assert.equal(state.gifts[0].recipient, "maya");
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
