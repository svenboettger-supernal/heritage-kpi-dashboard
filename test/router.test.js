import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHash } from "../src/router.js";

test("empty / root hash returns overview", () => {
  assert.deepEqual(parseHash(""),       { view: "overview", params: {} });
  assert.deepEqual(parseHash("#/"),     { view: "overview", params: {} });
  assert.deepEqual(parseHash("#"),      { view: "overview", params: {} });
});

test("removed about hash falls back to overview", () => {
  assert.deepEqual(parseHash("#/about"), { view: "overview", params: {} });
});

test("domain hash returns domain with slug param", () => {
  assert.deepEqual(parseHash("#/domain/flow-diagram"),
    { view: "domain", params: { slug: "flow-diagram" } });
  assert.deepEqual(parseHash("#/domain/estate-distribution-chart"),
    { view: "domain", params: { slug: "estate-distribution-chart" } });
});

test("unknown hash falls back to overview", () => {
  assert.deepEqual(parseHash("#/garbage"), { view: "overview", params: {} });
  assert.deepEqual(parseHash("#/domain/"), { view: "overview", params: {} });
});
