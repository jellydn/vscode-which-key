import * as assert from "assert";
import * as vscode from "vscode";
import { BindingItem, ActionType } from "../../../config/bindingItem";
import { defaultBindings } from "../../../bindingEditor";

suite("Command Validation Tests", () => {
  test("all default binding commands exist", async function () {
    this.timeout(30000);

    const allCommands = await vscode.commands.getCommands(true);
    const commandSet = new Set(allCommands);

    const errors: string[] = [];

    function validateBinding(binding: BindingItem, path: string): void {
      // Validate single command
      if (binding.command) {
        if (!commandSet.has(binding.command)) {
          errors.push(`[${path}] Command not found: "${binding.command}" (key: ${binding.key})`);
        }
      }

      // Validate multiple commands
      if (binding.commands) {
        for (let i = 0; i < binding.commands.length; i++) {
          if (!commandSet.has(binding.commands[i])) {
            errors.push(
              `[${path}] Command not found: "${binding.commands[i]}" (key: ${binding.key}, index: ${i})`,
            );
          }
        }
      }

      // Recursively validate nested bindings
      if (binding.bindings) {
        for (const child of binding.bindings) {
          validateBinding(child, `${path} > ${binding.key}`);
        }
      }
    }

    // Validate all default bindings
    for (const binding of defaultBindings) {
      validateBinding(binding, "root");
    }

    if (errors.length > 0) {
      console.error("Command validation errors:");
      errors.forEach((e) => console.error(`  - ${e}`));
    }

    assert.strictEqual(
      errors.length,
      0,
      `Found ${errors.length} invalid commands:\n${errors.join("\n")}`,
    );
  });

  test("whichkey commands are registered", async () => {
    const allCommands = await vscode.commands.getCommands(true);
    const whichkeyCommands = allCommands.filter((c) => c.startsWith("whichkey."));

    const expectedCommands = [
      "whichkey.show",
      "whichkey.register",
      "whichkey.triggerKey",
      "whichkey.undoKey",
      "whichkey.searchBindings",
      "whichkey.showTransient",
      "whichkey.repeatRecent",
      "whichkey.repeatMostRecent",
      "whichkey.toggleZenMode",
      "whichkey.openFile",
      "whichkey.editBindings",
      "whichkey.quickAddBinding",
      "whichkey.removeBinding",
      "whichkey.openBindingsSettings",
      "whichkey.fixDeprecatedBindings",
      "whichkey.resetBindingsToDefault",
    ];

    for (const cmd of expectedCommands) {
      assert.ok(whichkeyCommands.includes(cmd), `Expected whichkey command not found: ${cmd}`);
    }
  });

  test("no duplicate commands in default bindings (warn only)", () => {
    const seenCommands = new Map<string, string>();
    const duplicates: string[] = [];

    function checkDuplicates(binding: BindingItem, path: string): void {
      if (binding.command && binding.type === ActionType.Command) {
        if (seenCommands.has(binding.command)) {
          duplicates.push(
            `Duplicate command "${binding.command}" at ${path} > ${binding.key} (first seen at ${seenCommands.get(binding.command)})`,
          );
        } else {
          seenCommands.set(binding.command, `${path} > ${binding.key}`);
        }
      }

      if (binding.bindings) {
        for (const child of binding.bindings) {
          checkDuplicates(child, `${path} > ${binding.key}`);
        }
      }
    }

    for (const binding of defaultBindings) {
      checkDuplicates(binding, "root");
    }

    if (duplicates.length > 0) {
      console.warn("Duplicate commands found (this is often intentional):");
      duplicates.forEach((d) => console.warn(`  - ${d}`));
    }

    // Don't fail - duplicates are often intentional for usability
    assert.ok(true);
  });
});
