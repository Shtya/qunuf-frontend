'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import RatingStars from '@/components/atoms/RatingStars';
import { useMemo, useState, useRef, useLayoutEffect, useEffect } from 'react';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { CiSearch } from 'react-icons/ci';
import { FiMapPin, FiHome, FiLayers } from 'react-icons/fi';
import SelectInput, { Option } from '@/components/molecules/forms/SelectInput';
import { Link, useRouter } from '@/i18n/navigation';
import { useValues } from '@/contexts/GlobalContext';
import { useLocalizedOptionsGroups } from '@/hooks/useLocalizedOptionsGroups';
import { furnishedValues, propertyTypeValues } from '@/constants/properties/constant';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const AVATAR_SRCS = [
  '/users/user-1.jpg',
  '/users/user-2.jpg',
  '/users/user-3.jpg',
  '/users/user-4.jpg',
] as const;

const RATING = 4.5;

/* ═══════════════════════════════════════════════════════════════════════════
   THREE.JS PARTICLE CANVAS
═══════════════════════════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef     = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.opacity = '0';

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 40;

    /* Particles */
    const count = 160;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 150;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xd4a843, size: 0.22, transparent: true, opacity: 0.45, sizeAttenuation: true });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* Wireframe shapes */
    type ShapeDef = { geo: THREE.BufferGeometry; p: [number, number, number]; s: number };
    const shapeDefs: ShapeDef[] = [
      { geo: new THREE.OctahedronGeometry(1),  p: [-30, 12, -20], s: 5.5 },
      { geo: new THREE.IcosahedronGeometry(1), p: [28, -14, -16], s: 4   },
      { geo: new THREE.TetrahedronGeometry(1), p: [8,  18,  -25], s: 7   },
    ];
    const meshes = shapeDefs.map(({ geo, p, s }) => {
      const mat  = new THREE.MeshBasicMaterial({ color: 0xd4a843, wireframe: true, transparent: true, opacity: 0.08 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...p);
      mesh.scale.setScalar(s);
      scene.add(mesh);
      return mesh;
    });

    let animId: number;
    let t = 0;
    const cam = { x: 0, y: 0 };

    const tick = () => {
      animId = requestAnimationFrame(tick);
      if (prefersReduced) { renderer.render(scene, camera); return; }
      t += 0.003;
      particles.rotation.y = t * 0.04;
      meshes.forEach((m, i) => {
        m.rotation.x = t * (0.12 + i * 0.06);
        m.rotation.y = t * (0.08 + i * 0.1);
      });
      cam.x += (mouseRef.current.x * 4 - cam.x) * 0.03;
      cam.y += (-mouseRef.current.y * 3 - cam.y) * 0.03;
      camera.position.x = cam.x;
      camera.position.y = cam.y;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };

    gsap.to(renderer.domElement, { opacity: 1, duration: 2, delay: 0.3, ease: 'power2.out' });
    tick();

    const onMM = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    };
    window.addEventListener('mousemove', onMM, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMM);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      pGeo.dispose(); pMat.dispose();
      meshes.forEach(m => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      shapeDefs.forEach(s => s.geo.dispose());
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT PILL
═══════════════════════════════════════════════════════════════════════════ */
interface StatPillProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
  className?: string;
  pulse?: boolean;
}

function StatPill({ icon, value, label, delay, className, pulse }: StatPillProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: -16, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, delay, duration: 0.65, ease: 'back.out(1.7)' },
      );
      if (!prefersReduced) {
        gsap.to(el, { y: -8, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: delay + 0.7 });
      }
    });
    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} style={{ opacity: 0 }}
      className={cn(
        'flex items-center gap-3',
        'bg-white/92 backdrop-blur-2xl',
        'border border-white/30',
        'shadow-[0_8px_32px_rgba(0,0,0,0.18)]',
        'rounded-2xl px-4 py-3',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[color:var(--secondary)]/10 flex items-center justify-center text-[color:var(--secondary)]">
        {icon}
      </div>
      <div>
        <div className="font-black text-[15px] text-[color:var(--secondary)] leading-tight flex items-center gap-1.5">
          {value}
          {pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>
        <div className="text-slate-500 text-[11px] font-medium leading-tight mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL INDICATOR
═══════════════════════════════════════════════════════════════════════════ */
function ScrollIndicator() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 10 }, {
        opacity: 1, y: 0, duration: 0.6, delay: 2.4, ease: 'power3.out',
        onComplete: () => {
          if (!prefersReduced) gsap.to(el, { y: 8, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} style={{ opacity: 0 }} aria-hidden="true"
      className="absolute bottom-[100px] sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10">
      <span className="text-white/40 text-[9px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
      <div className="w-[18px] h-8 rounded-full border-[1.5px] border-white/25 flex justify-center pt-1.5">
        <div className="w-[3px] h-[8px] rounded-full bg-[color:var(--secondary)] opacity-80" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SECTION  (main export)
═══════════════════════════════════════════════════════════════════════════ */
export default function HeroSection() {
  const t             = useTranslations('homePage.hero');
  const sectionRef    = useRef<HTMLElement>(null);
  const filterWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !filterWrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(filterWrapRef.current,
        { opacity: 0, y: 36, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, delay: 1.6, ease: 'expo.out' },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label={t('sectionLabel')}
      className="relative isolate overflow-hidden min-h-[100svh] flex flex-col"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none" aria-hidden="true">
        <Image src="/financial-center.png" alt="" fill priority sizes="100vw"
          className="object-cover object-center" />
        <ParticleCanvas />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_60%_40%,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-black/50 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[color:var(--secondary)]/12 to-transparent" />
      </div>

      {/* ── Floating stat pills ── */}
      <div className="!hidden absolute inset-0 pointer-events-none z-10" aria-hidden="true">
        <StatPill
          icon={<FiHome size={16} />}
          value="+50K"
          label={t('statClients') ?? 'Happy Clients'}
          delay={1.9}
          className="absolute top-[18%] ltr:left-8 rtl:right-8 hidden lg:flex"
        />
        <StatPill
          icon={<span className="text-base leading-none">🔔</span>}
          value={t('statBooking') ?? 'New Booking'}
          label={t('statBookingLabel') ?? 'Just now · Cairo'}
          delay={2.05}
          pulse
          className="absolute top-[28%] ltr:right-8 rtl:left-8 hidden xl:flex"
        />
      </div>

      {/* ── Content ── */}
      <div className="relative flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-14 pt-32 pb-48 sm:pb-52 lg:pb-40">
          <HeroCopy />
          <div ref={filterWrapRef} style={{ opacity: 0 }} className="mt-8 w-full">
            <HeroFilter />
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="absolute inset-x-0 bottom-0 flex justify-end pb-[env(safe-area-inset-bottom)]">
        <UsersCard />
      </div>

      <ScrollIndicator />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO COPY — word-level animation (preserves Arabic connected script)
═══════════════════════════════════════════════════════════════════════════ */
function HeroCopy() {
  const t           = useTranslations('homePage.hero');
  const badgeRef    = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subcopyRef  = useRef<HTMLParagraphElement>(null);

  const headingText = t('heading') as string;
  /* ⚠️  Split by WORDS, NOT characters — Arabic chars break when isolated in spans */
  const lines = headingText.split('\n');

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set([badgeRef.current, headlineRef.current, subcopyRef.current], { opacity: 1 });
        return;
      }

      const tl = gsap.timeline();

      tl.fromTo(badgeRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
        0,
      );

      /* Each .hw word-span slides up from within its overflow-hidden clip */
      const words = headlineRef.current?.querySelectorAll<HTMLSpanElement>('.hw');
      if (words && words.length > 0) {
        tl.fromTo(words,
          { opacity: 0, y: '110%' },
          { opacity: 1, y: '0%', duration: 0.65, stagger: 0.09, ease: 'power4.out' },
          0.45,
        );
      }

      tl.fromTo(subcopyRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        1.1,
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="ltr:text-left rtl:text-right">
      <span
        ref={badgeRef}
        style={{ opacity: 0 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-white/80 backdrop-blur-md mb-5"
      >
        <span className="block w-1.5 h-1.5 rounded-full bg-[color:var(--lightGold)] animate-pulse" aria-hidden="true" />
        {t('badge')}
      </span>

      <h1
        ref={headlineRef}
        className="font-black tracking-tight text-[clamp(2.6rem,6vw,5rem)] leading-[1.08] text-white max-w-[14ch]"
      >
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.split(' ').map((word, wi) => (
              /* Each word gets its own overflow-hidden container so it clips during slide-up */
              <span key={`${li}-${wi}`} className="inline-block overflow-hidden ltr:mr-[0.22em] rtl:ml-[0.22em] align-bottom leading-[1.18]">
                <span
                  className={cn(
                    'hw inline-block',
                    li === 0
                      ? 'bg-[linear-gradient(130deg,var(--secondary)_0%,var(--lightGold)_60%,#fff_100%)] bg-clip-text text-transparent'
                      : 'text-white',
                  )}
                  style={{ opacity: 0 }}
                  /* sr-only text handled by parent h1 inheriting */
                >
                  {word}
                </span>
              </span>
            ))}
          </span>
        ))}
      </h1>

      <p
        ref={subcopyRef}
        style={{ opacity: 0 }}
        className="mt-5 max-w-[54ch] text-sm sm:text-[15px] leading-[1.8] text-white/60 font-light"
      >
        {t('subcopy') as string}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO FILTER — premium labeled-column search card
═══════════════════════════════════════════════════════════════════════════ */
export function HeroFilter() {
  const tFilter = useTranslations('property.filter');
  const t       = useTranslations('homePage.filters');
  const router  = useRouter();
  const locale  = useLocale();
  const { states } = useValues();

  const locations: Option[] = useMemo(
    () => [
      { value: 'all', label: tFilter('location.any') },
      ...states.map((s) => ({
        value: s.id,
        label: locale === 'ar' ? s.name_ar : s.name,
      })),
    ],
    [states, locale, tFilter],
  );

  const { propertyTypes, furnishedTypes } = useLocalizedOptionsGroups(
    [
      { key: 'propertyTypes', translationPath: 'propertyType', options: [...propertyTypeValues] },
      { key: 'furnishedTypes', translationPath: 'furnishedType', options: [...furnishedValues] },
    ],
    'property.filter',
  );

  const [selectedLoc,       setSelectedLoc]       = useState<Option | null>(null);
  const [selectedType,      setSelectedType]      = useState<Option | null>(null);
  const [selectedFurnished, setSelectedFurnished] = useState<Option | null>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLoc && selectedLoc.value !== 'all') params.set('location', selectedLoc.value.toString());
    if (selectedType)      params.set('type',      selectedType.value.toString());
    if (selectedFurnished) params.set('furnished', selectedFurnished.value.toString());
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div role="search" aria-label={t('ariaLabel')} className="w-full max-w-[860px]">
      <div className="relative">
        {/* Gold glow ring */}
        <div aria-hidden="true" className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-r from-[color:var(--secondary)]/30 via-white/5 to-[color:var(--secondary)]/20 pointer-events-none" />

        <div className="relative rounded-[18px] bg-white/97 dark:bg-neutral-900/97 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.28),0_4px_12px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* Top accent stripe */}
          <div aria-hidden="true" className="h-[2.5px] w-full bg-gradient-to-r ltr:from-[color:var(--secondary)] ltr:to-transparent rtl:from-transparent rtl:to-[color:var(--secondary)] via-[color:var(--lightGold)]/70" />

          <div className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">

              {/* Location column */}
              <div className="flex-1 flex flex-col gap-1 sm:ltr:pr-3 sm:rtl:pl-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[color:var(--secondary)]/70 ltr:pl-1 rtl:pr-1">
                  <FiMapPin size={10} aria-hidden="true" />
                  {t('labels.location')}
                </span>
                <SelectInput
                  className="!w-full"
                  dropdownClassName="!max-h-[240px]"
                  triggerClassName="!border-0 !bg-slate-50/80 hover:!bg-slate-100 !rounded-xl !min-h-[46px] !shadow-none"
                  options={locations}
                  placeholder={t('labels.location')}
                  value={selectedLoc}
                  onChange={setSelectedLoc}
                />
              </div>

              <div className="hidden sm:block w-px self-stretch bg-slate-200 my-1" aria-hidden="true" />

              {/* Type column */}
              <div className="flex-1 flex flex-col gap-1 sm:px-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[color:var(--secondary)]/70 ltr:pl-1 rtl:pr-1">
                  <FiHome size={10} aria-hidden="true" />
                  {t('labels.propertyType')}
                </span>
                <SelectInput
                  className="!w-full"
                  dropdownClassName="!max-h-[240px]"
                  triggerClassName="!border-0 !bg-slate-50/80 hover:!bg-slate-100 !rounded-xl !min-h-[46px] !shadow-none"
                  options={propertyTypes}
                  placeholder={t('labels.propertyType')}
                  value={selectedType}
                  onChange={setSelectedType}
                />
              </div>

              <div className="hidden sm:block w-px self-stretch bg-slate-200 my-1" aria-hidden="true" />

              {/* Category column */}
              <div className="flex-1 flex flex-col gap-1 sm:ltr:pl-3 sm:rtl:pr-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[color:var(--secondary)]/70 ltr:pl-1 rtl:pr-1">
                  <FiLayers size={10} aria-hidden="true" />
                  {t('labels.category')}
                </span>
                <SelectInput
                  className="!w-full"
                  dropdownClassName="!max-h-[240px]"
                  triggerClassName="!border-0 !bg-slate-50/80 hover:!bg-slate-100 !rounded-xl !min-h-[46px] !shadow-none"
                  options={furnishedTypes}
                  placeholder={t('labels.category')}
                  value={selectedFurnished}
                  onChange={setSelectedFurnished}
                />
              </div>

              {/* CTA column */}
              <div className="flex items-end gap-2 sm:ltr:pl-3 sm:rtl:pr-3 shrink-0">
                <Link
                  href="/properties"
                  aria-label={t('advancedFilters')}
                  className="inline-flex items-center justify-center h-[46px] w-[46px] rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:bg-[color:var(--secondary)]/8 hover:text-[color:var(--secondary)] hover:border-[color:var(--secondary)]/30 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[color:var(--secondary)]/40 shrink-0"
                >
                  <HiOutlineAdjustmentsHorizontal size={18} aria-hidden="true" />
                </Link>

                <button
                  onClick={handleSearch}
                  className="group relative overflow-hidden inline-flex items-center justify-center gap-2 h-[46px] px-6 sm:px-8 rounded-xl bg-[color:var(--secondary)] text-white text-[14px] font-bold shadow-lg shadow-[color:var(--secondary)]/35 hover:shadow-xl hover:shadow-[color:var(--secondary)]/45 hover:brightness-110 active:scale-[0.97] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[color:var(--secondary)]/60 focus:ring-offset-2 whitespace-nowrap shrink-0"
                >
                  <span aria-hidden="true" className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  {t('search')}
                  <CiSearch size={18} aria-hidden="true" className="ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   USERS CARD
═══════════════════════════════════════════════════════════════════════════ */
export function UsersCard() {
  const t       = useTranslations('homePage.hero');
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.7, delay: 2, ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={cardRef} style={{ opacity: 0 }} className="w-full sm:w-auto">
      <div className="
        ltr:rounded-tl-2xl ltr:rounded-tr-2xl ltr:rounded-br-none ltr:rounded-bl-none
        rtl:rounded-tl-2xl rtl:rounded-tr-2xl rtl:rounded-bl-none rtl:rounded-br-none
        sm:ltr:rounded-tl-2xl sm:ltr:rounded-tr-none sm:ltr:rounded-br-none sm:ltr:rounded-bl-none
        sm:rtl:rounded-tr-2xl sm:rtl:rounded-tl-none sm:rtl:rounded-bl-none sm:rtl:rounded-br-none
        bg-white/92 backdrop-blur-xl
        border border-white/20
        shadow-[0_-4px_32px_rgba(0,0,0,0.18)]
        px-5 py-4 sm:px-6 sm:py-5
        flex flex-col sm:flex-row items-center gap-4 sm:gap-6
      ">
        <div dir="ltr" className="flex items-center shrink-0">
          {AVATAR_SRCS.map((src, i) => (
            <div
              key={src}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-110 hover:z-10 transition-transform duration-200"
              style={{ marginLeft: i === 0 ? 0 : -10, zIndex: i + 1 }}
            >
              <Image src={src} alt={t('avatarAlt', { index: String(i + 1) })} fill className="object-cover" sizes="48px" />
            </div>
          ))}
          <div
            className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white bg-[color:var(--secondary)] flex items-center justify-center shadow-md"
            style={{ marginLeft: -10, zIndex: AVATAR_SRCS.length + 1 }}
            aria-hidden="true"
          >
            <span className="text-white text-[10px] font-black leading-none">{t('avatarMore')}</span>
          </div>
        </div>

        <div className="hidden sm:block w-px self-stretch bg-slate-200/60" aria-hidden="true" />

        <div className="flex flex-row sm:flex-col items-center sm:ltr:items-end sm:rtl:items-start gap-3 sm:gap-1.5">
          <p className="text-2xl sm:text-3xl font-black text-[color:var(--secondary)] leading-none tabular-nums">
            {RATING}
            <span className="text-sm font-semibold text-slate-400 ltr:ml-0.5 rtl:mr-0.5">/5</span>
          </p>
          <RatingStars rating={RATING} />
          <p className="text-[11px] text-slate-400 font-medium sm:ltr:text-right sm:rtl:text-left whitespace-nowrap">
            {t('ratingLabel')}
          </p>
        </div>
      </div>
    </div>
  );
}