import { GrowthBook as GrowthBookSDK } from "@growthbook/growthbook";
import {
  addPropertyControls,
  ControlType,
  isBrowser,
  RenderTarget,
} from "framer";
import React, { useEffect, useState } from "react";

// Extend Window interface to include GrowthBook types
declare global {
  interface Window {
    growthbook_queue?: ((gb: GrowthBookSDK) => void)[];
    _growthbook?: GrowthBookSDK;
  }
}

interface Props {
  flagKey: string;
  variants: React.ReactNode[];
  variantCount: number;
  control: string;
  style?: React.CSSProperties;
}

const FlaskIcon = ({ width = 32, height = 32 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z"></path>
  </svg>
);

const Badge = ({ current, total }: { current: number; total: number }) => {
  return (
    <div
      style={{
        backgroundColor: "#2400B7A8",
        color: "#fff",
        padding: "2px 6px",
        borderRadius: "3px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        position: "absolute",
        top: 0,
        right: 0,
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: "500",
      }}
    >
      <FlaskIcon width={12} height={12} />
      {current} / {total}
    </div>
  );
};

/**
 * @framerDisableUnlink
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function GrowthBook(props: Props) {
  const [variant, setVariant] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const controlAndVariants = [...props.control, ...props.variants];
  const isCanvas = RenderTarget.current() === RenderTarget.canvas;
  const isThumbnail = RenderTarget.current() === RenderTarget.thumbnail;

  useEffect(() => {
    if (!isCanvas && !isThumbnail && props.flagKey && isBrowser) {
      setIsMounted(true);

      // Check if we're in preview mode
      const isPreview = window.location.hostname.includes("framercanvas.com");
      if (isPreview) {
        setIsLoaded(true);
        return;
      }

      const updateVariant = () => {
        if (window._growthbook) {
          setVariant(window._growthbook.getFeatureValue(props.flagKey!, 0));
          setIsLoaded(true);
        }
      };

      // Initial setup
      if (window._growthbook) {
        updateVariant();
      }

      window.growthbook_queue = window.growthbook_queue || [];
      window.growthbook_queue.push(updateVariant);

      document.addEventListener("growthbookdata", updateVariant);

      return () => {
        document.removeEventListener("growthbookdata", updateVariant);
      };
    }
  }, [props.flagKey, isCanvas, isThumbnail]);

  // Show simplified version in thumbnail
  if (isThumbnail) {
    return (
      <div style={{ padding: 8 }}>
        <FlaskIcon />
      </div>
    );
  }

  // Show design-time states in canvas
  if (isCanvas) {
    // If we have variants, just show the first one
    if (props.control.length) {
      return (
        <div style={{ position: "relative", padding: 12 }}>
          {props.control[0]}
          <Badge
            current={props.control.length + props.variants.length}
            total={props.variantCount}
          />
        </div>
      );
    }

    // Empty state with instructions
    return (
      <div
        style={{
          width: "360px",
          padding: "16px",
          borderRadius: "6px",
          border: "1px dashed #00062E33",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          backgroundColor: "#F0F0F3",
          color: "#000",
        }}
      >
        <p>
          <strong>
            {props.control.length + props.variants.length} of{" "}
            {props.variantCount} components connected
          </strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <p>
            <strong>1. Create</strong> a Framer component for each variation in
            your GrowthBook Feature Flag experiment.
          </p>
          <p>
            <strong>2. Connect</strong> the component for your Control variation
            by dragging the handle on this container to your component.
          </p>
          <p>
            <strong>3. Connect other components</strong> for each variation in
            the order they should appear. Rearrange the order in the sidebar
            panel.
          </p>
        </div>
      </div>
    );
  }

  // Runtime view
  if (!controlAndVariants.length || !props.flagKey) {
    return null;
  }

  // TODO? Add support for null states/kill switches?
  const activeVariant =
    !isMounted || !window._growthbook
      ? controlAndVariants[0]
      : controlAndVariants[variant] || controlAndVariants[0];

  if (!activeVariant) return null;

  // Render the variant directly without a wrapper div so it sits in Framer's
  // layout tree and retains access to page-level breakpoints / responsive props.
  if (React.isValidElement(activeVariant)) {
    return React.cloneElement(activeVariant as React.ReactElement<any>, {
      style: {
        ...(activeVariant as React.ReactElement<any>).props?.style,
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.2s ease-in",
        ...props.style,
      },
    });
  }

  return activeVariant as React.ReactElement;
}

// Property Controls for Framer UI
addPropertyControls(GrowthBook, {
  flagKey: {
    type: ControlType.String,
    title: "Feature",
  },
  control: {
    type: ControlType.ComponentInstance,
    title: "Control",
  },
  variants: {
    type: ControlType.Array,
    control: {
      type: ControlType.ComponentInstance,
    },
    title: "Variants",
    description: "Connect a component for each experiment variation.",
  },
  variantCount: {
    type: ControlType.Number,
    hidden() {
      return true;
    },
  },
});
