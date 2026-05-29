import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Event, EventCardWithPosition } from "@/types/event";
import { EventCardBody } from "./EventCardBody";
import { useEventCardGeometry } from "./useEventCardGeometry";

const EventCard: React.FC<
  EventCardWithPosition & {
    onClick?: () => void;
    weekStartDate: Date;
    selectedEvent?: Event | null;
    onEditClick?: () => void;
    onCopyClick?: () => void;
  }
> = ({
  event,
  positionY,
  userColor,
  updateEvent,
  deleteEvent,
  containerWidth,
  workDayHours,
  visibleDays,
  workDayStartHour,
  onHeightChange,
  onClick,
  onEditClick,
  onCopyClick,
  projects = [],
  weekStartDate,
  selectedEvent,
}) => {
  const isClickUpVacationEvent = event.project === "ClickUp: Отпуска";
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [animatedPositionY, setAnimatedPositionY] = useState<number>(positionY);
  const prevPositionYRef = useRef<number | null>(null);
  const prevPriorityRef = useRef<string | undefined>(event.priority);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rndRef = useRef<React.ElementRef<typeof Rnd> | null>(null);
  const prevEventStartRef = useRef<number>(event.start.getTime());
  const prevEventEndRef = useRef<number>(event.end.getTime());
  const draggedXRef = useRef<number | null>(null);
  const isUserInteractionRef = useRef<boolean>(false);
  const lastCalculatedXRef = useRef<number>(0);
  const isMobile = useIsMobile();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const wasDraggingRef = useRef<boolean>(false);
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const clickHandledRef = useRef<boolean>(false);

  const {
    width,
    x: baseX,
    calculatedX,
    dayWidth,
    clampIntervalToWeek,
    clampPosition,
    getDateFromPosition,
  } = useEventCardGeometry({
    event,
    containerWidth,
    workDayHours,
    visibleDays,
    workDayStartHour,
    weekStartDate,
    isMobile,
  });

  const x = isMobile
    ? baseX
    : draggedXRef.current !== null
    ? draggedXRef.current
    : baseX;

  useEffect(() => {
    if (lastCalculatedXRef.current === 0) {
      lastCalculatedXRef.current = calculatedX;
    }
  }, [calculatedX]);

  useEffect(() => {
    if (ref.current) {
      onHeightChange?.(event.id, ref.current.offsetHeight);
    }
  }, [onHeightChange, event.id]);

  useEffect(() => {
    if (prevPositionYRef.current === null) {
      prevPositionYRef.current = positionY;
      prevPriorityRef.current = event.priority;
      setAnimatedPositionY(positionY);
      return;
    }

    const positionChanged = prevPositionYRef.current !== positionY;
    const shouldTriggerAnimation =
      positionChanged && !isDragging && !isResizing;

    if (shouldTriggerAnimation) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (endAnimationTimeoutRef.current) {
        clearTimeout(endAnimationTimeoutRef.current);
      }

      const targetPositionY = positionY;
      const targetPriority = event.priority;

      animationTimeoutRef.current = setTimeout(() => {
        setShouldAnimate(true);

        requestAnimationFrame(() => {
          setAnimatedPositionY(targetPositionY);
        });

        endAnimationTimeoutRef.current = setTimeout(() => {
          setShouldAnimate(false);
          prevPositionYRef.current = targetPositionY;
          prevPriorityRef.current = targetPriority;
        }, 1200);
      }, 300);

      return () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        if (endAnimationTimeoutRef.current) {
          clearTimeout(endAnimationTimeoutRef.current);
        }
      };
    }
  }, [positionY, event.priority, isDragging, isResizing]);

  const wasResizingRef = useRef(false);

  useEffect(() => {
    if (wasDraggingRef.current && !isDragging) {
      wasDraggingRef.current = false;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimatedPositionY(positionY);
        });
      });
    }

    if (wasResizingRef.current && !isResizing) {
      wasResizingRef.current = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimatedPositionY(positionY);
        });
      });
    } else if (isResizing) {
      wasResizingRef.current = true;
    }
  }, [isDragging, isResizing, positionY]);

  useEffect(() => {
    if (
      !shouldAnimate &&
      !isDragging &&
      !isResizing &&
      prevPositionYRef.current !== null &&
      prevPositionYRef.current === positionY &&
      animatedPositionY !== positionY
    ) {
      setAnimatedPositionY(positionY);
    }
  }, [positionY, shouldAnimate, isDragging, isResizing, animatedPositionY]);

  const currentPositionY =
    isDragging || isResizing ? positionY : animatedPositionY;

  const getGlassmorphismStyle = (gradient?: string) => {
    if (!gradient) return "bg-white/10";
    
    const colorMatch = gradient.match(/from-(\w+)-/);
    if (!colorMatch) return "bg-white/10";
    
    const color = colorMatch[1];
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500/20",
      indigo: "bg-indigo-500/20",
      violet: "bg-violet-500/20",
      purple: "bg-purple-500/20",
      cyan: "bg-cyan-500/20",
      teal: "bg-teal-500/20",
      emerald: "bg-emerald-500/20",
      sky: "bg-sky-500/20",
    };
    
    return colorMap[color] || "bg-blue-500/20";
  };

  useEffect(() => {
    if (isMobile) {
      draggedXRef.current = null;
    }

    if (!isDragging && !isResizing) {
      const currentEventStart = event.start.getTime();
      const currentEventEnd = event.end.getTime();
      const startChanged = prevEventStartRef.current !== currentEventStart;
      const endChanged = prevEventEndRef.current !== currentEventEnd;

      if (startChanged || endChanged) {
        if (!isUserInteractionRef.current && draggedXRef.current !== null) {
          const diff = Math.abs(calculatedX - draggedXRef.current);
          if (diff > 5) {
            draggedXRef.current = null;
          }
        }

        isUserInteractionRef.current = false;
        prevEventStartRef.current = currentEventStart;
        prevEventEndRef.current = currentEventEnd;
        lastCalculatedXRef.current = calculatedX;
      }
    }
  }, [calculatedX, isDragging, isResizing, event.start, event.end, isMobile]);

  return (
    <Rnd
      ref={rndRef}
      position={{ x, y: currentPositionY }}
      size={{ width, height: "auto" }}
      bounds="parent"
      dragAxis="x"
      enableResizing={
        isMobile || isClickUpVacationEvent
          ? {
              left: false,
              right: false,
              top: false,
              bottom: false,
              topLeft: false,
              topRight: false,
              bottomLeft: false,
              bottomRight: false,
            }
          : {
              left: true,
              right: true,
              top: false,
              bottom: false,
              topLeft: false,
              topRight: false,
              bottomLeft: false,
              bottomRight: false,
            }
      }
      disableDragging={isMobile || isClickUpVacationEvent}
      style={{
        transition:
          shouldAnimate && !isDragging && !isResizing
            ? "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
            : isDragging || isResizing
            ? undefined
            : "transform 0s",
      }}
      onDragStart={() => {
        if (isMobile) return;

        setIsDragging(true);
        setShouldAnimate(false);
        isUserInteractionRef.current = true;

        setAnimatedPositionY(positionY);

        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        if (endAnimationTimeoutRef.current) {
          clearTimeout(endAnimationTimeoutRef.current);
        }
      }}
      onDrag={() => {
        if (isMobile) return;

        wasDraggingRef.current = true;
      }}
      onDragStop={(_e, d) => {
        if (isMobile) return;

        const hasMoved = wasDraggingRef.current;

        if (hasMoved) {
          const newX = clampPosition(d.x);
          const newStartRaw = getDateFromPosition(newX);

          const durationMsRaw = event.end.getTime() - event.start.getTime();
          const unclampedEnd = new Date(newStartRaw.getTime() + durationMsRaw);

          const { clampedStart: finalStart, clampedEnd: finalEnd } =
            clampIntervalToWeek(newStartRaw, unclampedEnd);

          draggedXRef.current = newX;
          prevEventStartRef.current = finalStart.getTime();
          prevEventEndRef.current = finalEnd.getTime();

          updateEvent(event.id, { start: finalStart, end: finalEnd });
        } else {
          setTimeout(() => {
            if (!isResizing && !clickHandledRef.current) {
              clickHandledRef.current = true;
              onClick?.();
            }
          }, 10);
        }

        prevPositionYRef.current = positionY;
        setAnimatedPositionY(positionY);

        requestAnimationFrame(() => {
          setIsDragging(false);

          setTimeout(() => {
            isUserInteractionRef.current = false;
            wasDraggingRef.current = false;
          }, 100);
        });
      }}
      onResizeStart={() => {
        if (isMobile) return;

        setIsResizing(true);
        setShouldAnimate(false);
        isUserInteractionRef.current = true;
        wasDraggingRef.current = true;

        setAnimatedPositionY(positionY);

        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        if (endAnimationTimeoutRef.current) {
          clearTimeout(endAnimationTimeoutRef.current);
        }
      }}
      onResize={(_e, direction, _ref, _delta, position) => {
        if (isMobile) return;

        if (typeof direction === "string") {
          draggedXRef.current = position.x;
        }
      }}
      onResizeStop={(_e, direction, ref) => {
        if (isMobile) return;

        const newWidth = parseFloat(ref.style.width);

        if (direction === "left") {
          const newDurationHours = (newWidth / dayWidth) * workDayHours;
          const newStartRaw = new Date(
            event.end.getTime() - newDurationHours * 3600 * 1000
          );

          const { clampedStart: finalStart } = clampIntervalToWeek(
            newStartRaw,
            event.end
          );

          prevEventStartRef.current = finalStart.getTime();

          updateEvent(event.id, { start: finalStart });
        } else if (direction === "right") {
          const newDurationHours = (newWidth / dayWidth) * workDayHours;
          const newEndRaw = new Date(
            event.start.getTime() + newDurationHours * 3600 * 1000
          );

          const { clampedEnd: finalEnd } = clampIntervalToWeek(
            event.start,
            newEndRaw
          );

          prevEventStartRef.current = event.start.getTime();
          prevEventEndRef.current = finalEnd.getTime();

          updateEvent(event.id, { end: finalEnd });
        }

        prevPositionYRef.current = positionY;
        setAnimatedPositionY(positionY);

        requestAnimationFrame(() => {
          setIsResizing(false);

          setTimeout(() => {
            isUserInteractionRef.current = false;
          }, 100);
        });
      }}
      minWidth={20}
      minHeight={60}
      className={`p-1.5 sm:p-1.5 rounded-md text-white flex flex-col justify-between ${
        isMobile || isClickUpVacationEvent ? "cursor-default" : "cursor-move"
      } select-none text-[10px] sm:text-xs touch-manipulation overflow-hidden
        backdrop-blur-xl border border-white/20 ${getGlassmorphismStyle(userColor)}
        ${
          selectedEvent?.id === event.id
            ? "shadow-[0_4px_20px_0_rgba(100,102,241,0.5)] border-indigo-400/50"
            : "shadow-lg"
        }
        ${
          isDragging || isResizing
            ? "shadow-[0px_15px_40px_rgba(0,0,0,0.5)] z-10 border-white/40"
            : ""
        }
        ${
          shouldAnimate && !isDragging && !isResizing
            ? "transition-transform duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            : ""
        }
      `}
    >
      <EventCardBody
        event={event}
        projects={projects}
        positionY={positionY}
        isMobile={isMobile}
        isDragging={isDragging}
        isResizing={isResizing}
        onClick={onClick}
        onEditClick={onEditClick}
        onCopyClick={onCopyClick}
        deleteEvent={deleteEvent}
        prevPositionYRef={prevPositionYRef}
        setAnimatedPositionY={setAnimatedPositionY}
        updateEvent={updateEvent}
        containerRef={ref}
        touchStartRef={touchStartRef}
        mouseDownRef={mouseDownRef}
        clickHandledRef={clickHandledRef}
        wasDraggingRef={wasDraggingRef}
      />
    </Rnd>
  );
};

export default EventCard;
