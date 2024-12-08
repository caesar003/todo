import * as fs from "fs";

import { StatusInterface } from "./types";

export class Status {
  private statuses: StatusInterface[];

  constructor(filePath = "/etc/todo/status.json") {
    try {
      const statusTextData = fs.readFileSync(filePath, "utf-8");
      this.statuses = JSON.parse(statusTextData);
    } catch (error) {
      console.error(`Could not load statuses from ${filePath}:`, error);
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
