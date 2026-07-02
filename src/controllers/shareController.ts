import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { getSignedUrl } from "../utils/storage.js";

async function postCreateShare(req: Request, res: Response, next: NextFunction) {
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

    const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;

    const share = await prisma.share.create({
      data: { folderId, expiresAt },
    });

    const shareUrl = `${req.protocol}://${req.get("host")}/share/${share.token}`;
    res.redirect(`/dashboard/${folderId}?shareUrl=${encodeURIComponent(shareUrl)}`);
  } catch (error) {
    next(error);
  }
}

async function getSharedFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;

    const share = await prisma.share.findUnique({
      where: { token },
      include: {
        folder: {
          include: { files: true, children: true },
        },
      },
    });

    if (!share) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "Share link not found.",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(410).render("errors/error", {
        title: "Link Expired",
        message: "This share link has expired.",
      });
    }

    res.render("shared-folder", {
      title: `Shared: ${share.folder.name}`,
      folder: share.folder,
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function getSharedFileDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, fileId } = req.params;

    const share = await prisma.share.findUnique({ where: { token } });
    if (!share) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "Share link not found.",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(410).render("errors/error", {
        title: "Link Expired",
        message: "This share link has expired.",
      });
    }

    const file = await prisma.file.findFirst({
      where: { id: Number(fileId), folderId: share.folderId },
    });

    if (!file) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "File not found in this shared folder.",
      });
    }

    const signedUrl = await getSignedUrl(file.path, 60, file.name);
    res.redirect(signedUrl);
  } catch (error) {
    next(error);
  }
}

export { postCreateShare, getSharedFolder, getSharedFileDownload };
