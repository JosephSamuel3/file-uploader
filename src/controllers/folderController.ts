import fs from "fs/promises";
import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import { prisma } from "../lib/prisma.js";
import { getDescendantFilePaths } from "../utils/folderTree.js";
import { setFlash } from "../utils/flash.js";

function backToFolder(res: Response, folderId: number | null) {
  res.redirect(folderId ? `/dashboard/${folderId}` : "/dashboard");
}

async function postCreateFolder(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  const parentId = req.body.parentId ? Number(req.body.parentId) : null;

  if (!errors.isEmpty()) {
    setFlash(req, {
      formId: "create-folder",
      errors: errors.array(),
      data: { name: req.body.name },
    });
    return backToFolder(res, parentId);
  }

  try {
    const userId = req.user!.id;
    const { name } = matchedData(req);

    if (parentId) {
      const parent = await prisma.folder.findFirst({ where: { id: parentId, userId } });
      if (!parent) {
        return res.status(404).render("errors/error", {
          title: "Not Found",
          message: "Parent folder not found.",
        });
      }
    }

    await prisma.folder.create({ data: { name, userId, parentId } });

    backToFolder(res, parentId);
  } catch (error) {
    next(error);
  }
}

async function postRenameFolder(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  try {
    const userId = req.user!.id;
    const folderId = Number(req.params.id);

    const folder = await prisma.folder.findFirst({ where: { id: folderId, userId } });
    if (!folder) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "Folder not found.",
      });
    }

    if (!errors.isEmpty()) {
      setFlash(req, {
        formId: `rename-folder-${folderId}`,
        errors: errors.array(),
        data: { name: req.body.name },
      });
      return backToFolder(res, folder.parentId);
    }

    const { name } = matchedData(req);
    await prisma.folder.update({ where: { id: folderId }, data: { name } });

    backToFolder(res, folder.parentId);
  } catch (error) {
    next(error);
  }
}

async function postDeleteFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const folderId = Number(req.params.id);

    const folder = await prisma.folder.findFirst({ where: { id: folderId, userId } });
    if (!folder) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "Folder not found.",
      });
    }

    const filePaths = await getDescendantFilePaths(folderId, userId);

    await prisma.folder.delete({ where: { id: folderId } });

    await Promise.all(filePaths.map((filePath) => fs.unlink(filePath).catch(() => {})));

    backToFolder(res, folder.parentId);
  } catch (error) {
    next(error);
  }
}

export { postCreateFolder, postRenameFolder, postDeleteFolder };
