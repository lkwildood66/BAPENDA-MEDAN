import prisma from "@/lib/prisma";
import { createSlug } from "@/lib/utils";
import { AuditService } from "./audit";
import { NotificationService } from "./notification";

export class CMSService {
  /**
   * Get all news, supports pagination and active status filtering.
   */
  static async getNews(activeOnly = true) {
    return prisma.news.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
  }

  /**
   * Create new news entry with automatic slug generation.
   */
  static async createNews(data: { title: string; summary: string; content: string; category?: string; authorId: string }) {
    const slug = `${createSlug(data.title)}-${Date.now()}`;
    const news = await prisma.news.create({
      data: {
        ...data,
        category: data.category || "Umum",
        slug,
        isActive: true,
      },
    });

    await AuditService.log({
      userId: data.authorId,
      action: "CREATE_NEWS",
      table: "News",
      recordId: news.id,
      newValue: news,
    });

    const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
    for (const u of users) {
      await NotificationService.notify({
        userId: u.id,
        title: `Berita Baru: ${news.title}`,
        message: news.summary || news.content.substring(0, 120) + "...",
        type: "INFO",
        category: "DASHBOARD",
      });
    }

    return news;
  }

  static async updateNews(id: string, userId: string, data: Partial<{ title: string; summary: string; content: string; category: string; isActive: boolean }>) {
    const oldVal = await prisma.news.findUnique({ where: { id } });
    const news = await prisma.news.update({
      where: { id },
      data,
    });

    await AuditService.log({
      userId,
      action: "UPDATE_NEWS",
      table: "News",
      recordId: news.id,
      oldValue: oldVal || undefined,
      newValue: news,
    });

    return news;
  }

  static async deleteNews(id: string, userId: string) {
    const deleted = await prisma.news.delete({ where: { id } });
    await AuditService.log({
      userId,
      action: "DELETE_NEWS",
      table: "News",
      recordId: id,
      oldValue: deleted,
    });
    return deleted;
  }



  /**
   * Get all announcements.
   */
  static async getAnnouncements(activeOnly = true) {
    return prisma.announcement.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
  }

  /**
   * Create new announcement.
   */
  static async createAnnouncement(data: { title: string; content: string; category?: string; authorId: string }) {
    const slug = `${createSlug(data.title)}-${Date.now()}`;
    const announcement = await prisma.announcement.create({
      data: {
        ...data,
        category: data.category || "Umum",
        slug,
        isActive: true,
      },
    });

    await AuditService.log({
      userId: data.authorId,
      action: "CREATE_ANNOUNCEMENT",
      table: "Announcement",
      recordId: announcement.id,
      newValue: announcement,
    });

    const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
    for (const u of users) {
      await NotificationService.notify({
        userId: u.id,
        title: `Pengumuman: ${announcement.title}`,
        message: announcement.content.substring(0, 120) + "...",
        type: "INFO",
        category: "DASHBOARD",
      });
    }

    return announcement;
  }

  static async updateAnnouncement(id: string, userId: string, data: Partial<{ title: string; content: string; category: string; isActive: boolean }>) {
    const oldVal = await prisma.announcement.findUnique({ where: { id } });
    const announcement = await prisma.announcement.update({
      where: { id },
      data,
    });

    await AuditService.log({
      userId,
      action: "UPDATE_ANNOUNCEMENT",
      table: "Announcement",
      recordId: announcement.id,
      oldValue: oldVal || undefined,
      newValue: announcement,
    });

    return announcement;
  }

  static async deleteAnnouncement(id: string, userId: string) {
    const deleted = await prisma.announcement.delete({ where: { id } });
    await AuditService.log({
      userId,
      action: "DELETE_ANNOUNCEMENT",
      table: "Announcement",
      recordId: id,
      oldValue: deleted,
    });
    return deleted;
  }
}
