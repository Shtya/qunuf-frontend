"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const t: Record<string, string> = {
  "partners.section_label": "Payment and partner logos",
  "partners.paypal": "PayPal",
  "partners.greenhouse": "GreenHouse",
  "partners.household": "HouseHold",
  "partners.century": "Century",
};

const PARTNERS = [
  { src: "/payments/paypal.svg", altKey: "partners.paypal" },
  { src: "/payments/GreenHouse.svg", altKey: "partners.greenhouse" },
  { src: "/payments/houseHold.svg", altKey: "partners.household" },
  { src: "/payments/Century.svg", altKey: "partners.century" },
];

type PaymentsCompanyRowProps = {
  dir?: "rtl" | "ltr";
};

export default function PaymentsCompanyRow({
  dir = "ltr",
}: PaymentsCompanyRowProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ul = listRef.current;
    if (!ul || !ul.parentElement) return;

    const clone = ul.cloneNode(true) as HTMLUListElement;
    clone.setAttribute("aria-hidden", "true");
    ul.parentElement.appendChild(clone);

    return () => {
      clone.remove();
    };
  }, []);

  return (
    <section
      dir={dir}
      className="w-full bg-secondary"
      aria-label={t["partners.section_label"]}
    >
      <div
        className="
          w-full overflow-hidden py-6 sm:py-8 lg:py-10
          [mask-image:linear-gradient(to_right,transparent_0,black_100px,black_calc(100%-100px),transparent_100%)]
          [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_100px,black_calc(100%-100px),transparent_100%)]
        "
      >
        <div className="inline-flex w-full flex-nowrap">
          <ul
            ref={listRef}
            className="
              flex min-w-max shrink-0 items-center
              [&_li]:mx-6 sm:[&_li]:mx-10 md:[&_li]:mx-14
              animate-infinite-scroll
            "
          >
            {PARTNERS.map((partner, idx) => (
              <li
                key={`${partner.src}-${idx}`}
                className="flex shrink-0 items-center"
              >
                <LogoItem src={partner.src} alt={t[partner.altKey]} />
                <ConnectorBalls />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LogoItem({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="h-auto w-[110px] shrink-0 sm:w-[150px] xl:w-[190px]">
      <Image
        src={src}
        alt={alt}
        width={190}
        height={80}
        className="h-auto w-full object-contain"
        sizes="(max-width: 640px) 110px, (max-width: 1280px) 150px, 190px"
      />
    </div>
  );
}

function ConnectorBalls() {
  return (
    <div className="ms-6 flex shrink-0 items-center justify-center sm:ms-10 md:ms-14">
      <div
        className="
          -me-[20px] z-[2]
          h-[40px] w-[40px]
          rounded-full bg-[#E1E1E1]
          sm:-me-[28px] sm:h-[55px] sm:w-[55px]
          md:-me-[34px] md:h-[67px] md:w-[67px]
        "
      />
      <div
        className="
          z-[3]
          h-[40px] w-[40px]
          rounded-full bg-white
          sm:h-[55px] sm:w-[55px]
          md:h-[67px] md:w-[67px]
        "
      />
    </div>
  );
}