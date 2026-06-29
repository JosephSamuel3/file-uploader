import "express-session";
import type { FlashData } from "../utils/flash";

declare module "express-session" {
  interface SessionData {
    flash?: FlashData;
  }
}
