import * as assert from "assert";
import { defaultWhichKeyConfig, toWhichKeyConfig } from "../../../config/whichKeyConfig";

suite("WhichKeyConfig Tests", () => {
  suite("toWhichKeyConfig", () => {
    test("returns undefined for null", () => {
      assert.strictEqual(toWhichKeyConfig(null), undefined);
    });

    test("returns undefined for undefined", () => {
      assert.strictEqual(toWhichKeyConfig(undefined), undefined);
    });

    test("returns undefined for primitive values", () => {
      assert.strictEqual(toWhichKeyConfig("string"), undefined);
      assert.strictEqual(toWhichKeyConfig(123), undefined);
    });

    test("returns undefined for empty object", () => {
      assert.strictEqual(toWhichKeyConfig({}), undefined);
    });

    test("returns undefined when bindings is missing", () => {
      assert.strictEqual(toWhichKeyConfig({ title: "My Menu" }), undefined);
    });

    test("returns undefined when bindings is not string or array", () => {
      assert.strictEqual(toWhichKeyConfig({ bindings: 123 }), undefined);
      assert.strictEqual(toWhichKeyConfig({ bindings: { foo: "bar" } }), undefined);
    });

    test("parses config with string bindings section", () => {
      const input = {
        bindings: "whichkey.bindings",
      };
      const result = toWhichKeyConfig(input);
      assert.ok(result);
      assert.strictEqual(result?.bindings, "whichkey.bindings");
    });

    test("parses config with array bindings section", () => {
      const input = {
        bindings: ["whichkey", "bindings"],
      };
      const result = toWhichKeyConfig(input);
      assert.ok(result);
      assert.strictEqual(result?.bindings, "whichkey.bindings");
    });

    test("parses config with string overrides section", () => {
      const input = {
        bindings: "whichkey.bindings",
        overrides: "whichkey.bindingOverrides",
      };
      const result = toWhichKeyConfig(input);
      assert.ok(result);
      assert.strictEqual(result?.overrides, "whichkey.bindingOverrides");
    });

    test("parses config with array overrides section", () => {
      const input = {
        bindings: "whichkey.bindings",
        overrides: ["whichkey", "bindingOverrides"],
      };
      const result = toWhichKeyConfig(input);
      assert.ok(result);
      assert.strictEqual(result?.overrides, "whichkey.bindingOverrides");
    });

    test("parses config with title", () => {
      const input = {
        bindings: "whichkey.bindings",
        title: "My Custom Menu",
      };
      const result = toWhichKeyConfig(input);
      assert.ok(result);
      assert.strictEqual(result?.title, "My Custom Menu");
    });

    test("does not modify original object for string bindings", () => {
      const input = {
        bindings: "whichkey.bindings",
      };
      const inputCopy = { ...input };
      toWhichKeyConfig(input);
      assert.deepStrictEqual(input, inputCopy);
    });

    test("converts array bindings to string in place", () => {
      const input: { bindings: [string, string] | string } = {
        bindings: ["whichkey", "bindings"],
      };
      toWhichKeyConfig(input);
      assert.strictEqual(input.bindings, "whichkey.bindings");
    });

    test("handles empty array as invalid bindings", () => {
      assert.strictEqual(toWhichKeyConfig({ bindings: [] }), undefined);
    });

    test("handles array with wrong length as invalid", () => {
      assert.strictEqual(toWhichKeyConfig({ bindings: ["only"] }), undefined);
      assert.strictEqual(toWhichKeyConfig({ bindings: ["one", "two", "three"] }), undefined);
    });

    test("handles array with non-string elements as invalid", () => {
      assert.strictEqual(toWhichKeyConfig({ bindings: [123, "two"] }), undefined);
      assert.strictEqual(toWhichKeyConfig({ bindings: ["one", 456] }), undefined);
    });
  });

  suite("defaultWhichKeyConfig", () => {
    test("has correct default values", () => {
      assert.strictEqual(defaultWhichKeyConfig.bindings, "whichkey.bindings");
      assert.strictEqual(defaultWhichKeyConfig.overrides, "whichkey.bindingOverrides");
    });

    test("default config is valid", () => {
      const result = toWhichKeyConfig(defaultWhichKeyConfig);
      assert.ok(result);
    });
  });
});
