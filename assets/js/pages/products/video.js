// assets/js/pages/products/video.js

/**
 * Helper: bezpečné pushování do dataLayer
 */
function pushDataLayer(eventData) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
}

function getFocusable(root) {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
}

export function initVideoModal() {
  try {
    const openers = Array.from(document.querySelectorAll("[data-video-modal-open]"));
    const modal = document.getElementById("videoModal");
    if (!modal) return;

    const dialog = modal.querySelector(".modal__dialog");
    const overlay = modal.querySelector(".modal__overlay");
    const closers = Array.from(modal.querySelectorAll("[data-video-modal-close]"));
    const player = document.getElementById("videoModalPlayer");

    let lastActive = null;

    // ✅ Video tracking state
    let videoTracking = {
      started: false,
      progress: {
        25: false,
        50: false,
        75: false,
        100: false,
      },
    };

    const setOpenState = (isOpen) => {
      modal.dataset.open = isOpen ? "true" : "false";
      modal.setAttribute("aria-hidden", isOpen ? "false" : "true");

      // lock body scroll while open
      document.body.style.overflow = isOpen ? "hidden" : "";

      if (!player) return;
      if (isOpen) {
        player.muted = true;
      } else {
        try {
          player.pause();
          player.currentTime = 0;
        } catch (_) {}
      }
    };

    const open = (triggerEl) => {
      lastActive = triggerEl || document.activeElement;
      setOpenState(true);

      setTimeout(() => {
        if (dialog) dialog.focus();
      }, 0);
    };

    const close = () => {
      setOpenState(false);

      if (lastActive && typeof lastActive.focus === "function") {
        setTimeout(() => lastActive.focus(), 0);
      }
    };

    // Openers
    openers.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        open(el);
      });
    });

    // Closers + overlay click
    closers.forEach((el) => el.addEventListener("click", close));
    if (overlay) overlay.addEventListener("click", close);

    // Key handling + focus trap
    document.addEventListener("keydown", (e) => {
      if (modal.getAttribute("aria-hidden") === "true") return;

      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key !== "Tab") return;

      const focusables = getFocusable(dialog);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // ========================================
    // ✅ GA4 VIDEO TRACKING
    // ========================================
    if (player) {
      const getVideoData = () => ({
        video_title: player.getAttribute("data-video-title") || "Genetia Product Video",
        video_url: player.currentSrc || player.src || "unknown",
        video_duration: Math.round(player.duration) || 0,
      });

      // Reset tracking state když se video restartuje
      player.addEventListener("loadedmetadata", () => {
        videoTracking = {
          started: false,
          progress: {
            25: false,
            50: false,
            75: false,
            100: false,
          },
        };
      });

      // Video start (první play)
      player.addEventListener("play", () => {
        if (!videoTracking.started) {
          videoTracking.started = true;

          pushDataLayer({
            event: "video_start",
            ...getVideoData(),
            video_current_time: Math.round(player.currentTime),
          });
        } else {
          // Resume po pause
          pushDataLayer({
            event: "video_play",
            ...getVideoData(),
            video_current_time: Math.round(player.currentTime),
          });
        }
      });

      // Video pause
      player.addEventListener("pause", () => {
        // Ignore pause když video skončilo
        if (player.currentTime === player.duration) return;

        pushDataLayer({
          event: "video_pause",
          ...getVideoData(),
          video_current_time: Math.round(player.currentTime),
          video_percent: Math.round((player.currentTime / player.duration) * 100),
        });
      });

      // Video progress milestones
      player.addEventListener("timeupdate", () => {
        if (!player.duration) return;

        const percent = (player.currentTime / player.duration) * 100;

        // 25%
        if (percent >= 25 && !videoTracking.progress[25]) {
          videoTracking.progress[25] = true;
          pushDataLayer({
            event: "video_progress",
            ...getVideoData(),
            video_percent: 25,
          });
        }

        // 50%
        if (percent >= 50 && !videoTracking.progress[50]) {
          videoTracking.progress[50] = true;
          pushDataLayer({
            event: "video_progress",
            ...getVideoData(),
            video_percent: 50,
          });
        }

        // 75%
        if (percent >= 75 && !videoTracking.progress[75]) {
          videoTracking.progress[75] = true;
          pushDataLayer({
            event: "video_progress",
            ...getVideoData(),
            video_percent: 75,
          });
        }
      });

      // Video complete (100%)
      player.addEventListener("ended", () => {
        if (!videoTracking.progress[100]) {
          videoTracking.progress[100] = true;

          pushDataLayer({
            event: "video_complete",
            ...getVideoData(),
            video_percent: 100,
          });
        }
      });
    }
  } catch (err) {
    // error boundary style: nesmí shodit stránku
    console.error("GENETIA video modal init failed:", err);
  }
}