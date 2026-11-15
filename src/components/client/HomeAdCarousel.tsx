import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight, Megaphone } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { resolveStationBranding } from '@/config/operators';
import { HomeAdBannerSlide } from '@/types';

const AUTO_ADVANCE_MS = 4800;
const SWIPE_THRESHOLD_PX = 42;

export const HomeAdCarousel: React.FC = () => {
  const navigate = useNavigate();
  const { homeAdBanners, stations } = useAppStore(s => ({
    homeAdBanners: s.homeAdBanners || [],
    stations: s.stations || [],
  }));

  const activeSlides = useMemo(
    () => homeAdBanners.filter(b => b.isActive && Boolean(b.imageUrl)),
    [homeAdBanners]
  );

  const stationById = useMemo(() => {
    const map = new Map<string, (typeof stations)[number]>();
    for (const st of stations) {
      map.set(st.id, st);
    }
    return map;
  }, [stations]);

  const count = activeSlides.length;
  const hasMultiple = count > 1;

  // Seamless infinite forward loop: render [...activeSlides, activeSlides[0]] when count > 1
  const renderedSlides = useMemo(
    () => (hasMultiple ? [...activeSlides, activeSlides[0]] : activeSlides),
    [activeSlides, hasMultiple]
  );

  const [slideIndex, setSlideIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const pointerStartXRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);

  // Detect OS prefers-reduced-motion setting
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Clamp index if active slides list shrinks
  useEffect(() => {
    if (count === 0) return;
    if (slideIndex > count) {
      setIsTransitionEnabled(false);
      setSlideIndex(0);
    }
  }, [count, slideIndex]);

  // Re-enable CSS transition right after an instant loop snap (index -> 0)
  useEffect(() => {
    if (isTransitionEnabled) return;
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsTransitionEnabled(true);
        isTransitioningRef.current = false;
      });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isTransitionEnabled]);

  const goToNext = useCallback(() => {
    if (!hasMultiple || isTransitioningRef.current) return;
    if (prefersReducedMotion) {
      setIsTransitionEnabled(false);
      setSlideIndex(prev => (prev + 1 >= count ? 0 : prev + 1));
      return;
    }
    isTransitioningRef.current = true;
    setIsTransitionEnabled(true);
    setSlideIndex(prev => (prev >= count ? 0 : prev + 1));
  }, [hasMultiple, prefersReducedMotion, count]);

  const goToPrev = useCallback(() => {
    if (!hasMultiple || isTransitioningRef.current) return;
    if (prefersReducedMotion) {
      setIsTransitionEnabled(false);
      setSlideIndex(prev => (prev <= 0 ? count - 1 : prev - 1));
      return;
    }
    if (slideIndex === 0) {
      // Snap cleanly to clone at `count`, then transition backward to `count - 1`
      setIsTransitionEnabled(false);
      setSlideIndex(count);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          isTransitioningRef.current = true;
          setIsTransitionEnabled(true);
          setSlideIndex(count - 1);
        });
      });
      return;
    }
    isTransitioningRef.current = true;
    setIsTransitionEnabled(true);
    setSlideIndex(prev => prev - 1);
  }, [hasMultiple, prefersReducedMotion, slideIndex, count]);

  const goToIndex = useCallback(
    (targetIdx: number) => {
      if (!hasMultiple) return;
      setIsTransitionEnabled(!prefersReducedMotion);
      isTransitioningRef.current = !prefersReducedMotion;
      setSlideIndex(Math.max(0, Math.min(targetIdx, count - 1)));
    },
    [hasMultiple, prefersReducedMotion, count]
  );

  // Auto-advance timer (infinite swipe)
  useEffect(() => {
    if (!hasMultiple || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      goToNext();
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [hasMultiple, isPaused, prefersReducedMotion, goToNext]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (slideIndex === count) {
      // Landed on the trailing clone of slide 0 -> instant silent snap back to index 0
      setIsTransitionEnabled(false);
      setSlideIndex(0);
    } else {
      isTransitioningRef.current = false;
    }
  };

  const handleOpenAdDestination = (slide: HomeAdBannerSlide) => {
    const station = stationById.get(slide.stationId);
    if (station) {
      store.setSelectedStation(station.id);
    }
    const section = slide.targetSection || 'overview';
    navigate(`/stations/${slide.stationId}?section=${section}`);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    pointerStartXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasMultiple || pointerStartXRef.current === null) return;
    const deltaX = e.clientX - pointerStartXRef.current;
    pointerStartXRef.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX < 0) {
      goToNext();
    } else {
      goToPrev();
    }
  };

  if (count === 0) return null;

  const logicalIndex = slideIndex % count;
  const activeSlide = activeSlides[logicalIndex] || activeSlides[0];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Campagnes publicitaires Full HD des stations partenaires"
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Full HD 16:9 (1920x1080) Viewport Frame */}
      <div
        className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-xl select-none touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartXRef.current = null;
        }}
      >
        {/* Sliding Horizontal Track */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`flex h-full w-full ${
            isTransitionEnabled && !prefersReducedMotion
              ? 'transition-transform duration-500 ease-out'
              : ''
          }`}
          style={{
            transform: `translate3d(-${slideIndex * 100}%, 0, 0)`,
          }}
        >
          {renderedSlides.map((slide, idx) => {
            const station = stationById.get(slide.stationId);
            const branding = station ? resolveStationBranding(station) : null;
            const isClone = hasMultiple && idx === count;

            return (
              <article
                key={`${slide.id}-${idx}`}
                aria-hidden={isClone || idx !== slideIndex}
                className="relative w-full h-full shrink-0 bg-slate-950"
              >
                <img
                  src={slide.imageUrl}
                  alt={`${slide.title} — ${station?.name || slide.stationName || 'Station partenaire'}`}
                  draggable={false}
                  className="w-full h-full object-cover"
                />

                {/* Top Subtle Legibility Gradient */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-transparent pointer-events-none"
                />

                {/* Bottom Glass Readability Gradient */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent pointer-events-none"
                />

                {/* Top-Left Emitting Station Pill & Sponsored Tag */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 right-16 flex flex-wrap items-center gap-2 z-10 pointer-events-none">
                  {station && branding && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] sm:text-xs font-extrabold shadow-sm border border-white/60">
                      <img
                        src={branding.logo}
                        alt=""
                        className="w-4 h-4 object-contain rounded shrink-0"
                      />
                      <span className="truncate max-w-[140px] sm:max-w-[220px]">
                        {station.name}
                      </span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-white/15">
                    <Megaphone className="w-3 h-3" aria-hidden="true" />
                    <span>{slide.badgeLabel || 'Offre Station'}</span>
                  </span>
                </div>

                {/* Top-Right Full HD / Slide Counter */}
                {hasMultiple && (
                  <div className="hidden sm:flex items-center gap-1.5 absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-slate-200 pointer-events-none">
                    <span>
                      {(idx % count) + 1}/{count}
                    </span>
                  </div>
                )}

                {/* Bottom Overlay: Title, Subtitle & Action CTA */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 z-10">
                  <div className="min-w-0 max-w-xl">
                    <h2 className="text-sm sm:text-xl font-black text-white leading-tight line-clamp-1 sm:line-clamp-2 drop-shadow-sm">
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className="text-[11px] sm:text-sm text-slate-200 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5 drop-shadow-sm">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    tabIndex={isClone || idx !== slideIndex ? -1 : 0}
                    onClick={() => handleOpenAdDestination(slide)}
                    className="self-start sm:self-end shrink-0 min-h-[38px] sm:min-h-[44px] inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 text-xs sm:text-sm font-black shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span>{slide.ctaLabel || 'Voir en station'}</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Prev / Next Controls (>= 44x44px touch targets) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Publicité précédente"
              className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/55 hover:bg-slate-900/80 text-white backdrop-blur-md border border-white/20 absolute left-3 top-1/2 -translate-y-1/2 z-20 transition-all focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Publicité suivante"
              className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/55 hover:bg-slate-900/80 text-white backdrop-blur-md border border-white/20 absolute right-3 top-1/2 -translate-y-1/2 z-20 transition-all focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots + Live Status Footer */}
      {hasMultiple && (
        <div className="mt-2.5 flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold text-slate-500 truncate pr-2">
            Annonce : <span className="font-bold text-slate-700">{stationById.get(activeSlide.stationId)?.name || activeSlide.stationName}</span>
          </p>
          <div className="flex items-center gap-1" role="tablist" aria-label="Sélectionner une annonce">
            {activeSlides.map((slide, dotIdx) => {
              const isCurrent = dotIdx === logicalIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`Afficher l'annonce ${dotIdx + 1} sur ${count} : ${slide.title}`}
                  onClick={() => goToIndex(dotIdx)}
                  className="min-w-[44px] min-h-[44px] -my-2 -mx-1.5 flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      isCurrent ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
