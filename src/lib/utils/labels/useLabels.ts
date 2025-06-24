import { tables } from "./tables";

export function useLabels() {
  const l = (key: string, values: Record<string, string> = {}) => {
    let text = tables[key] || key;
    for (const [placeholder, value] of Object.entries(values)) {
      text = text.replace(`{{${placeholder}}}`, value);
    }
    return text;
  };

  return { l };
}
