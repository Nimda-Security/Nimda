'use client';
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useCallback, useEffect } from "react";

// Data
import { CLUB, DESKTOP_ICONS } from "../data/constants";

// Components
import BootScreen from "../components/OS/BootScreen";
import MenuBar from "../components/OS/MenuBar";
import Dock from "../components/OS/Dock";
import DesktopIcon from "../components/OS/DesktopIcon";
import Window from "../components/OS/Window";

export default function Page() {
  const [booted, setBooted] = useState(false);
  const [openWindows, setOpenWindows] = useState([]);
  const [topZ, setTopZ] = useState(100);

  const handleBoot = useCallback(() => setBooted(true), []);

  useEffect(() => {
    if (booted) {
      // Auto-open Sticker app on boot
      setTimeout(() => {
        setOpenWindows((prev) => {
          if (prev.find((w) => w.id === "sticker")) return prev;
          return [
            ...prev,
            {
              id: "sticker",
              zIndex: 101, // Ensure it pops up
              position: { x: 100, y: 100 },
            },
          ];
        });
      }, 800);
    }
  }, [booted]);

  const openWindow = useCallback((iconId) => {
    // Safari → 동아리 페이지 / 지원 링크 선택 메뉴
    if (iconId === "safari") {
      window.open(CLUB.links.homepage, "_blank");
      return;
    }
    setOpenWindows((prev) => {
      const exists = prev.find((w) => w.id === iconId);
      if (exists) {
        setTopZ((z) => z + 1);
        return prev.map((w) =>
          w.id === iconId ? { ...w, zIndex: topZ + 1 } : w
        );
      }
      const offset = prev.length * 30;
      setTopZ((z) => z + 1);
      return [
        ...prev,
        {
          id: iconId,
          zIndex: topZ + 1,
          position: {
            x: 120 + offset,
            y: 60 + offset,
          },
        },
      ];
    });
  }, [topZ]);

  const closeWindow = useCallback((iconId) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== iconId));
  }, []);

  const focusWindow = useCallback((iconId) => {
    setTopZ((z) => {
      const newZ = z + 1;
      setOpenWindows((prev) =>
        prev.map((w) => (w.id === iconId ? { ...w, zIndex: newZ } : w))
      );
      return newZ;
    });
  }, []);

  return (
    <main className="macos-root">
      <AnimatePresence mode="wait">
        {!booted && <BootScreen key="boot" onComplete={handleBoot} />}
      </AnimatePresence>

      {booted && (
        <motion.div
          className="desktop-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <MenuBar />

          <div className="desktop">
            <div className="desktop-background">
              <div className="bg-layer gradient" />
              <div className="bg-layer logo" />
              <div className="bg-layer noise" />
              <div className="bg-layer pattern" />
            </div>
            <div className="desktop-icons-grid">
              {DESKTOP_ICONS.filter((icon) => ["about", "activities"].includes(icon.id)).map((icon) => (
                <DesktopIcon
                  key={icon.id}
                  icon={icon}
                  onClick={() => openWindow(icon.id)}
                />
              ))}
            </div>

            <AnimatePresence>
              {openWindows.map((w) => {
                const icon = DESKTOP_ICONS.find((i) => i.id === w.id);
                if (!icon) return null;
                return (
                  <Window
                    key={w.id}
                    icon={icon}
                    zIndex={w.zIndex}
                    position={w.position}
                    onClose={() => closeWindow(w.id)}
                    onFocus={() => focusWindow(w.id)}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          <Dock onItemClick={openWindow} openWindows={openWindows} />
        </motion.div>
      )}
    </main>
  );
}