import { prisma } from "../lib/prisma";

async function getDescendantFilePaths(folderId: number, userId: number): Promise<string[]> {
  const paths: string[] = [];
  let folderIds = [folderId];

  while (folderIds.length > 0) {
    const files = await prisma.file.findMany({
      where: { userId, folderId: { in: folderIds } },
      select: { path: true },
    });
    paths.push(...files.map((file) => file.path));

    const subfolders = await prisma.folder.findMany({
      where: { userId, parentId: { in: folderIds } },
      select: { id: true },
    });
    folderIds = subfolders.map((folder) => folder.id);
  }

  return paths;
}

export { getDescendantFilePaths };
