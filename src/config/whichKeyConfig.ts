import { Configs } from "../constants";

type ConfigSections = [string, string];

export interface WhichKeyConfig {
  bindings: string;
  overrides?: string;
  title?: string;
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function isConfigSections(x: unknown): x is ConfigSections {
  if (!x || !Array.isArray(x)) {
    return false;
  }
  return x.length === 2 && isString(x[0]) && isString(x[1]);
}

function isWhichKeyConfig(config: unknown): config is WhichKeyConfig {
  if (typeof config !== "object" || config === null) {
    return false;
  }
  const c = config as Record<string, unknown>;
  return (
    typeof c.bindings === "string" &&
    (!c.overrides || typeof c.overrides === "string") &&
    (!c.title || typeof c.title === "string")
  );
}

function getFullSection(sections: ConfigSections): string {
  return `${sections[0]}.${sections[1]}`;
}

export function toWhichKeyConfig(o: unknown): WhichKeyConfig | undefined {
  if (typeof o !== "object" || o === null) {
    return undefined;
  }
  const obj = o as Record<string, unknown>;

  if (Array.isArray(obj.bindings) && isConfigSections(obj.bindings)) {
    obj.bindings = getFullSection(obj.bindings as ConfigSections);
  }
  if (Array.isArray(obj.overrides) && isConfigSections(obj.overrides)) {
    obj.overrides = getFullSection(obj.overrides as ConfigSections);
  }
  if (isWhichKeyConfig(obj)) {
    return obj;
  }
  return undefined;
}

export const defaultWhichKeyConfig: WhichKeyConfig = {
  bindings: Configs.Bindings,
  overrides: Configs.Overrides,
};
