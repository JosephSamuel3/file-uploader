import "express-session";
import type { FlashData } from "../utils/flash.js";

declare module "express-session" {
  interface SessionData {
    flash?: FlashData;
  }
}
