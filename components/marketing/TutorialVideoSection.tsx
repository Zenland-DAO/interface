"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { Heading, Text, Container } from "@/components/ui";
import { useScrollAnimation } from "@/hooks";

/** YouTube video configuration */
const VIDEO_CONFIG = {
  id: "zZCREbx8b8g",
  /** YouTube provides thumbnails at predictable URLs — no local asset needed */
  thumbnail: "https://i.ytimg.com/vi/zZCREbx8b8g/maxresdefault.jpg",
  /** Embed URL with privacy-enhanced mode */
  embedUrl: "https://www.youtube-nocookie.com/embed/zZCREbx8b8g",
  /** Embed params: autoplay on click, no related videos */
  embedParams: "autoplay=1&rel=0&modestbranding=1",
} as const;

/**
 * TutorialVideoSection — Facade Pattern YouTube Embed
 *
 * Renders a lightweight thumbnail + play button instead of a full iframe.
 * The real YouTube player only loads when the user clicks play.
 *
 * Performance impact:
 * - Before click: ~50KB (thumbnail image) vs ~800KB+ (full iframe)
 * - LCP: Zero impact — section is below the fold
 * - TBT/INP: Zero impact — no YouTube JS loaded until interaction
 */
export function TutorialVideoSection() {
  const t = useTranslations("marketing.tutorial");
  const [isPlaying, setIsPlaying] = useState(false);

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: videoRef, isVisible: videoVisible } = useScrollAnimation();

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  return (
    <section id="tutorial" className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      <Container size="lg">
        {/* Header */}
        <div
          ref={headerRef}
          className={`
            text-center mb-12 lg:mb-16 max-w-3xl mx-auto
            transition-all duration-1000 ease-out
            ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary-500/10 border border-primary-500/20">
            <Play className="w-3 h-3 text-primary-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
              {t("badge")}
            </span>
          </div>

          <Heading level={2} className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            {t("title")}
          </Heading>
          <Text variant="lead" className="text-lg sm:text-xl text-[var(--text-secondary)]">
            {t("subtitle")}
          </Text>
        </div>

        {/* Video Container — Facade Pattern */}
        <div
          ref={videoRef}
          className={`
            relative max-w-4xl mx-auto
            transition-all duration-1000 ease-out delay-200
            ${videoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
          `}
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--border-secondary)] shadow-2xl bg-black">
            {isPlaying ? (
              /* Real YouTube iframe — only loaded after user interaction */
              <iframe
                src={`${VIDEO_CONFIG.embedUrl}?${VIDEO_CONFIG.embedParams}`}
                title={t("videoTitle")}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              /* Facade: Lightweight thumbnail + play button */
              <button
                onClick={handlePlay}
                className="absolute inset-0 w-full h-full cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label={t("playButton")}
              >
                {/* Thumbnail */}
                <img
                  src={VIDEO_CONFIG.thumbnail}
                  alt={t("videoTitle")}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-500/90 group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl shadow-primary-500/30">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
