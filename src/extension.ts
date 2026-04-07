import { commands, ExtensionContext, workspace } from "vscode";
import {
  showBindingsEditor,
  quickAddBinding,
  removeBinding,
  openBindingsSettings,
  fixDeprecatedBindings,
  resetBindingsToDefault,
  defaultBindings,
  defaultTransients,
} from "./bindingEditor";
import { CommandRelay } from "./commandRelay";
import { Commands, contributePrefix } from "./constants";
import { showTransientMenu } from "./menu/transientMenu";
import { StatusBar } from "./statusBar";
import { WhichKeyRegistry } from "./whichKeyRegistry";

async function openFile(): Promise<void> {
  try {
    await commands.executeCommand("workbench.action.files.openFile");
  } catch {
    // Mac only command
    // https://github.com/microsoft/vscode/issues/5437#issuecomment-211500871
    await commands.executeCommand("workbench.action.files.openFileFolder");
  }
}

/**
 * Initialize default bindings if user has no custom configuration
 */
async function initializeDefaultsIfEmpty(): Promise<void> {
  const config = workspace.getConfiguration(contributePrefix);

  // Check if user has defined any bindings or transients
  const bindings = config.get<unknown[]>("bindings");
  const transients = config.get<Record<string, unknown>>("transient");

  // If neither bindings nor transients are set, initialize with defaults
  if (
    (!bindings || bindings.length === 0) &&
    (!transients || Object.keys(transients).length === 0)
  ) {
    // Deep clone to avoid reference issues
    const defaultBindingsCopy = JSON.parse(JSON.stringify(defaultBindings));
    const defaultTransientsCopy = JSON.parse(JSON.stringify(defaultTransients));

    await Promise.all([
      config.update("bindings", defaultBindingsCopy, true),
      config.update("transient", defaultTransientsCopy, true),
    ]);

    console.log("[WhichKey] Initialized default bindings and transients for new user");
  }
}

export function activate(context: ExtensionContext): void {
  const statusBar = new StatusBar();
  const cmdRelay = new CommandRelay();
  const registry = new WhichKeyRegistry(statusBar, cmdRelay);

  // Initialize defaults if user has no configuration (runs silently)
  initializeDefaultsIfEmpty().catch((err) => {
    console.error("[WhichKey] Failed to initialize defaults:", err);
  });

  context.subscriptions.push(
    commands.registerCommand(Commands.Trigger, cmdRelay.triggerKey, cmdRelay),
    commands.registerCommand(Commands.UndoKey, cmdRelay.undoKey, cmdRelay),
    commands.registerCommand(Commands.Register, registry.register, registry),
    commands.registerCommand(Commands.Show, registry.show, registry),
    commands.registerCommand(Commands.SearchBindings, cmdRelay.searchBindings, cmdRelay),
    commands.registerCommand(
      Commands.ShowTransient,
      showTransientMenu.bind(registry, statusBar, cmdRelay),
    ),
    commands.registerCommand(Commands.RepeatRecent, registry.repeatRecent, registry),
    commands.registerCommand(Commands.RepeatMostRecent, registry.repeatMostRecent, registry),
    commands.registerCommand(Commands.ToggleZen, cmdRelay.toggleZenMode, cmdRelay),
    commands.registerCommand(Commands.OpenFile, openFile),
    // Binding editor commands
    commands.registerCommand(Commands.EditBindings, showBindingsEditor),
    commands.registerCommand(Commands.QuickAddBinding, quickAddBinding),
    commands.registerCommand(Commands.RemoveBinding, removeBinding),
    commands.registerCommand(Commands.OpenBindingsSettings, openBindingsSettings),
    commands.registerCommand(Commands.FixDeprecatedBindings, fixDeprecatedBindings),
    commands.registerCommand(Commands.ResetBindingsToDefault, resetBindingsToDefault),
  );

  context.subscriptions.push(registry, cmdRelay, statusBar);
}
