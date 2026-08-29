"use client";

import { LanguageToggle } from "@/components/internal/language-toggle";
import { ThemeToggle } from "@/components/internal/theme-toggle";
import { ArrowRightIcon, BedIcon, CheckIcon, ExternalLinkIcon, HomeIcon, MapPinIcon, MenuIcon, UsersIcon, XIcon } from "@/components/ui/icons";
import type { PublicAmenity, PublicLandingData } from "@/lib/api/types";
import { localize, type Locale } from "@/lib/locale";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type LandingPageProps = { data: PublicLandingData; locale: Locale; today: string };

const copy = {
  id: {
    navFacilities: "Fasilitas", navStay: "Galeri", navLocation: "Lokasi", navStatus: "Cek pesanan", check: "Cek ketersediaan",
    heroTitle: "Ruang tenang untuk pulang sejenak.",
    heroBody: "Menginap dengan ritme yang lebih pelan, fasilitas yang benar-benar berguna, dan akses mudah ke keseharian Bali.",
    explore: "Jelajahi ruang", arrival: "Tanggal datang", departure: "Tanggal pulang", guests: "Tamu", guestUnit: "tamu",
    availabilityTitle: "Temukan waktu menginapmu", availabilityBody: "Pilih tanggal dan jumlah tamu untuk melihat unit yang tersedia.",
    facilityEyebrow: "Fasilitas kamar", facilityTitle: "Yang membuat istirahat terasa mudah.", facilityBody: "Bukan daftar panjang yang dibuat untuk terlihat mewah. Hanya hal-hal penting yang membuat waktu di kamar terasa lebih nyaman.", facilityAvailable: "Tersedia di kamar",
    galleryTitle: "Galeri kamar.", galleryBody: "Lihat suasana, detail, dan sudut ruang yang akan menyambut waktu istirahatmu.",
    available: "unit tersedia", initialRooms: "unit aktif", perNight: "per malam", capacity: "kapasitas", bed: "tempat tidur",
    noRooms: "Belum ada unit yang sesuai.", noRoomsBody: "Coba ubah tanggal atau jumlah tamu untuk melihat pilihan lainnya.",
    locationTitle: "Dekat dengan kota, tetap terasa tenang.", locationBody: "Gunakan petunjuk arah untuk melihat posisi Prama Homestay dan merencanakan perjalananmu.", openMaps: "Buka di Google Maps",
    finalTitle: "Datang untuk beristirahat. Pulang dengan energi baru.", finalBody: "Mulai dari tanggal yang cocok, lalu biarkan kami menyiapkan ruangnya.",
    footer: "Ruang menginap yang hangat di Bali.", menu: "Navigasi", contact: "Kontak", notAvailable: "Belum tersedia",
  },
  en: {
    navFacilities: "Amenities", navStay: "Gallery", navLocation: "Location", navStatus: "Find booking", check: "Check availability",
    heroTitle: "A quiet space to return to, for a while.",
    heroBody: "Stay at a gentler pace, with amenities that matter and easy access to everyday Bali.",
    explore: "Explore the space", arrival: "Arrival date", departure: "Departure date", guests: "Guests", guestUnit: "guests",
    availabilityTitle: "Find your time to stay", availabilityBody: "Choose your dates and party size to see available units.",
    facilityEyebrow: "Room amenities", facilityTitle: "Everything that makes rest feel effortless.", facilityBody: "Not a long list made to look luxurious. Just the essentials that make time in your room more comfortable.", facilityAvailable: "Available in the room",
    galleryTitle: "Room gallery.", galleryBody: "Explore the atmosphere, details, and spaces that will welcome your time to rest.",
    available: "units available", initialRooms: "active units", perNight: "per night", capacity: "capacity", bed: "bed",
    noRooms: "No matching units yet.", noRoomsBody: "Try changing the dates or guest count to see other options.",
    locationTitle: "Close to the city, still calm at heart.", locationBody: "Open directions to find Prama Homestay and plan your journey.", openMaps: "Open in Google Maps",
    finalTitle: "Arrive to rest. Leave with renewed energy.", finalBody: "Start with the right dates, then let us prepare the space.",
    footer: "A warm place to stay in Bali.", menu: "Navigation", contact: "Contact", notAvailable: "Not available yet",
  },
} as const;

function amenityLabel(amenity: PublicAmenity, locale: Locale) {
  return locale === "en" && amenity.name_en?.trim() ? amenity.name_en : amenity.name;
}

function amenityDescription(amenity: PublicAmenity, locale: Locale) {
  const value = locale === "en" && amenity.description_en?.trim() ? amenity.description_en : amenity.description;
  return value?.trim() || null;
}

function formatMoney(value: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
}

export function LandingPage({ data, locale, today }: LandingPageProps) {
  const root = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const t = copy[locale];
  const hasSearch = Boolean(data.filters.check_in && data.filters.check_out);
  const visualImages = data.rooms.flatMap((room) => room.images.map((image) => ({ ...image, roomName: room.name }))).slice(0, 5);
  const heroSlides = data.hero_media.images.length > 0
    ? data.hero_media.images.map((image) => ({ ...image, alt: data.property.name }))
    : visualImages.map((image) => ({ ...image, alt: image.roomName }));
  const heroImage = heroSlides[0];
  const facilityImage = visualImages[0] ? { url: visualImages[0].url, alt: visualImages[0].roomName } : heroImage;
  const finalCtaImageUrl = data.final_cta_media.image_url ?? heroImage?.url;
  const useHeroVideo = data.hero_media.type === "video" && Boolean(data.hero_media.video_url);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || !useHeroVideo) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (motion.matches) { video.pause(); video.currentTime = 0; }
      else video.play().catch(() => undefined);
    };
    syncPlayback();
    motion.addEventListener("change", syncPlayback);
    return () => motion.removeEventListener("change", syncPlayback);
  }, [useHeroVideo, data.hero_media.video_url]);

  function validateDates(event: FormEvent<HTMLFormElement>) {
    const checkIn = event.currentTarget.elements.namedItem("check_in") as HTMLInputElement;
    const checkOut = event.currentTarget.elements.namedItem("check_out") as HTMLInputElement;
    checkOut.setCustomValidity("");
    if (checkIn.value && checkOut.value && checkOut.value <= checkIn.value) {
      event.preventDefault();
      checkOut.setCustomValidity(locale === "en" ? "Departure must be after arrival." : "Tanggal pulang harus setelah tanggal datang.");
      checkOut.reportValidity();
    }
  }

  function scrollToSection(event: MouseEvent<HTMLAnchorElement>, target: string) {
    event.preventDefault();
    setMobileNavOpen(false);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smoother = ScrollSmoother.get();

    if (smoother) {
      smoother.scrollTo(target, !reduceMotion, "top 80px");
      return;
    }

    document.querySelector(target)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  useGSAP(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 0.9,
        smoothTouch: false,
        effects: false,
      });

      return () => smoother.kill();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-copy > *", { y: 28, autoAlpha: 0, duration: 1.1, stagger: 0.08 })
        .from(".hero-media-object", { scale: 1.1, duration: 1.6 }, 0.02)
        .from(".hero-scrim", { autoAlpha: 0.65, duration: 1.2 }, 0.08)
        .from(".availability-panel", { y: 32, autoAlpha: 0, duration: 0.9 }, 0.45);

      const slides = gsap.utils.toArray<HTMLElement>("[data-hero-slide]");
      let carouselTimer: gsap.core.Tween | null = null;
      if (slides.length > 1) {
        let current = 0;
        const advance = () => {
          const next = (current + 1) % slides.length;
          gsap.timeline()
            .to(slides[current], { autoAlpha: 0, duration: 1.2, ease: "power2.inOut" }, 0)
            .to(slides[next], { autoAlpha: 1, duration: 1.2, ease: "power2.inOut" }, 0);
          current = next;
          carouselTimer = gsap.delayedCall(data.hero_media.cycle_seconds, advance);
        };
        carouselTimer = gsap.delayedCall(data.hero_media.cycle_seconds, advance);
      }

      ScrollTrigger.create({
        start: 40,
        end: () => ScrollTrigger.maxScroll(window) + 2,
        toggleClass: { targets: ".public-header", className: "is-scrolled" },
      });

      ScrollTrigger.create({
        trigger: ".final-cta",
        start: "top 80px",
        end: "bottom top",
        toggleClass: { targets: ".public-header", className: "is-over-media" },
      });

      gsap.utils.toArray<HTMLElement>(".facility-row").forEach((row) => {
        gsap.from(row, { y: 16, duration: 0.65, ease: "power2.out", scrollTrigger: { trigger: row, start: "top 88%", once: true } });
      });

      gsap.utils.toArray<HTMLElement>(".gallery-media img").forEach((image) => {
        gsap.fromTo(image, { yPercent: -5, scale: 1.04 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: 0.7 } });
      });

      const facilityMediaElement = root.current?.querySelector<HTMLElement>(".facility-image");
      const facilitiesSection = root.current?.querySelector<HTMLElement>(".facilities");
      if (facilityMediaElement && facilitiesSection) {
        gsap.fromTo(
          facilityMediaElement,
          { yPercent: -5, scale: 1.08 },
          { yPercent: 5, scale: 1.08, ease: "none", scrollTrigger: { trigger: facilitiesSection, start: "top bottom", end: "bottom top", scrub: 0.7 } },
        );
      }

      gsap.fromTo(".final-media img", { scale: 1.02 }, { scale: 1.12, ease: "none", scrollTrigger: { trigger: ".final-cta", start: "top bottom", end: "bottom top", scrub: 0.8 } });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => carouselTimer?.kill();
    });

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.from(".facility-visual", { y: 40, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: ".facilities", start: "top 70%" } });
    });

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      mm.revert();
    };
  }, { scope: root });

  return <div ref={root} className="public-site bg-background text-foreground">
    <header className="public-header fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color,box-shadow] duration-300">
      <div className="flex h-20 w-full items-center justify-between px-5 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-12 xl:px-16">
        <a href="#top" onClick={(event) => scrollToSection(event, "#top")} className="public-brand flex min-w-0 items-center gap-3 lg:justify-self-start" aria-label={`${data.property.name} home`}>
          <span className="public-brand-mark grid size-10 place-items-center rounded-sm bg-primary text-background"><HomeIcon className="size-5" /></span>
          <span className="text-sm font-bold tracking-[-0.02em] sm:text-base">{data.property.name}</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex lg:justify-self-center" aria-label={t.menu}>
          <a className="public-nav-link" href="#facilities" onClick={(event) => scrollToSection(event, "#facilities")}>{t.navFacilities}</a>
          <a className="public-nav-link" href="#stay" onClick={(event) => scrollToSection(event, "#stay")}>{t.navStay}</a>
          <a className="public-nav-link" href="#location" onClick={(event) => scrollToSection(event, "#location")}>{t.navLocation}</a>
          <a className="public-nav-link" href="/booking/status">{t.navStatus}</a>
        </nav>
        <div className="public-header-tools flex items-center gap-2 lg:justify-self-end">
          <LanguageToggle />
          <ThemeToggle />
          <a href="/booking" className="public-header-cta hidden h-11 items-center bg-primary px-5 text-sm font-bold text-background transition-transform hover:-translate-y-0.5 md:flex">{t.check}</a>
          <button type="button" onClick={() => setMobileNavOpen((open) => !open)} aria-expanded={mobileNavOpen} aria-controls="public-mobile-navigation" aria-label={mobileNavOpen ? localize(locale, "Tutup navigasi", "Close navigation") : localize(locale, "Buka navigasi", "Open navigation")} className="grid size-11 place-items-center rounded-sm border bg-surface-low lg:hidden">{mobileNavOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}</button>
        </div>
      </div>
      {mobileNavOpen && <nav id="public-mobile-navigation" aria-label={t.menu} className="absolute inset-x-4 top-[calc(100%+8px)] grid gap-1 bg-background p-3 text-foreground shadow-[0_22px_60px_-28px_rgba(0,0,0,0.45)] sm:inset-x-8 lg:hidden">
        <a href="#facilities" onClick={(event) => scrollToSection(event, "#facilities")} className="px-4 py-3 text-sm font-semibold hover:bg-surface-low">{t.navFacilities}</a>
        <a href="#stay" onClick={(event) => scrollToSection(event, "#stay")} className="px-4 py-3 text-sm font-semibold hover:bg-surface-low">{t.navStay}</a>
        <a href="#location" onClick={(event) => scrollToSection(event, "#location")} className="px-4 py-3 text-sm font-semibold hover:bg-surface-low">{t.navLocation}</a>
        <a href="/booking/status" className="px-4 py-3 text-sm font-semibold hover:bg-surface-low">{t.navStatus}</a>
        <a href="/booking" className="mt-2 flex min-h-12 items-center justify-center bg-primary px-5 text-sm font-bold text-background">{t.check}</a>
      </nav>}
    </header>

    <div id="smooth-wrapper">
      <div id="smooth-content" className="overflow-clip">
    <main id="top">
      <div className="hero-shell relative bg-background">
        <section className="hero-section relative isolate min-h-[620px] overflow-hidden sm:min-h-[720px] lg:min-h-[max(900px,100svh)]">
          <div data-hero-media-slot className="hero-media absolute inset-0 -z-20 overflow-hidden bg-[#26211b]">
            {useHeroVideo ? <video ref={heroVideoRef} src={data.hero_media.video_url ?? undefined} poster={heroImage?.url} muted loop playsInline preload="metadata" className="hero-media-object size-full object-cover" /> : heroSlides.map((image, index) => <Image key={image.id} data-hero-slide src={image.url} alt={image.alt} fill loading={index === 0 ? "eager" : "lazy"} sizes="100vw" className={`hero-media-object object-cover ${index === 0 ? "opacity-100" : "opacity-0"}`} />)}
            {!useHeroVideo && heroSlides.length === 0 && <div className="absolute inset-0 bg-[#26211b]" />}
          </div>
          <div className="hero-scrim absolute inset-0 -z-10" />

          <div className="hero-copy relative flex min-h-[620px] w-full flex-col justify-center px-5 pt-28 pb-16 text-white sm:min-h-[720px] sm:px-8 sm:pt-32 sm:pb-20 lg:min-h-[max(900px,100svh)] lg:px-12 lg:pt-40 lg:pb-72 xl:px-16">
            <h1 className="max-w-[11ch] text-balance text-[clamp(3rem,6.2vw,5.8rem)] leading-[0.94] font-semibold tracking-[-0.04em]">{t.heroTitle}</h1>
            <p className="mt-6 max-w-[38rem] text-pretty text-base leading-7 text-white/80 sm:mt-8 sm:text-lg sm:leading-8">{t.heroBody}</p>
            <div className="mt-8 flex flex-wrap items-center gap-5 sm:mt-10">
              <a href="/booking" className="group inline-flex h-13 items-center gap-3 bg-white px-6 text-sm font-bold text-black transition-transform hover:-translate-y-0.5">{t.check}<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></a>
              <a href="#stay" onClick={(event) => scrollToSection(event, "#stay")} className="public-hero-link text-sm font-semibold">{t.explore}</a>
            </div>
          </div>
        </section>

        <div className="bg-surface px-5 py-10 sm:px-8 sm:py-12 lg:absolute lg:inset-x-12 lg:bottom-8 lg:z-10 lg:bg-transparent lg:p-0 xl:inset-x-16">
          <div id="availability" className="availability-panel lg:bg-surface lg:p-8 lg:shadow-[0_28px_70px_-36px_rgba(17,17,17,0.42)]">
            <div className="mb-6 flex flex-col justify-between gap-2 lg:flex-row lg:items-end">
              <div><h2 className="text-2xl font-semibold tracking-[-0.03em]">{t.availabilityTitle}</h2><p className="mt-1 text-sm text-muted">{t.availabilityBody}</p></div>
              <p className="text-sm font-semibold text-secondary">{data.rooms.length} {hasSearch ? t.available : t.initialRooms}</p>
            </div>
            <form action="/booking" onSubmit={validateDates} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_auto]">
              <label className="public-field"><span>{t.arrival}</span><input required type="date" name="check_in" min={today} defaultValue={data.filters.check_in ?? ""} /></label>
              <label className="public-field"><span>{t.departure}</span><input required type="date" name="check_out" min={data.filters.check_in ?? today} defaultValue={data.filters.check_out ?? ""} /></label>
              <label className="public-field"><span>{t.guests}</span><select name="guests" defaultValue={String(data.filters.guests)}>{[1,2,3,4,5,6].map((count) => <option key={count} value={count}>{count} {t.guestUnit}</option>)}</select></label>
              <button type="submit" className="h-14 self-end bg-primary px-7 text-sm font-bold text-background transition-transform hover:-translate-y-0.5">{t.check}</button>
            </form>
          </div>
        </div>
      </div>

      <section id="facilities" className="facilities grid w-full gap-12 bg-surface-warm px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20 lg:px-12 lg:py-32 xl:px-16">
        <div className="facility-visual lg:h-[calc(100vh-9rem)] lg:max-h-[46rem] lg:self-start">
          <figure className="relative h-[26rem] overflow-hidden bg-surface-low sm:h-[34rem] lg:h-full">
            {facilityImage && <Image src={facilityImage.url} alt={facilityImage.alt} fill loading="eager" sizes="(min-width: 1024px) 42vw, 100vw" className="facility-image object-cover" />}
            {!facilityImage && <div className="absolute inset-0 bg-surface-high" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-xs font-semibold tracking-[0.14em] text-white/65 uppercase">{t.facilityEyebrow}</p>
              <p className="mt-3 max-w-md text-base leading-7 text-white/90">{t.facilityBody}</p>
            </figcaption>
          </figure>
        </div>
        <div className="lg:py-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-secondary uppercase">{t.facilityEyebrow}</p>
          <h2 className="mt-7 max-w-[12ch] text-balance text-[clamp(2.7rem,4.6vw,4.8rem)] leading-[0.98] font-semibold tracking-[-0.04em]">{t.facilityTitle}</h2>
          {data.amenities.length ? <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {data.amenities.map((amenity, index) => <article key={amenity.id} className="facility-row group grid min-h-40 grid-cols-[2rem_1fr] gap-x-4 bg-surface p-5 sm:min-h-44 sm:p-6">
              <span className="pt-1 text-xs font-semibold text-secondary tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <div className="flex min-w-0 flex-col"><div className="flex items-start justify-between gap-4"><h3 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{amenityLabel(amenity, locale)}</h3><span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary-soft text-secondary transition-transform duration-300 group-hover:scale-105"><CheckIcon className="size-4" /></span></div><p className="mt-auto pt-5 text-sm leading-6 text-muted">{amenityDescription(amenity, locale) ?? t.facilityAvailable}</p></div>
            </article>)}
          </div> : <div className="mt-12 bg-surface p-8"><p className="text-lg font-semibold">{t.notAvailable}</p></div>}
        </div>
      </section>

      <section id="stay" className="bg-background py-20 sm:py-24 lg:py-36">
        <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <h2 className="max-w-[15ch] text-balance text-[clamp(2.7rem,5vw,5.2rem)] leading-[0.98] font-semibold tracking-[-0.04em]">{t.galleryTitle}</h2>
            <p className="max-w-xl text-lg leading-8 text-muted lg:justify-self-end">{t.galleryBody}</p>
          </div>
          {visualImages.length ? <div className="mt-10 grid gap-3 sm:mt-14 sm:gap-4 md:grid-cols-2 lg:auto-rows-[20rem] lg:grid-flow-dense lg:grid-cols-12">
            {visualImages.map((image, index) => {
              const layout = ["md:col-span-2 md:aspect-[16/9] lg:col-span-7 lg:row-span-2 lg:aspect-auto", "lg:col-span-5", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"][index] ?? "lg:col-span-4";
              const imageSizes = index === 0 ? "(min-width: 1024px) 58vw, (min-width: 768px) calc(100vw - 4rem), 100vw" : "(min-width: 1024px) 42vw, (min-width: 768px) calc(50vw - 2.5rem), 100vw";
              return <figure key={`${image.id}-${image.roomName}`} className={`gallery-media group relative min-h-64 overflow-hidden bg-surface-high md:aspect-[4/3] md:min-h-0 lg:aspect-auto ${layout}`}>
                <Image src={image.url} alt={`${localize(locale, "Galeri kamar", "Room gallery")} · ${image.roomName}`} fill loading={index === 0 ? "eager" : "lazy"} sizes={imageSizes} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
              </figure>;
            })}
          </div> : <div className="mt-16 border-y py-14"><h3 className="text-2xl font-semibold">{localize(locale, "Galeri belum tersedia.", "Gallery not available yet.")}</h3><p className="mt-2 text-muted">{localize(locale, "Tambahkan foto melalui menu Kamar agar galeri tampil di sini.", "Add photos from the Rooms menu to display the gallery here.")}</p></div>}
        </div>
      </section>

      {hasSearch && <section aria-live="polite" className="w-full px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col justify-between gap-4 border-b pb-8 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-semibold tracking-[-0.03em]">{data.rooms.length} {t.available}</h2><p className="mt-2 text-muted">{data.filters.check_in} / {data.filters.check_out} · {data.filters.guests} {t.guestUnit}</p></div><a href="#availability" onClick={(event) => scrollToSection(event, "#availability")} className="public-text-link text-sm font-semibold">{t.check}</a></div>
        {data.rooms.length ? <div className="divide-y">{data.rooms.map((room) => <article key={room.id} className="grid gap-6 py-8 sm:grid-cols-[1fr_auto] sm:items-center"><div><h3 className="text-xl font-semibold">{room.name}</h3><p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"><span className="inline-flex items-center gap-2"><UsersIcon className="size-4" />{t.capacity} {room.capacity}</span><span className="inline-flex items-center gap-2"><BedIcon className="size-4" />{room.bed_count} {t.bed}</span></p></div><p className="text-lg font-bold">{formatMoney(room.price_per_night, locale)} <span className="text-sm font-normal text-muted">{t.perNight}</span></p></article>)}</div> : <div className="py-12"><h3 className="text-xl font-semibold">{t.noRooms}</h3><p className="mt-2 text-muted">{t.noRoomsBody}</p></div>}
      </section>}

      <section id="location" className="grid w-full gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-12 lg:py-36 xl:px-16">
        <div className="lg:pr-8"><h2 className="max-w-[12ch] text-balance text-[clamp(2.7rem,5vw,5.2rem)] leading-[0.98] font-semibold tracking-[-0.04em]">{t.locationTitle}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-muted">{t.locationBody}</p></div>
        <div className="relative min-h-[28rem] overflow-hidden bg-secondary-soft sm:min-h-[32rem] lg:min-h-[36rem]">
          <iframe title={localize(locale, "Peta lokasi Prama Homestay", "Prama Homestay location map")} src={`https://maps.google.com/maps?q=${encodeURIComponent(data.property.address)}&z=16&output=embed`} loading="eager" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="absolute inset-0 size-full border-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
          <div className="absolute right-4 bottom-4 left-4 flex flex-col items-start justify-between gap-5 bg-background/95 p-5 text-foreground shadow-[0_16px_50px_rgba(0,0,0,0.2)] backdrop-blur-md sm:right-6 sm:bottom-6 sm:left-6 sm:flex-row sm:items-end sm:p-6">
            <div className="flex max-w-xl items-start gap-4"><span className="mt-0.5 grid size-10 shrink-0 place-items-center bg-secondary-soft text-secondary"><MapPinIcon className="size-5" /></span><p className="text-base leading-7 font-semibold sm:text-lg">{data.property.address}</p></div>
            <a href={data.property.maps_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-3 bg-primary px-5 text-sm font-bold text-background transition-transform hover:-translate-y-0.5">{t.openMaps}<ExternalLinkIcon className="size-4" /></a>
          </div>
        </div>
      </section>

      <section className="final-cta relative min-h-[44rem] overflow-hidden text-white lg:min-h-[46rem]">
        <div className="final-media absolute inset-0">{finalCtaImageUrl ? <Image src={finalCtaImageUrl} alt="" fill sizes="100vw" className="object-cover" /> : <div className="absolute inset-0 bg-[#312719]" />}</div>
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative flex min-h-[44rem] w-full flex-col items-start px-5 pt-40 pb-24 sm:px-8 sm:pt-44 lg:min-h-[46rem] lg:px-12 lg:pt-48 xl:px-16">
          <h2 className="max-w-[13ch] text-balance text-[clamp(3rem,4.8vw,5rem)] leading-[0.98] font-semibold tracking-[-0.04em]">{t.finalTitle}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/80">{t.finalBody}</p><a href="/booking" className="group mt-10 inline-flex h-13 items-center gap-3 bg-white px-6 text-sm font-bold text-black transition-transform hover:-translate-y-0.5">{t.check}<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></a>
        </div>
      </section>
    </main>

    <footer className="bg-[#111313] text-white">
      <div className="grid w-full gap-12 px-5 py-16 sm:px-8 md:grid-cols-3 lg:px-12 xl:px-16">
        <div><p className="text-xl font-bold">{data.property.name}</p><p className="mt-3 max-w-xs text-sm leading-6 text-white/60">{t.footer}</p></div>
        <div><p className="text-sm font-bold">{t.menu}</p><div className="mt-4 flex flex-col items-start gap-3 text-sm text-white/60"><a href="#facilities" onClick={(event) => scrollToSection(event, "#facilities")}>{t.navFacilities}</a><a href="#stay" onClick={(event) => scrollToSection(event, "#stay")}>{t.navStay}</a><a href="#location" onClick={(event) => scrollToSection(event, "#location")}>{t.navLocation}</a><a href="/booking/status">{t.navStatus}</a></div></div>
        <div><p className="text-sm font-bold">{t.contact}</p><div className="mt-4 space-y-2 text-sm text-white/60"><p>{data.property.phone ?? t.notAvailable}</p><p>{data.property.email ?? t.notAvailable}</p></div></div>
      </div>
      <div className="public-footer-divider mx-5 border-t py-6 text-xs text-white/45 sm:mx-8 lg:mx-12 xl:mx-16">© {new Date().getFullYear()} {data.property.name}</div>
    </footer>
      </div>
    </div>
  </div>;
}
