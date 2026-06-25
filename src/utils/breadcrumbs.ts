import { prisma } from "../lib/prisma";
import type { Folder } from "../generated/prisma/client";

type Breadcrumb = { id: number; name: string };

async function getBreadcrumbs(folder: Folder | null, userId: number): Promise<Breadcrumb[]> {
  const breadcrumbs: Breadcrumb[] = [];

  let current = folder;
  while (current) {
    breadcrumbs.unshift({ id: current.id, name: current.name });
    current = current.parentId
      ? await prisma.folder.findFirst({ where: { id: current.parentId, userId } })
      : null;
  }

  return breadcrumbs;
}

export { getBreadcrumbs };
export type { Breadcrumb };
