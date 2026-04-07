import * as assert from "assert";
import { ActionType, CommandItem, toBindingItem, toCommands } from "../../../config/bindingItem";

suite("BindingItem Tests", () => {
  suite("toBindingItem", () => {
    test("returns undefined for null", () => {
      assert.strictEqual(toBindingItem(null), undefined);
    });

    test("returns undefined for undefined", () => {
      assert.strictEqual(toBindingItem(undefined), undefined);
    });

    test("returns undefined for primitive values", () => {
      assert.strictEqual(toBindingItem("string"), undefined);
      assert.strictEqual(toBindingItem(123), undefined);
      assert.strictEqual(toBindingItem(true), undefined);
    });

    test("returns undefined for empty object", () => {
      assert.strictEqual(toBindingItem({}), undefined);
    });

    test("returns undefined when missing required fields", () => {
      assert.strictEqual(toBindingItem({ key: "a", name: "Test" }), undefined);
      assert.strictEqual(toBindingItem({ key: "a", type: ActionType.Command }), undefined);
      assert.strictEqual(toBindingItem({ name: "Test", type: ActionType.Command }), undefined);
    });

    test("returns BindingItem for valid command binding", () => {
      const input = {
        key: "a",
        name: "Test Command",
        type: ActionType.Command,
        command: "workbench.action.showCommands",
      };
      const result = toBindingItem(input);
      assert.ok(result);
      assert.strictEqual(result?.key, "a");
      assert.strictEqual(result?.name, "Test Command");
      assert.strictEqual(result?.type, ActionType.Command);
      assert.strictEqual(result?.command, "workbench.action.showCommands");
    });

    test("returns BindingItem for valid bindings group", () => {
      const input = {
        key: "b",
        name: "Buffer Commands",
        type: ActionType.Bindings,
        bindings: [
          {
            key: "n",
            name: "Next",
            type: ActionType.Command,
            command: "workbench.action.nextEditor",
          },
        ],
      };
      const result = toBindingItem(input);
      assert.ok(result);
      assert.strictEqual(result?.key, "b");
      assert.strictEqual(result?.type, ActionType.Bindings);
      assert.strictEqual(result?.bindings?.length, 1);
    });

    test("returns BindingItem with optional icon", () => {
      const input = {
        key: "f",
        name: "Find",
        type: ActionType.Command,
        command: "actions.find",
        icon: "search",
      };
      const result = toBindingItem(input);
      assert.ok(result);
      assert.strictEqual(result?.icon, "search");
    });

    test("returns BindingItem with display option", () => {
      const input = {
        key: "x",
        name: "Hidden Command",
        type: ActionType.Command,
        command: "some.command",
        display: "hidden",
      };
      const result = toBindingItem(input);
      assert.ok(result);
      assert.strictEqual(result?.display, "hidden");
    });
  });

  suite("toCommands", () => {
    test("extracts single command correctly", () => {
      const item: CommandItem = {
        command: "workbench.action.showCommands",
      };
      const result = toCommands(item);
      assert.deepStrictEqual(result.commands, ["workbench.action.showCommands"]);
      assert.deepStrictEqual(result.args, []);
    });

    test("extracts single command with args", () => {
      const item: CommandItem = {
        command: "editor.action.insertSnippet",
        args: { name: "mySnippet" },
      };
      const result = toCommands(item);
      assert.deepStrictEqual(result.commands, ["editor.action.insertSnippet"]);
      assert.deepStrictEqual(result.args, [{ name: "mySnippet" }]);
    });

    test("extracts multiple commands", () => {
      const item: CommandItem = {
        commands: ["editor.action.selectAll", "editor.action.clipboardCopyAction"],
      };
      const result = toCommands(item);
      assert.deepStrictEqual(result.commands, [
        "editor.action.selectAll",
        "editor.action.clipboardCopyAction",
      ]);
      assert.deepStrictEqual(result.args, []);
    });

    test("extracts multiple commands with shared args", () => {
      const item: CommandItem = {
        commands: ["cmd1", "cmd2"],
        args: { shared: true },
      };
      const result = toCommands(item);
      assert.deepStrictEqual(result.commands, ["cmd1", "cmd2"]);
      assert.deepStrictEqual(result.args, [{ shared: true }]);
    });

    test("handles empty command item", () => {
      const item: CommandItem = {};
      const result = toCommands(item);
      assert.deepStrictEqual(result.commands, []);
      assert.deepStrictEqual(result.args, []);
    });

    test("handles null/undefined args gracefully", () => {
      const item: CommandItem = {
        command: "test.command",
        args: null as unknown as undefined,
      };
      const result = toCommands(item);
      assert.deepStrictEqual(result.commands, ["test.command"]);
      assert.deepStrictEqual(result.args, []);
    });
  });
});
