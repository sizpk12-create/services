/**
 * You Want Services - In-App Notification Service
 * Phase 6 Architecture
 *
 * Provides real-time notifications for:
 * - Application submissions
 * - Correction requests
 * - Approvals, rejections & suspensions
 * - Document audit results
 */

import { Notification } from '../types/database';

const STORAGE_NOTIFICATIONS_KEY = 'yws_notifications_v6';

class NotificationService {
  private notifications: Notification[] = [];

  constructor() {
    this.initStore();
  }

  private initStore() {
    try {
      const saved = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (saved) {
        this.notifications = JSON.parse(saved);
      } else {
        // Initial sample notification for demo contractor
        this.notifications = [
          {
            id: 'notif-demo-init-1',
            userId: 'demo-usr-contractor-1',
            title: 'Registration Submitted for Review',
            message: 'Your contractor application has been submitted for review. An authorized administrator is auditing your trade credentials.',
            type: 'INFO',
            read: false,
            link: '/contractor/dashboard',
            isDemo: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ];
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Failed to load notifications from localStorage', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage', e);
    }
  }

  public notifyUser(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
    link?: string;
  }): Notification {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'INFO',
      read: false,
      link: params.link,
      isDemo: true,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(notif);
    this.saveToStorage();
    return notif;
  }

  public getNotificationsForUser(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  public getUnreadCount(userId: string): number {
    return this.notifications.filter((n) => n.userId === userId && !n.read).length;
  }

  public markAsRead(notificationId: string): void {
    const item = this.notifications.find((n) => n.id === notificationId);
    if (item) {
      item.read = true;
      this.saveToStorage();
    }
  }

  public markAllAsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    this.saveToStorage();
  }

  public getAllNotifications(): Notification[] {
    return [...this.notifications];
  }

  public broadcastNotification(params: {
    targetRole?: 'ALL' | 'CONTRACTOR' | 'CUSTOMER';
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
    link?: string;
  }): { count: number } {
    // Get targeted users
    let userIds: string[] = [];
    try {
      const usersStr = localStorage.getItem('yws_users_v1');
      if (usersStr) {
        const users: Array<{ id: string; role: string }> = JSON.parse(usersStr);
        if (!params.targetRole || params.targetRole === 'ALL') {
          userIds = users.map((u) => u.id);
        } else {
          userIds = users.filter((u) => u.role === params.targetRole).map((u) => u.id);
        }
      }
    } catch (e) {
      console.warn('Could not read users for broadcast', e);
    }

    if (userIds.length === 0) {
      // Default to demo users if none found
      userIds = ['demo-usr-contractor-1', 'demo-usr-customer-1'];
    }

    userIds.forEach((uid) => {
      this.notifyUser({
        userId: uid,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        link: params.link,
      });
    });

    return { count: userIds.length };
  }
}

export const notificationService = new NotificationService();
