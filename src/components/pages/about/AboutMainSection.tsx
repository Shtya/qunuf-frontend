'use client'

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface AboutMainSectionProps {
  title: string;
  text: string;
  imageSrc: string;
  reverse?: boolean;
  [key: string]: unknown;
}

export default function AboutMainSection({
  title,
  text,
  imageSrc,
  reverse = false,
  ...props
}: AboutMainSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("about");

  const PREVIEW_LIMIT = 620;

  const { hasMore, firstPart, lastPart } = useMemo(() => {
    const hasMore = text.length > PREVIEW_LIMIT;
    const previewText = text.slice(0, PREVIEW_LIMIT);
    const lastNewlineIndex = previewText.lastIndexOf("\n");
    const firstPart =
      lastNewlineIndex !== -1
        ? previewText.substring(0, lastNewlineIndex)
        : previewText;
    const lastPart =
      lastNewlineIndex !== -1
        ? previewText.substring(lastNewlineIndex + 1)
        : "";
    return { hasMore, firstPart, lastPart };
  }, [text]);

  return (
    <article
      {...props}
      className={[
        "flex flex-col gap-8 items-start",
        reverse ? "lg:flex-row-reverse" : "lg:flex-row",
      ].join(" ")}
    >
      {/* ── Image Frame ─────────────────────────────── */}
      <div className="relative w-full lg:w-[46%] shrink-0">
        {/* Decorative dot cluster — flips with RTL automatically via start/end */}
        <div
          aria-hidden="true"
          className={[
            "absolute -bottom-4 z-0 w-20 h-20 opacity-25 pointer-events-none",
            reverse ? "start-0 -translate-x-2" : "end-0 translate-x-2",
          ].join(" ")}
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--secondary) 1.5px, transparent 1.5px)",
            backgroundSize: "9px 9px",
          }}
        />
        {/* Decorative dot cluster top opposite corner */}
        <div
          aria-hidden="true"
          className={[
            "absolute -top-4 z-0 w-16 h-16 opacity-20 pointer-events-none",
            reverse ? "end-0 translate-x-2" : "start-0 -translate-x-2",
          ].join(" ")}
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--light) 1.5px, transparent 1.5px)",
            backgroundSize: "9px 9px",
          }}
        />

        {/* Outer frame — parchment gradient border feel */}
        <div
          className="relative z-10 rounded-[28px] md:rounded-[36px] p-[5px]"
          style={{
            background:
              "linear-gradient(135deg, var(--light) 0%, var(--lighter) 50%, var(--secondary) 100%)",
            boxShadow:
              "0 12px 48px -8px rgba(75, 61, 37, 0.18), 0 2px 8px rgba(75, 61, 37, 0.08)",
          }}
        >
          {/* Inner image container */}
          <div
            className="relative w-full h-[240px] md:h-[320px] xl:h-[380px] rounded-[24px] md:rounded-[32px] overflow-hidden"
            style={{ background: "var(--lighter)" }}
          >
            <Image
              fill
              src={imageSrc}
              alt={title}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
            />
            {/* Warm inner vignette */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[24px] md:rounded-[32px]"
              style={{
                boxShadow: "inset 0 0 40px rgba(75, 61, 37, 0.12)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Text Section ─────────────────────────────── */}
      <div className="flex flex-col gap-5 flex-1 min-w-0">
        {/* Section label */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-block w-8 h-[3px] rounded-full"
            style={{ background: "var(--secondary)" }}
          />
          <span
            className="text-xs font-bold tracking-[0.18em] uppercase"
            style={{ color: "var(--secondary)" }}
          >
            {t("sectionLabel")}
          </span>
        </div>

        {/* Title */}
        <h2
          className="font-extrabold leading-[1.15] text-[28px] md:text-[36px] xl:text-[42px]"
          style={{ color: "var(--primary)" }}
        >
          {title}
        </h2>

        {/* Divider */}
        <div
          className="w-16 h-[2px] rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--light) 0%, var(--lighter) 100%)",
          }}
        />

        {/* Body text with gradient fade mask when collapsed */}
        <div className="relative">
          <div
            className={[
              "relative overflow-hidden transition-all duration-500 ease-in-out",
              !expanded && hasMore ? "max-h-[184px]" : "max-h-[9999px]",
            ].join(" ")}
          >
            <p
              className="font-medium leading-[1.85] whitespace-pre-line text-[15px] md:text-base"
              style={{ color: "var(--dark)" }}
            >
              {!hasMore || expanded ? (
                text
              ) : (
                <>
                  <span>{firstPart}</span>
                  {lastPart && "\n"}
                  <span style={{ color: "var(--placeholder)" }}>
                    {lastPart}
                    {hasMore && " …"}
                  </span>
                </>
              )}
            </p>

            {/* Fade mask — uses --lighter so it blends with page bg */}
            {!expanded && hasMore && (
              <div
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, var(--dashboard-bg, #fff) 0%, transparent 100%)",
                }}
              />
            )}
          </div>
        </div>

        {/* Expand / Collapse button */}
        {hasMore && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className={[
              "mt-1 self-start inline-flex items-center gap-2",
              "border-[1.5px] rounded-full px-5 py-2",
              "text-sm font-semibold",
              "transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "active:scale-[0.97]",
            ].join(" ")}
            style={
              {
                borderColor: "var(--secondary)",
                color: "var(--secondary)",
                "--tw-ring-color": "var(--secondary)",
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "var(--secondary)";
              el.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "transparent";
              el.style.color = "var(--secondary)";
            }}
          >
            <span>{expanded ? t("readLess") : t("readMore")}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className={[
                "w-4 h-4 transition-transform duration-300",
                expanded ? "rotate-180" : "rotate-0",
              ].join(" ")}
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}