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
    "--triangle": "",
  });

  const iconRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && iconRef.current && contentRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const mainRectWidth = 320;
      const margin = iconRect.width * 2;
      const triangleWidth = 6;
      const isLeft = iconRect.left - margin + contentRect.width < mainRectWidth;
      const isRight = iconRect.right - margin - contentRect.width > 0;

      const top = iconRect.top - contentRect.height - 6;
      let left, triangle;
      let alignment: TooltipAlignment;

      if (isLeft) {
        left = iconRect.left - margin;
        alignment = "left";
        triangle = `${iconRect.width / 2 + margin - triangleWidth}px`;
      } else if (isRight) {
        left = iconRect.left - contentRect.width + margin / 1.5;
        alignment = "right";
        triangle = `${margin / 1.5 - triangleWidth - iconRect.width / 2}px`;
      } else {
        left = iconRect.left + iconRect.width / 2 - contentRect.width / 2;
        alignment = "center";
        triangle = "";
      }

      setTooltipState({
        position: { top, left },
        alignment,
        "--triangle": triangle,
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
            ["--triangle" as string]: tooltipState["--triangle"],
          }}
        >
          <p>{children}</p>
        </div>
      )}
    </div>
  );
}
