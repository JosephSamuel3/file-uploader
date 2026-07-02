import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import { prisma } from "../lib/prisma.js";
import { formatFileSize, formatDate } from "../utils/fileFormat.js";
import { setFlash } from "../utils/flash.js";
import { uploadFile, deleteFile, getSignedUrl } from "../utils/storage.js";

function backToFolder(res: Response, folderId: number | null) {
  res.redirect(folderId ? `/dashboard/${folderId}` : "/dashboard");
}

async function postUploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const folderId = req.body.folderId ? Number(req.body.folderId) : null;

    if (!req.file) {
      return res.status(400).render("errors/error", {
        title: "Bad Request",
        message: "No file was uploaded.",
      });
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({ where: { id: folderId, userId } });
      if (!folder) {
        return res.status(404).render("errors/error", {
          title: "Not Found",
          message: "Folder not found.",
        });
      }
    }

    const storagePath = await uploadFile(userId, req.file);

    await prisma.file.create({
      data: {
        name: req.file.originalname,
        path: storagePath,
        size: req.file.size,
        mimeType: req.file.mimetype,
        userId,
        folderId,
      },
    });

    backToFolder(res, folderId);
  } catch (error) {
    next(error);
  }
}

async function getFileDetail(req: Request, res: Response, next: NextFunction) {
  try{
    const userId = req.user!.id;
    const fileId = Number(req.params.id);

    const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
    if (!file) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "File not found.",
      });
    }

    res.render("file-detail", {
      title: "File detail",
      user: req.user,
      file,
      formatFileSize,
      formatDate,
      errors: [],
    })

  }catch(error){
    next(error);
  }
}

async function getDownloadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const fileId = Number(req.params.id);

    const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
    if (!file) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "File not found.",
      });
    }

    const signedUrl = await getSignedUrl(file.path, 60, file.name);
    res.redirect(signedUrl);
  } catch (error) {
    next(error);
  }
}

async function postRenameFile(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  try {
    const userId = req.user!.id;
    const fileId = Number(req.params.id);

    const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
    if (!file) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "File not found.",
      });
    }

    if (!errors.isEmpty()) {
      if (req.body.redirectTarget === "detail") {
        return res.status(400).render("file-detail", {
          title: "File detail",
          user: req.user,
          file,
          formValue: req.body.name,
          formatFileSize,
          formatDate,
          errors: errors.array(),
        });
      }

      setFlash(req, {
        formId: `rename-file-${fileId}`,
        errors: errors.array(),
        data: { name: req.body.name },
      });
      return backToFolder(res, file.folderId);
    }

    const { name } = matchedData(req);
    await prisma.file.update({ where: { id: fileId }, data: { name } });

    backToFolder(res, file.folderId);
  } catch (error) {
    next(error);
  }
}

async function postDeleteFile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const fileId = Number(req.params.id);

    const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
    if (!file) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "File not found.",
      });
    }

    await prisma.file.delete({ where: { id: fileId } });
    await deleteFile(file.path).catch(() => {});

    backToFolder(res, file.folderId);
  } catch (error) {
    next(error);
  }
}

export { postUploadFile, getDownloadFile, postRenameFile, postDeleteFile, getFileDetail };
