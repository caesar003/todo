import * as fs from "fs";
import { PriorityInterface } from "./types";
import { useLabels } from "./utils/labels/useLabels";

export class Priority {
  private priorities: PriorityInterface[];
  private l: (key: string, values?: Record<string, string>) => string;

  constructor(filePath = "/etc/todo/priority.json") {
    this.l = useLabels().l;
    try {
      const priorityTextData = fs.readFileSync(filePath, "utf-8");
      this.priorities = JSON.parse(priorityTextData);
    } catch (error) {
      console.error(
        this.l("e.loadPrioFile", { path: filePath, message: error as string })
      );
      this.priorities = [];
    }
  }

  public getById(
    priorityId: PriorityInterface["id"]
  ): PriorityInterface | null {
    return (
      this.priorities.find((priority) => priority.id === priorityId) || null
    );
  }

  public getAll(): PriorityInterface[] {
    return this.priorities;
  }
}
