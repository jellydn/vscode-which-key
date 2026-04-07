import { commands, window, workspace, QuickPickItem } from "vscode";
import { contributePrefix } from "./constants";
import { ActionType, BindingItem } from "./config/bindingItem";

interface BindingQuickPickItem extends QuickPickItem {
  binding?: BindingItem;
  isAddNew?: boolean;
}

/**
 * Get current bindings from configuration
 */
function getBindings(): BindingItem[] {
  const config = workspace.getConfiguration(contributePrefix);
  return config.get<BindingItem[]>("bindings", []);
}

/**
 * Save bindings to configuration
 */
async function saveBindings(bindings: BindingItem[]): Promise<void> {
  const config = workspace.getConfiguration(contributePrefix);
  await config.update("bindings", bindings, true);
}

/**
 * Edit an existing binding
 */
async function editBinding(binding: BindingItem): Promise<BindingItem | undefined> {
  const key = await window.showInputBox({
    prompt: "Key (e.g., 'a', 'SPC', 'C-c')",
    value: binding.key,
    placeHolder: "Enter the key for this binding",
  });

  if (!key) return undefined;

  const name = await window.showInputBox({
    prompt: "Name (displayed in menu)",
    value: binding.name,
    placeHolder: "e.g., 'Save file' or '+File commands'",
  });

  if (!name) return undefined;

  const typeChoices = ["command", "commands", "bindings", "transient", "conditional"];
  const type = (await window.showQuickPick(typeChoices, {
    placeHolder: "Select binding type",
    title: "Binding Type",
  })) as ActionType | undefined;

  if (!type) return undefined;

  const updated: BindingItem = {
    key,
    name,
    type,
  };

  if (type === ActionType.Command) {
    const command = await window.showInputBox({
      prompt: "VSCode Command ID",
      value: binding.command || "",
      placeHolder: "e.g., workbench.action.files.save",
    });
    if (command) updated.command = command;
  } else if (type === ActionType.Commands) {
    const commandsStr = await window.showInputBox({
      prompt: "VSCode Command IDs (comma-separated)",
      value: binding.commands?.join(", ") || "",
      placeHolder: "e.g., editor.action.selectAll, editor.action.clipboardCopyAction",
    });
    if (commandsStr) updated.commands = commandsStr.split(",").map((c) => c.trim());
  }

  // Preserve other properties
  if (binding.icon) updated.icon = binding.icon;
  if (binding.bindings) updated.bindings = binding.bindings;

  return updated;
}

/**
 * Create a new binding
 */
async function createBinding(): Promise<BindingItem | undefined> {
  const key = await window.showInputBox({
    prompt: "Key (e.g., 'a', 'SPC', 'C-c')",
    placeHolder: "Enter the key for this binding",
  });

  if (!key) return undefined;

  const name = await window.showInputBox({
    prompt: "Name (displayed in menu)",
    placeHolder: "e.g., 'Save file' or '+File commands'",
  });

  if (!name) return undefined;

  const typeChoices = [
    {
      label: "$(play) Command",
      value: ActionType.Command,
      description: "Execute a single VSCode command",
    },
    {
      label: "$(play-circle) Commands",
      value: ActionType.Commands,
      description: "Execute multiple commands in sequence",
    },
    {
      label: "$(list-tree) Bindings",
      value: ActionType.Bindings,
      description: "Open a submenu with more bindings",
    },
    {
      label: "$(clock) Transient",
      value: ActionType.Transient,
      description: "Show a transient menu that stays open",
    },
  ];

  const typeSelected = await window.showQuickPick(typeChoices, {
    placeHolder: "Select binding type",
    title: "Binding Type",
  });

  if (!typeSelected) return undefined;

  const binding: BindingItem = {
    key,
    name,
    type: typeSelected.value,
  };

  if (typeSelected.value === ActionType.Command) {
    const command = await window.showInputBox({
      prompt: "VSCode Command ID",
      placeHolder: "e.g., workbench.action.files.save",
    });
    if (command) binding.command = command;
  } else if (typeSelected.value === ActionType.Commands) {
    const commandsStr = await window.showInputBox({
      prompt: "VSCode Command IDs (comma-separated)",
      placeHolder: "e.g., editor.action.selectAll, editor.action.clipboardCopyAction",
    });
    if (commandsStr) binding.commands = commandsStr.split(",").map((c) => c.trim());
  }

  return binding;
}

/**
 * Show bindings editor UI
 */
export async function showBindingsEditor(): Promise<void> {
  const bindings = getBindings();

  const items: BindingQuickPickItem[] = [
    {
      label: "$(add) Add New Binding",
      description: "Create a new keybinding",
      isAddNew: true,
    },
    { label: "", kind: -1 }, // separator
    ...bindings.map(
      (b): BindingQuickPickItem => ({
        label: `${b.key}: ${b.name}`,
        description: b.type,
        detail: b.command || (b.commands?.join(", ") ?? ""),
        binding: b,
      }),
    ),
  ];

  const selected = await window.showQuickPick(items, {
    placeHolder: "Select a binding to edit or add new",
    title: "Which Key Bindings Editor",
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (!selected) return;

  if (selected.isAddNew) {
    const newBinding = await createBinding();
    if (newBinding) {
      bindings.push(newBinding);
      await saveBindings(bindings);
      window.showInformationMessage(`Binding '${newBinding.key}' added successfully!`);
      // Refresh editor
      showBindingsEditor();
    }
  } else if (selected.binding) {
    // Edit existing
    const updated = await editBinding(selected.binding);
    if (updated) {
      const index = bindings.findIndex((b) => b.key === selected.binding!.key);
      if (index >= 0) {
        bindings[index] = updated;
        await saveBindings(bindings);
        window.showInformationMessage(`Binding '${updated.key}' updated successfully!`);
      }
    }
  }
}

/**
 * Quick add binding - simplified workflow
 */
export async function quickAddBinding(): Promise<void> {
  const binding = await createBinding();
  if (!binding) return;

  const bindings = getBindings();

  // Check for duplicate key
  const existingIndex = bindings.findIndex((b) => b.key === binding.key);
  if (existingIndex >= 0) {
    const choice = await window.showWarningMessage(
      `Binding '${binding.key}' already exists. Replace it?`,
      "Replace",
      "Cancel",
    );
    if (choice !== "Replace") return;
    bindings[existingIndex] = binding;
  } else {
    bindings.push(binding);
  }

  await saveBindings(bindings);
  window.showInformationMessage(`Binding '${binding.key}' added successfully!`);
}

/**
 * Remove a binding
 */
export async function removeBinding(): Promise<void> {
  const bindings = getBindings();

  const items = bindings.map(
    (b): BindingQuickPickItem => ({
      label: `${b.key}: ${b.name}`,
      description: b.type,
      binding: b,
    }),
  );

  const selected = await window.showQuickPick(items, {
    placeHolder: "Select a binding to remove",
    title: "Remove Binding",
  });

  if (!selected?.binding) return;

  const confirm = await window.showWarningMessage(
    `Are you sure you want to remove binding '${selected.binding.key}: ${selected.binding.name}'?`,
    "Remove",
    "Cancel",
  );

  if (confirm === "Remove") {
    const filtered = bindings.filter((b) => b.key !== selected.binding!.key);
    await saveBindings(filtered);
    window.showInformationMessage(`Binding '${selected.binding.key}' removed successfully!`);
  }
}

/**
 * Open settings.json with whichkey bindings
 */
export async function openBindingsSettings(): Promise<void> {
  const config = workspace.getConfiguration(contributePrefix);
  const configTarget = config.inspect("bindings");

  // Determine if it's in user or workspace settings
  const isWorkspace = configTarget?.workspaceValue !== undefined;
  const setting = isWorkspace ? "whichkey.bindings" : "whichkey.bindings";

  await commands.executeCommand("workbench.action.openSettingsJson", { query: setting });
}

// Map of deprecated commands to their replacements
const deprecatedCommands: Record<string, string> = {
  "workbench.action.toggleTabsVisibility": "workbench.action.toggleEditorTabsVisibility",
};

/**
 * Fix deprecated commands in bindings
 */
export async function fixDeprecatedBindings(): Promise<void> {
  const bindings = getBindings();
  let fixedCount = 0;

  function fixBinding(binding: BindingItem): boolean {
    let wasFixed = false;

    // Fix command
    if (binding.command && deprecatedCommands[binding.command]) {
      binding.command = deprecatedCommands[binding.command];
      wasFixed = true;
    }

    // Fix commands array
    if (binding.commands) {
      for (let i = 0; i < binding.commands.length; i++) {
        if (deprecatedCommands[binding.commands[i]]) {
          binding.commands[i] = deprecatedCommands[binding.commands[i]];
          wasFixed = true;
        }
      }
    }

    // Recursively fix nested bindings
    if (binding.bindings) {
      for (const child of binding.bindings) {
        if (fixBinding(child)) {
          wasFixed = true;
        }
      }
    }

    return wasFixed;
  }

  for (const binding of bindings) {
    if (fixBinding(binding)) {
      fixedCount++;
    }
  }

  if (fixedCount > 0) {
    await saveBindings(bindings);
    window.showInformationMessage(`Fixed ${fixedCount} binding(s) with deprecated commands.`);
  } else {
    window.showInformationMessage("No deprecated commands found in your bindings.");
  }
}
