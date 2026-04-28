"use client";

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useRef,
} from "react";
import { cn } from "@/lib/utils";

const HOVER_EASE_DURATION_MS = 450;
const MIN_REPEAT = 2;

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: ReactNode;
  vertical?: boolean;
  repeat?: number;
  speed?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  speed = 40,
  style,
  ...props
}: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const segmentSizeRef = useRef(0);
  const currentVelocityRef = useRef(0);
  const hoverActiveRef = useRef(false);
  const copies = Array.from(
    { length: Math.max(repeat, MIN_REPEAT) },
    (_, index) => `marquee-copy-${index + 1}`,
  );

  const applyTransform = useEffectEvent(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.style.transform = vertical
      ? `translate3d(0, ${positionRef.current}px, 0)`
      : `translate3d(${positionRef.current}px, 0, 0)`;
  });

  const stopAnimationLoop = useEffectEvent(() => {
    previousTimeRef.current = null;

    if (frameRef.current === null) {
      return;
    }

    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  });

  const getBaseVelocity = useEffectEvent(() => {
    const segmentSize = segmentSizeRef.current;

    if (!segmentSize || speed <= 0) {
      return 0;
    }

    const pixelsPerMs = segmentSize / (speed * 1000);

    return reverse ? pixelsPerMs : -pixelsPerMs;
  });

  const measureSegment = useEffectEvent(() => {
    const track = trackRef.current;
    const firstCopy = firstCopyRef.current;

    if (!track || !firstCopy) {
      return;
    }

    const computedStyle = getComputedStyle(track);
    const gapValue = vertical
      ? computedStyle.rowGap || computedStyle.gap
      : computedStyle.columnGap || computedStyle.gap;
    const gap = Number.parseFloat(gapValue) || 0;
    const segmentSize =
      (vertical ? firstCopy.offsetHeight : firstCopy.offsetWidth) + gap;

    if (!segmentSize) {
      return;
    }

    segmentSizeRef.current = segmentSize;

    if (reverse) {
      positionRef.current =
        positionRef.current <= -segmentSize || positionRef.current > 0
          ? -segmentSize
          : positionRef.current;
    } else {
      positionRef.current =
        positionRef.current <= -segmentSize || positionRef.current > 0
          ? 0
          : positionRef.current;
    }

    currentVelocityRef.current =
      hoverActiveRef.current && pauseOnHover ? 0 : getBaseVelocity();

    applyTransform();
  });

  const startAnimationLoop = useEffectEvent(() => {
    stopAnimationLoop();

    const tick = (now: number) => {
      const previousTime = previousTimeRef.current;
      previousTimeRef.current = now;

      if (previousTime === null) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - previousTime;
      const segmentSize = segmentSizeRef.current;

      if (!segmentSize || elapsed <= 0) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const targetVelocity =
        hoverActiveRef.current && pauseOnHover ? 0 : getBaseVelocity();
      const easeFactor = 1 - Math.exp(-elapsed / HOVER_EASE_DURATION_MS);
      let nextVelocity =
        currentVelocityRef.current +
        (targetVelocity - currentVelocityRef.current) * easeFactor;

      if (Math.abs(targetVelocity - nextVelocity) < 0.001) {
        nextVelocity = targetVelocity;
      }

      currentVelocityRef.current = nextVelocity;
      positionRef.current += nextVelocity * elapsed;

      while (positionRef.current <= -segmentSize) {
        positionRef.current += segmentSize;
      }

      while (positionRef.current > 0) {
        positionRef.current -= segmentSize;
      }

      applyTransform();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  });

  useEffect(() => {
    measureSegment();

    const root = rootRef.current;
    const firstCopy = firstCopyRef.current;

    if (!root || !firstCopy || typeof ResizeObserver === "undefined") {
      startAnimationLoop();

      return () => {
        stopAnimationLoop();
      };
    }

    const observer = new ResizeObserver(() => {
      measureSegment();
    });

    observer.observe(root);
    observer.observe(firstCopy);
    startAnimationLoop();

    return () => {
      observer.disconnect();
      stopAnimationLoop();
    };
  }, [measureSegment, startAnimationLoop, stopAnimationLoop]);

  useEffect(() => {
    const root = rootRef.current;

    hoverActiveRef.current = false;
    measureSegment();

    if (!root || !pauseOnHover) {
      return;
    }

    const handlePointerEnter = () => {
      hoverActiveRef.current = true;
    };

    const handlePointerLeave = () => {
      hoverActiveRef.current = false;
    };

    root.addEventListener("pointerenter", handlePointerEnter);
    root.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      root.removeEventListener("pointerenter", handlePointerEnter);
      root.removeEventListener("pointerleave", handlePointerLeave);
      hoverActiveRef.current = false;
    };
  }, [measureSegment, pauseOnHover]);

  return (
    <div
      ref={rootRef}
      {...props}
      style={
        {
          ...style,
          "--duration": `${speed}s`,
        } as CSSProperties
      }
      className={cn(
        "overflow-hidden p-2 [--gap:1rem]",
        {
          "touch-pan-y": !vertical,
          "touch-pan-x": vertical,
        },
        className,
      )}
    >
      <div
        ref={trackRef}
        className={cn("flex will-change-transform [gap-(--gap)]", {
          "flex-row": !vertical,
          "flex-col": vertical,
        })}
      >
        {copies.map((copyKey, index) => (
          <div
            key={copyKey}
            ref={index === 0 ? firstCopyRef : undefined}
            className={cn("flex shrink-0 justify-around [gap-(--gap)]", {
              "flex-row": !vertical,
              "flex-col": vertical,
            })}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
