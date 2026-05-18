"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { useDebounce } from "@/hooks/useDebounce";
import api from "@/libs/axios";
import { ErrorCard } from "@/components/atoms/ErrorCard";
import SectionHeading from "../../SectionHeading";
import SearchField from "@/components/molecules/forms/SearchField";
import Pagination from "@/components/atoms/Pagination";
import EmptyState from "@/components/atoms/EmptyState";

type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  inquiry?: string | null;
  created_at?: string;
};

function MessageTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-6 gap-4 border-b border-gray-100 bg-gray-50 px-5 py-4">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="h-3 rounded-full bg-gray-200 animate-pulse" />
        ))}
      </div>
      {Array(8).fill(0).map((_, row) => (
        <div key={row} className="grid grid-cols-6 gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0">
          {Array(6).fill(0).map((_, col) => (
            <div key={col} className="h-3 rounded-full bg-gray-100 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ContactGrid() {
  const t = useTranslations("dashboard.admin.contactUs");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { debouncedValue, setDebouncedValue } = useDebounce({
    value: search,
    delay: 350,
    onDebounce: () => setPage(1),
  });

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState({ limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (page: number, search: string) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);
        setError(null);
        const res = await api.get(
          `/contact-us?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );
        const { records, pagination: sp } = res.data;
        setMessages(records);
        setPagination((p) => ({ ...p, total: sp.total, totalPages: sp.totalPages }));
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "CanceledError") return;

        const message =
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof err.response === "object" &&
          err.response !== null &&
          "data" in err.response &&
          typeof err.response.data === "object" &&
          err.response.data !== null &&
          "message" in err.response.data &&
          typeof err.response.data.message === "string"
            ? err.response.data.message
            : "Failed to load messages";

        setError(message);
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchData(page, debouncedValue.trim());
  }, [page, debouncedValue, fetchData]);

  if (!loading && error) {
    return <ErrorCard message={error} onAction={() => fetchData(1, debouncedValue)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeading title={t("title")} />
        <SearchField
          value={search}
          onChange={setSearch}
          searchPlaceholder={t("searchPlaceholder")}
          variant="minimal"
          className="sm:!max-w-[360px] h-[44px]"
        />
      </div>

      {loading ? (
        <MessageTableSkeleton />
      ) : messages.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-start">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <TableHeader>{t("columns.name")}</TableHeader>
                  <TableHeader>{t("columns.phone")}</TableHeader>
                  <TableHeader>{t("columns.email")}</TableHeader>
                  <TableHeader>{t("columns.source")}</TableHeader>
                  <TableHeader>{t("columns.inquiry")}</TableHeader>
                  <TableHeader>{t("columns.createdAt")}</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages.map((msg) => (
                  <tr key={msg.id} className="transition-colors hover:bg-primary/5">
                    <TableCell>
                      <span className="font-semibold text-primary">{msg.name}</span>
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${msg.phone}`} className="inline-flex items-center gap-2 text-primary hover:text-secondary">
                        <FaPhone size={12} aria-hidden="true" />
                        <span dir="ltr">{msg.phone}</span>
                      </a>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${msg.email}`} className="inline-flex items-center gap-2 text-primary hover:text-secondary">
                        <FaEnvelope size={12} aria-hidden="true" />
                        <span>{msg.email}</span>
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                        {msg.message || t("notAvailable")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[320px] whitespace-pre-wrap text-sm md: leading-6 text-gray-700">
                        {msg.inquiry || t("notAvailable")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {msg.created_at ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(msg.created_at)) : t("notAvailable")}
                      </span>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={t("emptyTitle")}
          message={t("emptyMessage")}
          actionLabel={t("resetFilters")}
          onAction={() => {
            setSearch("");
            setDebouncedValue("");
            setPage(1);
          }}
        />
      )}

      <Pagination
        page={page}
        total={pagination.total}
        setPage={setPage}
        loading={loading}
        totalPages={pagination.totalPages}
        limit={pagination.limit}
      />
    </div>
  );
}

function TableHeader({ children }: { children: ReactNode }) {
  return (
    <th scope="col" className="px-5 py-4 text-start text-[11px] font-bold uppercase tracking-wider text-gray-500">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-5 py-4 align-top text-sm text-gray-700">{children}</td>;
}
