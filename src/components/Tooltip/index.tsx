import { ReactNode, useEffect, useRef, useState } from "react";
import { Popper, PopperProps } from "react-popper";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: PopperProps<unknown>["placement"];
  delay?: number;
}
export default function Tooltip(props: TooltipProps) {
  const [refElement, setRefElement] = useState<HTMLElement | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function handleMouseEnter() {
      if (props.delay) {
        timeoutRef.current = window.setTimeout(() => {
          setShowTooltip(true);
        }, props.delay);
      } else {
        setShowTooltip(true);
      }
    }

    function handleMouseLeave() {
      if (props.delay) {
        window.clearTimeout(timeoutRef.current ?? undefined);
      }
      setShowTooltip(false);
    }

    function handleScroll() {
      setShowTooltip(false);
    }

    if (refElement) {
      refElement.addEventListener("mouseenter", handleMouseEnter);
      refElement.addEventListener("mouseleave", handleMouseLeave);
      refElement.addEventListener("click", handleMouseLeave);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (refElement) {
        refElement.removeEventListener("mouseenter", handleMouseEnter);
        refElement.removeEventListener("mouseleave", handleMouseLeave);
        refElement.removeEventListener("click", handleMouseLeave);
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [refElement, props.delay]);

  return (
    <>
      <div ref={setRefElement}>{props.children}</div>
      <Popper
        placement={props.placement ?? "top"}
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 10],
            },
          },
          {
            name: "hide",
            enabled: true,
            phase: "main",
            requires: ["computeStyles"],
            fn: ({ state }) => {
              const { height, width, x, y } = state.rects.reference;
              const { innerHeight, innerWidth } = window;
              state.styles.popper = {
                ...state.styles.popper,
                visibility: height + y > innerHeight || width + x > innerWidth ? "hidden" : "visible",
              };
            },
          },
        ]}
        referenceElement={refElement as HTMLElement}
        strategy='absolute'
      >
        {({ ref, style, placement }) => (
          <div
            ref={ref}
            style={style}
            data-placement={placement}
            className={`bg-primary-800 max-w-sm text-primary-50 text-sm font-medium px-2 py-1 rounded-md shadow-md transition-smooth ${
              showTooltip ? `opacity-100 pointer-events-auto` : "opacity-0 pointer-events-none"
            }`}
          >
            {props.content}
          </div>
        )}
      </Popper>
    </>
  );
}
