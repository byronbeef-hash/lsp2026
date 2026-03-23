"use client";

import { useState } from "react";
import { GlassCard, GlassBadge, GlassButton } from "@/components/glass";
import type { Notification } from "@/types";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  CheckCheck,
  Inbox,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useNotificationStore } from "@/stores/modules";

type FilterTab = "all" | "unread" | "alert" | "info";

const typeConfig: Record<
  Notification["type"],
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  alert: {
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
};

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const {
    notifications,
    markAsRead,
    markAllRead,
    deleteNotification,
    getUnreadCount,
  } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const unreadCount = getUnreadCount();

  const filtered = notifications.filter((n) => {
    switch (activeTab) {
      case "unread":
        return !n.read;
      case "alert":
        return n.type === "alert" || n.type === "warning";
      case "info":
        return n.type === "info" || n.type === "success";
      default:
        return true;
    }
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "alert", label: "Alerts" },
    { key: "info", label: "Info" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <GlassBadge variant="danger">{unreadCount} unread</GlassBadge>
              )}
            </div>
            <p className="text-white/50 mt-1">
              Stay updated on your herd activity
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <GlassButton
            variant="default"
            size="sm"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllRead}
          >
            Mark All Read
          </GlassButton>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-2 animate-fade-in-up"
        style={{ animationDelay: "50ms" } as React.CSSProperties}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-white/20 text-white border border-white/20"
                : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div
        className="space-y-3 animate-fade-in-up"
        style={{ animationDelay: "100ms" } as React.CSSProperties}
      >
        {filtered.length === 0 ? (
          /* Empty State */
          <GlassCard className="flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-white/40" />
            </div>
            <p className="text-white/60 font-medium">No notifications</p>
            <p className="text-sm text-white/40 mt-1">
              {activeTab === "unread"
                ? "You're all caught up!"
                : `No ${activeTab === "alert" ? "alerts" : activeTab === "info" ? "info notifications" : "notifications"} to show.`}
            </p>
          </GlassCard>
        ) : (
          filtered.map((notification) => {
            const config = typeConfig[notification.type];
            const Icon = config.icon;

            const cardContent = (
              <GlassCard
                hover={!!notification.action_url}
                onClick={
                  notification.action_url
                    ? () => markAsRead(notification.id)
                    : undefined
                }
                className={`flex items-start gap-4 ${
                  !notification.read ? "border-l-2 border-l-blue-400/60" : ""
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm ${
                          !notification.read
                            ? "font-bold text-white"
                            : "font-medium text-white/80"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-white/40 flex-shrink-0 mt-0.5">
                      {formatTimestamp(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-white/50 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassCard>
            );

            if (notification.action_url) {
              return (
                <Link
                  href={notification.action_url}
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                >
                  {cardContent}
                </Link>
              );
            }

            return <div key={notification.id}>{cardContent}</div>;
          })
        )}
      </div>
    </div>
  );
}
