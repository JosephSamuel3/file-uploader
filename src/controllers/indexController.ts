import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { getBreadcrumbs } from "../utils/breadcrumbs.js";
import { formatFileSize } from "../utils/fileFormat.js";
import { popFlash } from "../utils/flash.js";

//call to action page before user is loged in
const getIndex = (req: Request, res: Response) => {
  res.render("index", {
    title: "index",
    user: req.user || null,
  });
};

async function getDashBoard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const folderId = req.params.folderId ? Number(req.params.folderId) : null;

    if (req.params.folderId && Number.isNaN(folderId)) {
      return res.status(400).render("errors/error", {
        title: "Bad Request",
        message: "Invalid folder id.",
      });
    }

    const currentFolder = folderId
      ? await prisma.folder.findFirst({ where: { id: folderId, userId } })
      : null;

    if (folderId && !currentFolder) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "Folder not found.",
      });
    }

    const [folders, files, breadcrumbs] = await Promise.all([
      prisma.folder.findMany({
        where: { userId, parentId: folderId },
        orderBy: { name: "asc" },
      }),
      prisma.file.findMany({
        where: { userId, folderId },
        orderBy: { name: "asc" },
      }),
      getBreadcrumbs(currentFolder, userId),
    ]);

    res.render("dashboard", {
      title: "Dashboard",
      user: req.user,
      currentFolder,
      breadcrumbs,
      folders,
      files,
      formatFileSize,
      flash: popFlash(req),
      shareUrl: req.query.shareUrl ? String(req.query.shareUrl) : null,
    });
  } catch (error) {
    next(error);
  }
}

export { getIndex, getDashBoard };