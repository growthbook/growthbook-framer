import { useState, useRef, useEffect } from "react";
import { Info } from "./Icons";

type TooltipAlignment = "left" | "right" | "center";

export function Tooltip({
  children,
  id,
  icon,
  clickHandler,
  disabled,
  right,
}: {
  children: React.ReactNode;
  id: string;
  icon?: React.ReactNode;
  clickHandler?: () => void;
  disabled?: boolean;
  right?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [tooltipState, setTooltipState] = useState({
    position: { top: 0, left: 0 },
    alignment: "left" as TooltipAlignment,
  });

  const iconRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && iconRef.current && contentRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const mainRectWidth = 320;
      const margin = 10;

      const isLeft = iconRect.left - margin + contentRect.width < mainRectWidth;
      const isRight = iconRect.right - margin - contentRect.width > 0;

      let top, left;
      let alignment: TooltipAlignment;

      if (isLeft) {
        top = iconRect.top - contentRect.height - 6;
        left = iconRect.left - margin;
        alignment = "left";
      } else if (isRight) {
        top = iconRect.top - contentRect.height - 6;
        left = iconRect.right - contentRect.width + margin;
        alignment = "right";
      } else {
        top = iconRect.top - contentRect.height - 6;
        left = iconRect.left + iconRect.width / 2 - contentRect.width / 2;
        alignment = "center";
      }

      setTooltipState({
        position: { top, left },
        alignment,
      });
    }
  }, [visible]);

  return (
    <div className="gb-tooltip-container">
      <span
        ref={iconRef}
        className="gb-tooltip-icon"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setTimeout(() => setVisible(false), 100)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        {...(clickHandler ? { onClick: clickHandler } : {})}
        {...(clickHandler ? { role: "button" } : {})}
        {...(disabled ? { disabled: true } : {})}
        style={clickHandler ? { cursor: "pointer" } : undefined}
        tabIndex={0}
      >
        {icon || <Info />}
      </span>
      {visible && (
        <div
          ref={contentRef}
          className={`gb-tooltip-content ${
            right ? "gb-tooltip-content-right" : ""
          }`}
          data-position={tooltipState.alignment}
          id={id}
          style={{
            position: "fixed",
            top: `${tooltipState.position.top}px`,
            left: `${tooltipState.position.left}px`,
          }}
        >
          <p>{children}</p>
        </div>
      )}
    </div>
  );
}
