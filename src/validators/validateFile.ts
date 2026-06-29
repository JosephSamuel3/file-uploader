import { Request, Response, NextFunction } from "express";

const MAX_SIZE = 10 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

function validateFile(req: Request, res: Response, next: NextFunction) {
  const file = req.file;

  if (!file) {
    return next();
  }

  if (file.size > MAX_SIZE) {
    return res.status(400).render("errors/error", {
      title: "Bad Request",
      message: "File exceeds 10 MB.",
    });
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).render("errors/error", {
      title: "Bad Request",
      message: "Unsupported file type.",
    });
  }

  next();
}

export { validateFile };
