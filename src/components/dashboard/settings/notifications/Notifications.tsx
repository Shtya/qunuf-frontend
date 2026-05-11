'use client'

import BreadcrumbsHeader from "@/components/atoms/BreadcrumbsHeader";
import { useDashboardHref } from "@/hooks/dashboard/useDashboardHref";
import DashboardCard from "../../DashboardCard";
import { useTranslations, useLocale } from "next-intl";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "@/libs/axios";
import { Notification } from "@/types/dashboard/notifications";
import SelectInput, { Option } from "@/components/molecules/forms/SelectInput";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function NotificationSkeleton() {
  return (
    <div className="divide-y divide-gray-100/80" role="status" aria-label="Loading notifications">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {/* unread dot */}
          <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
          {/* icon box */}
          <div className="w-11 h-11 bg-gray-100 rounded-xl shrink-0" />
          {/* text */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 bg-gray-200 rounded-full w-2/5" />
            <div className="h-2.5 bg-gray-100 rounded-full w-3/5" />
          </div>
          {/* badge placeholder */}
          <div className="h-5 w-14 bg-gray-100 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyNotifications({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
      {/* Bell illustration */}
      <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-primary/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-400 font-medium max-w-[200px] leading-relaxed">{label}</p>
    </div>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────
interface NotificationRowProps {
  notif: Notification;
  onMarkRead: (e: React.MouseEvent, notif: Notification) => void;
  onRowClick: (notif: Notification) => void;
  getIcon: (type: string) => React.ReactNode;
  markReadLabel: string;
  isRTL: boolean;
}

function NotificationRow({
  notif,
  onMarkRead,
  onRowClick,
  getIcon,
  markReadLabel,
  isRTL,
}: NotificationRowProps) {
  return (
    <div
      data-notification-id={notif.id}
      role="button"
      tabIndex={0}
      onClick={() => onRowClick(notif)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onRowClick(notif);
        }
      }}
      className={[
        "relative flex items-center gap-4 px-5 py-4 cursor-pointer group",
        "transition-all duration-200 outline-none",
        "hover:bg-gray-50/80 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset",
        !notif.isRead
          ? isRTL
            ? "bg-primary/[0.03] !border-b-transparent border-r-[3px] border-primary/30"
            : "bg-primary/[0.03] !border-b-transparent border-l-[3px] border-primary/30"
          : isRTL
          ? "border-r-[3px] border-transparent"
          : "border-l-[3px] border-transparent",
      ].join(" ")}
    >
      {/* Unread dot */}
      <div
        className={[
          "w-2 h-2 rounded-full shrink-0 transition-all",
          !notif.isRead ? "bg-primary scale-100" : "bg-transparent scale-0",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className={[
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
          !notif.isRead ? "bg-primary/10" : "bg-gray-100",
        ].join(" ")}
        aria-hidden="true"
      >
        <span className={!notif.isRead ? "text-primary" : "text-gray-400"}>
          {getIcon(notif.relatedEntityType || "")}
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4
          className={[
            "text-sm truncate leading-snug",
            !notif.isRead
              ? "font-semibold text-gray-900"
              : "font-medium text-gray-500",
          ].join(" ")}
        >
          {notif.title}
        </h4>
        <p className="mt-0.5 text-xs text-gray-400 truncate leading-relaxed">
          {notif.message}
        </p>
      </div>

      {/* Mark-read button (unread only) */}
      {!notif.isRead && (
        <button
          onClick={(e) => onMarkRead(e, notif)}
          aria-label={markReadLabel}
          className={[
            "shrink-0 text-[11px] font-medium text-primary",
            "px-3 py-1.5 rounded-lg border border-primary/20",
            "bg-primary/5 hover:bg-primary/10",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          ].join(" ")}
        >
          {markReadLabel}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Notifications() {
  const { getHref } = useDashboardHref();
  const t = useTranslations("dashboard.notification");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [pageNotifications, setPageNotifications] = useState<Notification[]>([]);

  const { unreadNotificationCount, subscribe, markOneAsRead, markAllAsRead, getNotificationIcon } =
    useNotifications();

  const notificationsApiRef = useRef<AbortController | null>(null);

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadNotifications = useCallback(
    async (targetPage: number, targetLimit: number) => {
      if (notificationsApiRef.current) notificationsApiRef.current.abort();
      const controller = new AbortController();
      notificationsApiRef.current = controller;

      try {
        setLoading(true);
        const res = await api.get(
          `/notifications?limit=${targetLimit}&page=${targetPage}`,
          { signal: controller.signal }
        );
        const {
          records = [],
          pagination: { total, totalPages },
        } = res.data || {};
        setPageNotifications(records);
        setPagination((prev) => ({ ...prev, total, totalPages }));
      } catch (error: any) {
        if (error?.name !== "CanceledError") toast.error(t("failedToLoad"));
      } finally {
        if (notificationsApiRef.current === controller) setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    loadNotifications(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  // ── Subscription ────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = subscribe((action) => {
      switch (action.type) {
        case "MARK_ONE_AS_READ":
          setPageNotifications((prev) =>
            prev.map((n) => (n.id === action.payload.id ? { ...n, isRead: true } : n))
          );
          break;
        case "MARK_ALL_AS_READ":
          setPageNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          break;
        case "NEW_NOTIFICATION":
          setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
          setPageNotifications((prev) => {
            const exists = prev.some((n) => n.id === action.payload.id);
            if (exists) return prev;
            const newList = [action.payload, ...prev];
            return newList.length > pagination.limit
              ? newList.slice(0, pagination.limit)
              : newList;
          });
          break;
      }
    });
    return () => unsubscribe();
  }, [subscribe, pagination.page, loadNotifications]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleMarkRead = async (e: React.MouseEvent, notification: Notification) => {
    e.preventDefault();
    e.stopPropagation();
    await markOneAsRead(notification);
  };

  const handleRowClick = (notif: Notification) => {
    markOneAsRead(notif);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const options: Option[] = useMemo(
    () => [
      { value: 5, label: "5" },
      { value: 10, label: "10" },
      { value: 20, label: "20" },
      { value: 50, label: "50" },
    ],
    []
  );

  const selectedLimit = useMemo(
    () => options.find((o) => o.value === pagination.limit),
    [pagination.limit, options]
  );

  const pagesCount = Math.ceil(pagination.total / pagination.limit);
  const hasPrev = pagination.page > 1;
  const hasNext = pagination.page < pagesCount;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <BreadcrumbsHeader
        title={t("title")}
        breadcrumbs={[
          { label: t("accountSettings"), href: getHref("settings") },
          { label: t("notifications") },
        ]}
      >
        <button
          onClick={() => markAllAsRead()}
          disabled={unreadNotificationCount === 0}
          aria-label={t("markAllAsReadAria", { count: unreadNotificationCount })}
          className={[
            "inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold",
            "bg-primary text-white shadow-sm shadow-primary/25",
            "hover:bg-primary/90 active:scale-[0.98]",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
            "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
            isRTL ? "flex-row-reverse" : "",
          ].join(" ")}
        >
          {t("markAllAsRead")}
          {unreadNotificationCount > 0 && (
            <span
              className={[
                "inline-flex items-center justify-center",
                "min-w-[20px] h-5 px-1.5 rounded-full",
                "bg-white/25 text-white text-[11px] font-bold tabular-nums",
              ].join(" ")}
              aria-hidden="true"
            >
              {unreadNotificationCount}
            </span>
          )}
        </button>
      </BreadcrumbsHeader>

      {/* ── Stats strip ── */}
      <div
        className={[
          "flex gap-4 flex-wrap",
          isRTL ? "flex-row-reverse" : "",
        ].join(" ")}
      >
        {[
          {
            label: t("statTotal"),
            value: pagination.total,
            highlight: false,
          },
          {
            label: t("statUnread"),
            value: unreadNotificationCount,
            highlight: true,
          },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className={[
              "flex-1 min-w-[130px] rounded-2xl px-5 py-4 border",
              highlight
                ? "bg-primary/5 border-primary/15"
                : "bg-white border-gray-100 shadow-sm",
            ].join(" ")}
          >
            <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
            <p
              className={[
                "text-2xl font-bold tabular-nums",
                highlight ? "text-primary" : "text-gray-800",
              ].join(" ")}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── List card ── */}
      <DashboardCard className="!p-0 overflow-hidden">
        {/* Card header */}
        <div
          className={[
            "flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-100",
            isRTL ? "flex-row-reverse" : "",
          ].join(" ")}
        >
          <div className={["flex items-center gap-3", isRTL ? "flex-row-reverse" : ""].join(" ")}>
            <h2 className="text-base font-semibold text-gray-900">{t("overview")}</h2>
            {pagesCount > 0 && (
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full tabular-nums">
                {t("pageInfo", { current: pagination.page, total: pagesCount })}
              </span>
            )}
          </div>

          {/* Items-per-page (top, compact) */}
          <SelectInput
            options={options}
            value={selectedLimit}
            onChange={(selectedOption) =>
              handleItemsPerPageChange(Number(selectedOption.value))
            }
            placeholder={t("selectItemsPerPage")}
            openDirection="bottom"
            className="!w-[90px]"
          />
        </div>

        {/* Notification list */}
        <div className="divide-y divide-gray-100/80" role="list" aria-label={t("title")}>
          {loading ? (
            <NotificationSkeleton />
          ) : pageNotifications.length > 0 ? (
            pageNotifications.map((notif) => (
              <NotificationRow
                key={notif.id}
                notif={notif}
                onMarkRead={handleMarkRead}
                onRowClick={handleRowClick}
                getIcon={getNotificationIcon}
                markReadLabel={t("markRead")}
                isRTL={isRTL}
              />
            ))
          ) : (
            <EmptyNotifications label={t("noNotifications")} />
          )}
        </div>

        {/* ── Pagination footer ── */}
        {pagesCount > 1 && (
          <div
            className={[
              "flex items-center justify-center gap-1 px-6 py-4 border-t border-gray-100 bg-gray-50/50",
              isRTL ? "flex-row-reverse" : "",
            ].join(" ")}
          >
            {/* Prev */}
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={!hasPrev}
              aria-label={t("prev")}
              className={[
                "rtl:scale-x-[-1] w-9 h-9 flex items-center justify-center rounded-lg",
                "text-sm font-medium border transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                hasPrev
                  ? "text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  : "text-gray-300 border-gray-100 cursor-not-allowed",
              ].join(" ")}
            >
              {/* Chevron flips on RTL */}
              <svg
                className={["w-4 h-4", isRTL ? "rotate-180" : ""].join(" ")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page pills */}
            {Array.from({ length: pagesCount }, (_, i) => i + 1)
              .filter((p) => {
                // show first, last, current ±1
                return (
                  p === 1 ||
                  p === pagesCount ||
                  Math.abs(p - pagination.page) <= 1
                );
              })
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-9 h-9 flex items-center justify-center text-sm text-gray-400"
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPagination((prev) => ({ ...prev, page: p as number }))}
                    aria-label={t("goToPage", { page: p })}
                    aria-current={pagination.page === p ? "page" : undefined}
                    className={[
                      "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                      pagination.page === p
                        ? "bg-primary text-white shadow-sm shadow-primary/25"
                        : "text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                )
              )}

            {/* Next */}
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={!hasNext}
              aria-label={t("next")}
              className={[
                "w-9 rtl:scale-x-[-1] h-9 flex items-center justify-center rounded-lg",
                "text-sm font-medium border transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                hasNext
                  ? "text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  : "text-gray-300 border-gray-100 cursor-not-allowed",
              ].join(" ")}
            >
              <svg
                className={["w-4 h-4", isRTL ? "rotate-180" : ""].join(" ")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}