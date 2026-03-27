import React, { useState, useEffect, useCallback, useRef } from "react";
import { getPinnedPostsAPI, getBoardDetailAPI } from "@/api/board";
import { getAttachmentPresignedUrl } from "@/api/attachments";
import type { Board } from "@/domains/Board/types";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

const getFirstImageAttachmentId = (board: Board): number | null => {
  if (!board.attachments || board.attachments.length === 0) return null;
  for (const att of board.attachments) {
    if (att.originFilename) {
      const ext = att.originFilename.split(".").pop()?.toLowerCase() || "";
      if (IMAGE_EXTENSIONS.includes(ext)) return att.id;
    }
    return att.id;
  }
  return null;
};

interface BannerImage {
  url: string;
  title: string;
}

const FALLBACK: BannerImage[] = [{ url: "/nimda_con_1.png", title: "NIMDA CON" }];

const Banner: React.FC = () => {
  const [images, setImages] = useState<BannerImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getPinnedPostsAPI(undefined, "banner", 10);
        const pinnedPosts = (result.posts || []).filter((p) => p.pinned);

        const resolved: BannerImage[] = [];
        for (const post of pinnedPosts) {
          const detail = await getBoardDetailAPI(post.id);
          if (detail.success && "board" in detail && detail.board) {
            const id = getFirstImageAttachmentId(detail.board);
            if (id) {
              const url = await getAttachmentPresignedUrl(id);
              if (url) resolved.push({ url, title: post.title });
            }
          }
        }

        setImages(resolved.length > 0 ? resolved : FALLBACK);
      } catch {
        setImages(FALLBACK);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startTimer = useCallback((count: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % count),
      5000
    );
  }, []);

  useEffect(() => {
    startTimer(images.length);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, startTimer]);

  const go = useCallback(
    (idx: number) => {
      setCurrent(idx);
      startTimer(images.length);
    },
    [images.length, startTimer]
  );

  if (loading) return <div className="home-banner" />;

  return (
    <div className="home-banner">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`home-banner__slide home-banner__slide--img${
            idx === current ? " home-banner__slide--active" : ""
          }`}
        >
          <img src={img.url} alt={img.title} className="home-banner__img" />
        </div>
      ))}
      {images.length > 1 && (
        <>
          <button
            className="home-banner__btn home-banner__btn--prev"
            onClick={() => go((current - 1 + images.length) % images.length)}
          >
            &lsaquo;
          </button>
          <button
            className="home-banner__btn home-banner__btn--next"
            onClick={() => go((current + 1) % images.length)}
          >
            &rsaquo;
          </button>
          <div className="home-banner__dots">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`home-banner__dot${
                  idx === current ? " home-banner__dot--active" : ""
                }`}
                onClick={() => go(idx)}
                aria-label={`슬라이드 ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Banner;
