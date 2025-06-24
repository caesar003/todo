import * as fs from "fs";

import { StatusInterface } from "./types";
import { useLabels } from "./utils/labels/useLabels";

export class Status {
  private statuses: StatusInterface[];
  private l: (key: string, values?: Record<string, string>) => string;

  constructor(filePath = "/etc/todo/status.json") {
    this.l = useLabels().l;
    try {
      const statusTextData = fs.readFileSync(filePath, "utf-8");
      this.statuses = JSON.parse(statusTextData);
    } catch (error) {
      console.error(
        this.l("e.loadStatusFile", { path: filePath, message: error as string })
      );
      this.statuses = [];
    }
  }

  public getById(statusId: StatusInterface["id"]): StatusInterface | null {
    return this.statuses.find((status) => status.id === statusId) || null;
  }

  public getAll(): StatusInterface[] {
    return this.statuses;
  }
}
