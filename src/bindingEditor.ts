import { commands, window, workspace, type QuickPickItem } from "vscode";
import { contributePrefix } from "./constants";
import { ActionType, type BindingItem, type TransientBindingItem } from "./config/bindingItem";

interface BindingQuickPickItem extends QuickPickItem {
  binding?: BindingItem;
  isAddNew?: boolean;
}

/**
 * Default transient bindings configuration
 */
export const defaultTransients: Record<
  string,
  { title: string; bindings: TransientBindingItem[] }
> = {
  error: {
    title: "Error transient",
    bindings: [
      { key: "N", name: "Previous error", command: "editor.action.marker.prev" },
      { key: "n", name: "Next error", command: "editor.action.marker.next" },
      { key: "p", name: "Previous error", command: "editor.action.marker.prev" },
    ],
  },
  symbol: {
    title: "Highlight symbol transient",
    bindings: [
      { key: "p", name: "Previous occurrence", command: "editor.action.wordHighlight.prev" },
      { key: "N", name: "Previous occurrence", command: "editor.action.wordHighlight.prev" },
      { key: "n", name: "Next occurrence", command: "editor.action.wordHighlight.next" },
      {
        key: "/",
        name: "Search in a project with a selection",
        commands: ["editor.action.addSelectionToNextFindMatch", "workbench.action.findInFiles"],
      },
    ],
  },
  lineMoving: {
    title: "Line moving transient",
    bindings: [
      { key: "J", name: "Move lines down", command: "editor.action.moveLinesDownAction" },
      { key: "K", name: "Move lines up", command: "editor.action.moveLinesUpAction" },
    ],
  },
  frameZooming: {
    title: "Frame zooming transient",
    bindings: [
      { key: "=", name: "Zoom in", command: "workbench.action.zoomIn" },
      { key: "+", name: "Zoom in", command: "workbench.action.zoomIn" },
      { key: "-", name: "Zoom out", command: "workbench.action.zoomOut" },
      { key: "0", name: "Reset zoom", command: "workbench.action.zoomReset" },
    ],
  },
  fontZooming: {
    title: "Font zooming transient",
    bindings: [
      { key: "=", name: "Zoom in", command: "editor.action.fontZoomIn" },
      { key: "+", name: "Zoom in", command: "editor.action.fontZoomIn" },
      { key: "-", name: "Zoom out", command: "editor.action.fontZoomOut" },
      { key: "0", name: "Reset zoom", command: "editor.action.fontZoomReset" },
    ],
  },
  imageZooming: {
    title: "Image zooming transient",
    bindings: [
      { key: "=", name: "Zoom in", command: "imagePreview.zoomIn" },
      { key: "+", name: "Zoom in", command: "imagePreview.zoomIn" },
      { key: "-", name: "Zoom out", command: "imagePreview.zoomOut" },
    ],
  },
  smartExpand: {
    title: "Smart expand transient",
    bindings: [
      { key: "v", name: "Grow selection", command: "editor.action.smartSelect.grow" },
      { key: "V", name: "Shrink selection", command: "editor.action.smartSelect.shrink" },
    ],
  },
};

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
      const index = bindings.findIndex((b) => b.key === selected.binding?.key);
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
    const filtered = bindings.filter((b) => b.key !== selected.binding?.key);
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

/**
 * Default bindings as defined in package.json
 * This is the original VSpaceCode which-key bindings configuration
 */
export const defaultBindings: BindingItem[] = [
  {
    key: " ",
    name: "Commands",
    type: ActionType.Command,
    command: "workbench.action.showCommands",
  },
  {
    key: "\t",
    name: "Last editor",
    type: ActionType.Commands,
    commands: ["workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup", "list.select"],
  },
  {
    key: "?",
    name: "Search keybindings",
    type: ActionType.Command,
    command: "whichkey.searchBindings",
  },
  {
    key: ".",
    name: "Repeat most recent action",
    type: ActionType.Command,
    command: "whichkey.repeatMostRecent",
  },
  {
    key: "b",
    name: "+Buffers/Editors",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "b",
        name: "Show all buffers/editors",
        type: ActionType.Command,
        command: "workbench.action.showAllEditors",
      },
      {
        key: "B",
        name: "Show all buffers/editors in active group",
        type: ActionType.Command,
        command: "workbench.action.showEditorsInActiveGroup",
      },
      {
        key: "d",
        name: "Close active editor",
        type: ActionType.Command,
        command: "workbench.action.closeActiveEditor",
      },
      {
        key: "H",
        name: "Move editor into left group",
        type: ActionType.Command,
        command: "workbench.action.moveEditorToLeftGroup",
      },
      {
        key: "J",
        name: "Move editor into below group",
        type: ActionType.Command,
        command: "workbench.action.moveEditorToBelowGroup",
      },
      {
        key: "K",
        name: "Move editor into above group",
        type: ActionType.Command,
        command: "workbench.action.moveEditorToAboveGroup",
      },
      {
        key: "L",
        name: "Move editor into right group",
        type: ActionType.Command,
        command: "workbench.action.moveEditorToRightGroup",
      },
      {
        key: "M",
        name: "Close other editors",
        type: ActionType.Command,
        command: "workbench.action.closeOtherEditors",
      },
      {
        key: "n",
        name: "Next editor",
        type: ActionType.Command,
        command: "workbench.action.nextEditor",
      },
      {
        key: "p",
        name: "Previous editor",
        type: ActionType.Command,
        command: "workbench.action.previousEditor",
      },
      {
        key: "N",
        name: "New untitled editor",
        type: ActionType.Command,
        command: "workbench.action.files.newUntitledFile",
      },
      {
        key: "u",
        name: "Reopen closed editor",
        type: ActionType.Command,
        command: "workbench.action.reopenClosedEditor",
      },
      {
        key: "P",
        name: "Paste clipboard to buffer",
        type: ActionType.Commands,
        commands: ["editor.action.selectAll", "editor.action.clipboardPasteAction"],
      },
      {
        key: "y",
        name: "Copy buffer to clipboard",
        type: ActionType.Commands,
        commands: [
          "editor.action.selectAll",
          "editor.action.clipboardCopyAction",
          "cancelSelection",
        ],
      },
    ],
  },
  {
    key: "d",
    name: "+Debug",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "d",
        name: "Start debug",
        type: ActionType.Command,
        command: "workbench.action.debug.start",
      },
      {
        key: "D",
        name: "Run without debugging",
        type: ActionType.Command,
        command: "workbench.action.debug.run",
      },
      {
        key: "S",
        name: "Stop debug",
        type: ActionType.Command,
        command: "workbench.action.debug.stop",
      },
      {
        key: "c",
        name: "Continue debug",
        type: ActionType.Command,
        command: "workbench.action.debug.continue",
      },
      {
        key: "p",
        name: "Pause debug",
        type: ActionType.Command,
        command: "workbench.action.debug.pause",
      },
      {
        key: "R",
        name: "Restart debug",
        type: ActionType.Command,
        command: "workbench.action.debug.restart",
      },
      {
        key: "i",
        name: "Step into",
        type: ActionType.Command,
        command: "workbench.action.debug.stepInto",
      },
      {
        key: "s",
        name: "Step over",
        type: ActionType.Command,
        command: "workbench.action.debug.stepOver",
      },
      {
        key: "o",
        name: "Step out",
        type: ActionType.Command,
        command: "workbench.action.debug.stepOut",
      },
      {
        key: "b",
        name: "Toggle breakpoint",
        type: ActionType.Command,
        command: "editor.debug.action.toggleBreakpoint",
      },
      {
        key: "B",
        name: "Toggle inline breakpoint",
        type: ActionType.Command,
        command: "editor.debug.action.toggleInlineBreakpoint",
      },
      {
        key: "j",
        name: "Jump to cursor",
        type: ActionType.Command,
        command: "debug.jumpToCursor",
      },
      {
        key: "v",
        name: "REPL",
        type: ActionType.Command,
        command: "workbench.debug.action.toggleRepl",
      },
      {
        key: "w",
        name: "Focus on watch window",
        type: ActionType.Command,
        command: "workbench.debug.action.focusWatchView",
      },
      {
        key: "W",
        name: "Add to watch",
        type: ActionType.Command,
        command: "editor.debug.action.selectionToWatch",
      },
    ],
  },
  {
    key: "e",
    name: "+Errors",
    type: ActionType.Bindings,
    bindings: [
      {
        key: ".",
        name: "Error transient",
        type: ActionType.Command,
        command: "whichkey.showTransient",
        args: "whichkey.transient.error",
      },
      {
        key: "l",
        name: "List errors",
        type: ActionType.Command,
        command: "workbench.actions.view.problems",
      },
      {
        key: "N",
        name: "Previous error",
        type: ActionType.Command,
        command: "editor.action.marker.prev",
      },
      {
        key: "n",
        name: "Next error",
        type: ActionType.Command,
        command: "editor.action.marker.next",
      },
      {
        key: "p",
        name: "Previous error",
        type: ActionType.Command,
        command: "editor.action.marker.prev",
      },
    ],
  },
  {
    key: "f",
    name: "+File",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "f",
        name: "Open file/folder",
        type: ActionType.Command,
        command: "whichkey.openFile",
      },
      {
        key: "n",
        name: "New Untitled",
        type: ActionType.Command,
        command: "workbench.action.files.newUntitledFile",
      },
      {
        key: "w",
        name: "Open active in new window",
        type: ActionType.Command,
        command: "workbench.action.files.showOpenedFileInNewWindow",
      },
      {
        key: "s",
        name: "Save file",
        type: ActionType.Command,
        command: "workbench.action.files.save",
      },
      {
        key: "S",
        name: "Save all files",
        type: ActionType.Command,
        command: "workbench.action.files.saveAll",
      },
      {
        key: "r",
        name: "Open recent",
        type: ActionType.Command,
        command: "workbench.action.openRecent",
      },
      {
        key: "R",
        name: "Rename file",
        type: ActionType.Commands,
        commands: ["workbench.files.action.showActiveFileInExplorer", "renameFile"],
      },
      {
        key: "t",
        name: "Show tree/explorer view",
        type: ActionType.Command,
        command: "workbench.view.explorer",
      },
      {
        key: "T",
        name: "Show active file in tree/explorer view",
        type: ActionType.Command,
        command: "workbench.files.action.showActiveFileInExplorer",
      },
      {
        key: "y",
        name: "Copy path of active file",
        type: ActionType.Command,
        command: "workbench.action.files.copyPathOfActiveFile",
      },
      {
        key: "o",
        name: "Open with",
        type: ActionType.Command,
        command: "explorer.openWith",
      },
      {
        key: "l",
        name: "Change file language",
        type: ActionType.Command,
        command: "workbench.action.editor.changeLanguageMode",
      },
      {
        key: "=",
        name: "Format file",
        type: ActionType.Command,
        command: "editor.action.formatDocument",
      },
      {
        key: "i",
        name: "+Indentation",
        type: ActionType.Bindings,
        bindings: [
          {
            key: "i",
            name: "Change indentation",
            type: ActionType.Command,
            command: "editor.action.indentUsingSpaces",
          },
          {
            key: "d",
            name: "Detect indentation",
            type: ActionType.Command,
            command: "editor.action.detectIndentation",
          },
          {
            key: "r",
            name: "Reindent",
            type: ActionType.Command,
            command: "editor.action.reindentlines",
          },
          {
            key: "R",
            name: "Reindent selected",
            type: ActionType.Command,
            command: "editor.action.reindentselectedlines",
          },
          {
            key: "t",
            name: "Convert indentation to tabs",
            type: ActionType.Command,
            command: "editor.action.indentationToTabs",
          },
          {
            key: "s",
            name: "Convert indentation to spaces",
            type: ActionType.Command,
            command: "editor.action.indentationToSpaces",
          },
        ],
      },
    ],
  },
  {
    key: "g",
    name: "+Git",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "b",
        name: "Checkout",
        type: ActionType.Command,
        command: "git.checkout",
      },
      {
        key: "c",
        name: "Commit",
        type: ActionType.Command,
        command: "git.commit",
      },
      {
        key: "d",
        name: "Delete Branch",
        type: ActionType.Command,
        command: "git.deleteBranch",
      },
      {
        key: "f",
        name: "Fetch",
        type: ActionType.Command,
        command: "git.fetch",
      },
      {
        key: "i",
        name: "Init",
        type: ActionType.Command,
        command: "git.init",
      },
      {
        key: "m",
        name: "Merge",
        type: ActionType.Command,
        command: "git.merge",
      },
      {
        key: "p",
        name: "Publish",
        type: ActionType.Command,
        command: "git.publish",
      },
      {
        key: "s",
        name: "Status",
        type: ActionType.Command,
        command: "workbench.view.scm",
      },
      {
        key: "S",
        name: "Stage",
        type: ActionType.Command,
        command: "git.stage",
      },
      {
        key: "U",
        name: "Unstage",
        type: ActionType.Command,
        command: "git.unstage",
      },
    ],
  },
  {
    key: "i",
    name: "+Insert",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "j",
        name: "Insert line below",
        type: ActionType.Command,
        command: "editor.action.insertLineAfter",
      },
      {
        key: "k",
        name: "Insert line above",
        type: ActionType.Command,
        command: "editor.action.insertLineBefore",
      },
      {
        key: "s",
        name: "Insert snippet",
        type: ActionType.Command,
        command: "editor.action.insertSnippet",
      },
    ],
  },
  {
    key: "p",
    name: "+Project",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "f",
        name: "Find file in project",
        type: ActionType.Command,
        command: "workbench.action.quickOpen",
      },
      {
        key: "p",
        name: "Switch project",
        type: ActionType.Command,
        command: "workbench.action.openRecent",
      },
      {
        key: "t",
        name: "Show tree/explorer view",
        type: ActionType.Command,
        command: "workbench.view.explorer",
      },
    ],
  },
  {
    key: "q",
    name: "+Quit",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "q",
        name: "Close window",
        type: ActionType.Command,
        command: "workbench.action.closeWindow",
      },
      {
        key: "Q",
        name: "Quit VSCode",
        type: ActionType.Command,
        command: "workbench.action.quit",
      },
    ],
  },
  {
    key: "r",
    name: "+Repeat",
    type: ActionType.Bindings,
    bindings: [
      {
        key: ".",
        name: "Repeat recent actions",
        type: ActionType.Command,
        command: "whichkey.repeatRecent",
      },
    ],
  },
  {
    key: "s",
    name: "+Search/Symbol",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "e",
        name: "Edit symbol",
        type: ActionType.Command,
        command: "editor.action.rename",
      },
      {
        key: "h",
        name: "Highlight symbol transient",
        type: ActionType.Commands,
        commands: ["editor.action.wordHighlight.trigger", "whichkey.showTransient"],
        args: [null, "whichkey.transient.symbol"],
      },
      {
        key: "j",
        name: "Jump to symbol in file",
        type: ActionType.Command,
        command: "workbench.action.gotoSymbol",
      },
      {
        key: "J",
        name: "Jump to symbol in workspace",
        type: ActionType.Command,
        command: "workbench.action.showAllSymbols",
      },
      {
        key: "p",
        name: "Search in a project",
        type: ActionType.Command,
        command: "workbench.action.findInFiles",
      },
      {
        key: "P",
        name: "Search in a project with a selection",
        type: ActionType.Commands,
        commands: ["editor.action.addSelectionToNextFindMatch", "workbench.action.findInFiles"],
      },
      {
        key: "r",
        name: "Search all references",
        type: ActionType.Command,
        command: "editor.action.referenceSearch.trigger",
      },
      {
        key: "R",
        name: "Search all references in side bar",
        type: ActionType.Command,
        command: "editor.action.goToReferences",
      },
      {
        key: "s",
        name: "Search in current file",
        type: ActionType.Command,
        command: "actions.find",
      },
    ],
  },
  {
    key: "S",
    name: "+Show",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "e",
        name: "Show explorer",
        type: ActionType.Command,
        command: "workbench.view.explorer",
      },
      {
        key: "s",
        name: "Show search",
        type: ActionType.Command,
        command: "workbench.view.search",
      },
      {
        key: "g",
        name: "Show source control",
        type: ActionType.Command,
        command: "workbench.view.scm",
      },
      {
        key: "t",
        name: "Show test",
        type: ActionType.Command,
        command: "workbench.view.extension.test",
      },
      {
        key: "r",
        name: "Show remote explorer",
        type: ActionType.Command,
        command: "workbench.view.remote",
      },
      {
        key: "x",
        name: "Show extensions",
        type: ActionType.Command,
        command: "workbench.view.extensions",
      },
      {
        key: "p",
        name: "Show problem",
        type: ActionType.Command,
        command: "workbench.actions.view.problems",
      },
      {
        key: "o",
        name: "Show output",
        type: ActionType.Command,
        command: "workbench.action.output.toggleOutput",
      },
      {
        key: "d",
        name: "Show debug console",
        type: ActionType.Command,
        command: "workbench.debug.action.toggleRepl",
      },
    ],
  },
  {
    key: "t",
    name: "+Toggles",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "c",
        name: "Toggle find case sensitive",
        type: ActionType.Command,
        command: "toggleFindCaseSensitive",
      },
      {
        key: "w",
        name: "Toggle ignore trim whitespace in diff",
        type: ActionType.Command,
        command: "toggle.diff.ignoreTrimWhitespace",
      },
      {
        key: "W",
        name: "Toggle word wrap",
        type: ActionType.Command,
        command: "editor.action.toggleWordWrap",
      },
    ],
  },
  {
    key: "T",
    name: "+UI toggles",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "b",
        name: "Toggle side bar visibility",
        type: ActionType.Command,
        command: "workbench.action.toggleSidebarVisibility",
      },
      {
        key: "j",
        name: "Toggle panel visibility",
        type: ActionType.Command,
        command: "workbench.action.togglePanel",
      },
      {
        key: "t",
        name: "Toggle tab visibility",
        type: ActionType.Command,
        command: "workbench.action.showMultipleEditorTabs",
      },
      {
        key: "z",
        name: "Toggle zen mode",
        type: ActionType.Command,
        command: "workbench.action.toggleZenMode",
      },
    ],
  },
  {
    key: "w",
    name: "+Window",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "=",
        name: "Increase editor width",
        type: ActionType.Command,
        command: "workbench.action.increaseViewWidth",
      },
      {
        key: "-",
        name: "Decrease editor width",
        type: ActionType.Command,
        command: "workbench.action.decreaseViewWidth",
      },
      {
        key: "|",
        name: "Maximize editor",
        type: ActionType.Command,
        command: "workbench.action.toggleEditorWidths",
      },
      {
        key: "_",
        name: "Minimize editor",
        type: ActionType.Command,
        command: "workbench.action.toggleEditorWidths",
      },
      {
        key: "s",
        name: "Split editor",
        type: ActionType.Command,
        command: "workbench.action.splitEditor",
      },
      {
        key: "v",
        name: "Split editor vertically",
        type: ActionType.Command,
        command: "workbench.action.splitEditorOrthogonal",
      },
      {
        key: "h",
        name: "Focus left group",
        type: ActionType.Command,
        command: "workbench.action.focusLeftGroup",
      },
      {
        key: "j",
        name: "Focus below group",
        type: ActionType.Command,
        command: "workbench.action.focusBelowGroup",
      },
      {
        key: "k",
        name: "Focus above group",
        type: ActionType.Command,
        command: "workbench.action.focusAboveGroup",
      },
      {
        key: "l",
        name: "Focus right group",
        type: ActionType.Command,
        command: "workbench.action.focusRightGroup",
      },
      {
        key: "H",
        name: "Move editor left in group",
        type: ActionType.Command,
        command: "workbench.action.moveEditorLeftInGroup",
      },
      {
        key: "J",
        name: "Focus next group",
        type: ActionType.Command,
        command: "workbench.action.focusBelowGroup",
      },
      {
        key: "K",
        name: "Focus previous group",
        type: ActionType.Command,
        command: "workbench.action.focusAboveGroup",
      },
      {
        key: "L",
        name: "Move editor right",
        type: ActionType.Command,
        command: "workbench.action.moveEditorRightInGroup",
      },
      {
        key: "t",
        name: "Toggle tool/activity bar visibility",
        type: ActionType.Command,
        command: "workbench.action.toggleActivityBarVisibility",
      },
      {
        key: "F",
        name: "Toggle full screen",
        type: ActionType.Command,
        command: "workbench.action.toggleFullScreen",
      },
      {
        key: "m",
        name: "Toggle maximized panel",
        type: ActionType.Command,
        command: "workbench.action.toggleMaximizedPanel",
      },
    ],
  },
  {
    key: "z",
    name: "+View",
    type: ActionType.Bindings,
    bindings: [
      {
        key: "c",
        name: "Close sidebar",
        type: ActionType.Command,
        command: "workbench.action.closeSidebar",
      },
      {
        key: "h",
        name: "Move to left split",
        type: ActionType.Command,
        command: "workbench.action.moveEditorToLeftGroup",
      },
      {
        key: "j",
        name: "Move to below split",
        type: ActionType.Command,
        command: "workbench.action.moveEditorToBelowGroup",
      },
      {
        key: "k",
        name: "Move to above split",
        type: ActionType.Command,
        command: "workbench.action.moveEditorToAboveGroup",
      },
      {
        key: "l",
        name: "Move to right split",
        type: ActionType.Command,
        command: "workbench.action.moveEditorToRightGroup",
      },
      {
        key: "r",
        name: "Reveal active file",
        type: ActionType.Command,
        command: "workbench.files.action.showActiveFileInExplorer",
      },
      {
        key: "s",
        name: "Search in files",
        type: ActionType.Command,
        command: "workbench.action.findInFiles",
      },
      {
        key: "t",
        name: "Toggle sidebar",
        type: ActionType.Command,
        command: "workbench.action.toggleSidebarVisibility",
      },
      {
        key: "v",
        name: "Split editor",
        type: ActionType.Command,
        command: "workbench.action.splitEditor",
      },
      {
        key: "V",
        name: "Split editor vertically",
        type: ActionType.Command,
        command: "workbench.action.splitEditorDown",
      },
      {
        key: "+",
        name: "Increase editor size",
        type: ActionType.Command,
        command: "workbench.action.increaseViewSize",
      },
      {
        key: "=",
        name: "Increase editor size",
        type: ActionType.Command,
        command: "workbench.action.increaseViewSize",
      },
      {
        key: "-",
        name: "Decrease editor size",
        type: ActionType.Command,
        command: "workbench.action.decreaseViewSize",
      },
    ],
  },
];

/**
 * Save transient bindings to configuration
 */
async function saveTransients(
  transients: Record<string, { title: string; bindings: TransientBindingItem[] }>,
): Promise<void> {
  const config = workspace.getConfiguration(contributePrefix);
  await config.update("transient", transients, true);
}

/**
 * Reset bindings to default configuration
 */
export async function resetBindingsToDefault(): Promise<void> {
  const choice = await window.showWarningMessage(
    "This will replace your current bindings and transients with the default configuration. Continue?",
    { modal: true },
    "Reset to Default",
  );

  if (choice !== "Reset to Default") return;

  // Deep clone to avoid reference issues
  const defaultBindingsCopy = JSON.parse(JSON.stringify(defaultBindings));
  const defaultTransientsCopy = JSON.parse(JSON.stringify(defaultTransients));

  await Promise.all([saveBindings(defaultBindingsCopy), saveTransients(defaultTransientsCopy)]);

  window.showInformationMessage("Bindings and transients reset to default configuration.");
}

// Map of deprecated commands to their replacements
const deprecatedCommands: Record<string, string> = {};

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
