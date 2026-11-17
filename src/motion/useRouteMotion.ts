import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type MotionConditions = {
  desktop?: boolean;
  reducedMotion?: boolean;
};

export interface RouteMotionOptions {
  dependencies?: unknown[];
  enabled?: boolean;
}

const MOTION_TARGET_SELECTOR =
  '[data-motion~="reveal"], [data-motion-word]';

const readNumber = (
  element: HTMLElement,
  key: keyof DOMStringMap,
  fallback: number,
  min: number,
  max: number,
) => {
  const rawValue = element.dataset[key];
  if (rawValue === undefined || rawValue.trim() === "") return fallback;

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};

const belongsToSection = (
  element: HTMLElement,
  section: HTMLElement,
  fallbackRoot: HTMLElement,
) => {
  const owner = element.closest<HTMLElement>("[data-motion-section]");
  return owner ? owner === section : section === fallbackRoot;
};

const ownedTargets = (
  section: HTMLElement,
  selector: string,
  fallbackRoot: HTMLElement,
) =>
  gsap.utils
    .toArray<HTMLElement>(selector, section)
    .filter((element) => belongsToSection(element, section, fallbackRoot));

const showMotionContent = (root: HTMLElement) => {
  const targets = gsap.utils.toArray<HTMLElement>(MOTION_TARGET_SELECTOR, root);

  if (root.matches(MOTION_TARGET_SELECTOR)) {
    targets.unshift(root);
  }

  gsap.set(targets, {
    clearProps: "opacity,visibility,transform,willChange",
  });

  targets.forEach((target) => {
    target.dataset.motionState = "visible";
  });
};

/**
 * Route-scoped motion. Importing this hook is what loads GSAP for that lazy route.
 *
 * Contract:
 * - `data-motion-section` creates one timeline and one ScrollTrigger.
 * - `data-motion="reveal"` items reveal together with a stagger.
 * - `data-motion-pin` pins on desktop (`="all"` also pins on small screens).
 * - `data-motion-scrub="0.8"` scrubs descendants marked `data-motion-word`.
 * - Optional section tuning: `data-motion-y`, `-stagger`, `-duration`,
 *   `-start`, `-end`, `-once` and `-pin-spacing`.
 */
export const useRouteMotion = <T extends HTMLElement = HTMLElement>({
  dependencies = [],
  enabled = true,
}: RouteMotionOptions = {}) => {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return undefined;

      root.dataset.motionReady = "true";
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 900px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop = true, reducedMotion = false } =
            (context.conditions ?? {}) as MotionConditions;

          if (!enabled || reducedMotion) {
            showMotionContent(root);
            root.dataset.motionMode = "static";
            return undefined;
          }

          root.dataset.motionMode = "animated";
          const markedSections = gsap.utils.toArray<HTMLElement>(
            "[data-motion-section]",
            root,
          );
          const sections = root.matches("[data-motion-section]")
            ? [root, ...markedSections.filter((section) => section !== root)]
            : markedSections;

          if (sections.length === 0 && root.querySelector(MOTION_TARGET_SELECTOR)) {
            sections.push(root);
          }

          sections.forEach((section) => {
            const revealTargets = ownedTargets(
              section,
              '[data-motion~="reveal"]',
              root,
            );
            const scrubHost = section.matches("[data-motion-scrub]")
              ? section
              : ownedTargets(section, "[data-motion-scrub]", root)[0];
            const wordTargets = scrubHost
              ? gsap.utils
                  .toArray<HTMLElement>("[data-motion-word]", scrubHost)
                  .filter((element) => belongsToSection(element, section, root))
              : [];
            const pinTarget = section.matches("[data-motion-pin]")
              ? section
              : ownedTargets(section, "[data-motion-pin]", root)[0];
            const pinOnCurrentViewport = Boolean(
              pinTarget &&
                (desktop || pinTarget.dataset.motionPin?.toLowerCase() === "all"),
            );
            const usesScrub = Boolean(scrubHost);
            const scrubAmount = scrubHost
              ? readNumber(scrubHost, "motionScrub", 0.8, 0.1, 4)
              : false;
            const sectionOffset = readNumber(section, "motionY", 28, -160, 160);
            const stagger = readNumber(section, "motionStagger", 0.075, 0, 0.4);
            const duration = readNumber(section, "motionDuration", 0.76, 0.1, 3);
            const once = section.dataset.motionOnce !== "false" && !usesScrub && !pinTarget;
            const defaultEnd = usesScrub || pinOnCurrentViewport
              ? `+=${Math.max(640, wordTargets.length * 88)}`
              : "bottom 18%";

            revealTargets.forEach((target) => {
              target.dataset.motionState = "pending";
            });

            const timeline = gsap.timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: {
                anticipatePin: pinOnCurrentViewport ? 1 : 0,
                end: section.dataset.motionEnd || defaultEnd,
                invalidateOnRefresh: true,
                once,
                pin: pinOnCurrentViewport ? pinTarget : false,
                pinSpacing: section.dataset.motionPinSpacing !== "false",
                scrub: usesScrub ? scrubAmount : false,
                start: section.dataset.motionStart || "top 84%",
                toggleActions: usesScrub ? undefined : "play none none reverse",
                trigger: section,
                onEnter: () => {
                  section.dataset.motionState = "active";
                },
                onLeave: () => {
                  section.dataset.motionState = "visible";
                },
                onLeaveBack: () => {
                  section.dataset.motionState = "pending";
                },
              },
            });

            if (revealTargets.length > 0) {
              timeline.fromTo(
                revealTargets,
                {
                  autoAlpha: 0,
                  y: (_, target: HTMLElement) =>
                    readNumber(target, "motionY", sectionOffset, -160, 160),
                },
                {
                  autoAlpha: 1,
                  duration,
                  stagger,
                  y: 0,
                  onStart: () => {
                    gsap.set(revealTargets, { willChange: "transform,opacity" });
                  },
                  onComplete: () => {
                    revealTargets.forEach((target) => {
                      target.dataset.motionState = "visible";
                    });
                    gsap.set(revealTargets, { clearProps: "willChange" });
                  },
                },
                0,
              );
            }

            if (wordTargets.length > 0) {
              timeline.fromTo(
                wordTargets,
                { autoAlpha: 0.16, yPercent: 22 },
                {
                  autoAlpha: 1,
                  duration: 1,
                  ease: "none",
                  stagger: 0.16,
                  yPercent: 0,
                },
                revealTargets.length > 0 ? ">-0.2" : 0,
              );
            }

            if (timeline.duration() === 0) {
              timeline.to(section, {
                "--sonus-motion-progress": 1,
                duration: 1,
                ease: "none",
              });
            }
          });

          return () => {
            showMotionContent(root);
          };
        },
      );

      return () => {
        media.revert();
        showMotionContent(root);
        root.removeAttribute("data-motion-mode");
        root.removeAttribute("data-motion-ready");
      };
    },
    {
      dependencies: [enabled, ...dependencies],
      revertOnUpdate: true,
      scope,
    },
  );

  return scope;
};

export default useRouteMotion;
