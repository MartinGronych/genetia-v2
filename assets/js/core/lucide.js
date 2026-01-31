// assets/js/core/lucide.js
import {
  createIcons,

  // social
  Linkedin,
  Instagram,
  Github,
  Twitter,
  Youtube,
  Facebook,

  // contact
  Mail,
  Phone,
  MapPin,

  // certifications / badges
  BadgeCheck,
  Shield,
  ShieldCheck,
  Award,
  PackageCheck,

  // ui
  ChevronRight,

  // optional
  Bookmark
} from "lucide";

/**
 * Lucide init (selected icons only)
 * - DO NOT manually remap icon names. Lucide derives data-lucide names from exports.
 * - safe to call multiple times
 */
export function initLucide(root = document) {
  try {
    createIcons({
      icons: {
        Linkedin,
        Instagram,
        Github,
        Twitter,
        Youtube,
        Facebook,

        Mail,
        Phone,
        MapPin,

        BadgeCheck,
        Shield,
        ShieldCheck,
        Award,
        PackageCheck,

        ChevronRight,
        Bookmark
      },
      attrs: {
        class: "lucide-icon",
        "aria-hidden": "true",
        focusable: "false"
      },
      root
    });
  } catch (err) {
    console.error("[Genetia][lucide] init failed", err);
  }
}
