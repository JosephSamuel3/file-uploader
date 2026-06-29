import { Request } from "express";

interface FlashError {
  msg: string;
}

interface FlashData {
  formId: string;
  errors: FlashError[];
  data?: Record<string, string>;
}

function setFlash(req: Request, flash: FlashData) {
  req.session.flash = flash;
}

function popFlash(req: Request): FlashData | null {
  const flash = req.session.flash ?? null;
  delete req.session.flash;
  return flash;
}

export { setFlash, popFlash };
export type { FlashData };
