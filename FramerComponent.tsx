import { addPropertyControls, ControlType, RenderTarget } from "framer";
import { useEffect, useState } from "react";
import React from "react";
import { GrowthBook as GrowthBookSDK } from "@growthbook/growthbook";

// Extend Window interface to include GrowthBook types
declare global {
  interface Window {
    growthbook_queue?: ((gb: GrowthBookSDK) => void)[];
    _growthbook?: GrowthBookSDK;
  }
}

interface Props {
  flagKey?: string;
  variants?: React.ReactNode[];
  variantCount: number;
}

const FlaskIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z"></path>
  </svg>
);

/**
 
 */
export default function GrowthBook(props: Props) {
  const [variant, setVariant] = useState<number>(0);
  const isCanvas = RenderTarget.current() === RenderTarget.canvas;
  const isThumbnail = RenderTarget.current() === RenderTarget.thumbnail;

  useEffect(() => {
    if (isCanvas || isThumbnail || !props.flagKey) return;

    // Update variant whenever GrowthBook instance or data changes
    const updateVariant = () => {
      if (window._growthbook) {
        setVariant(window._growthbook.getFeatureValue(props.flagKey!, 0));
      }
    };

    // Initial setup
    if (window._growthbook) {
      updateVariant();
    }

    // Set up a queue to handle GrowthBook initialization
    window.growthbook_queue = window.growthbook_queue || [];
    window.growthbook_queue.push(updateVariant);

    // Listen for feature flag updates
    document.addEventListener("growthbookdata", updateVariant);

    return () => {
      document.removeEventListener("growthbookdata", updateVariant);
    };
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
    if (props.variants?.length) {
      return props.variants[0];
    }

    // Empty state with instructions
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100px",
          color: "var(--framer-color-text-tertiary)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              margin: "12px 0",
              justifyContent: "center",
            }}
          >
            {Array.from({ length: props.variantCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: "var(--framer-fresco-panelBackground-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              ></div>
            ))}
          </div>
          <p>
            Add {props.variantCount} variants for <code>{props.flagKey}</code>
          </p>
        </div>
      </div>
    );
  }

  // Runtime view - return null if GrowthBook isn't ready
  if (!window._growthbook) {
    return null;
  }

  // Runtime view - render the appropriate variant
  const { variants = [] } = props;
  if (!variants.length || !props.flagKey) {
    return null;
  }

  return variants[variant] || variants[0];
}

// Property Controls for Framer UI
addPropertyControls(GrowthBook, {
  flagKey: {
    type: ControlType.String,
    title: "Feature Flag",
  },
  variants: {
    type: ControlType.Array,
    control: {
      type: ControlType.ComponentInstance,
    },
    title: "Variants",
    description: "Add components for each variant",
  },
  variantCount: {
    type: ControlType.Number,
    hidden() {
      return true;
    },
  },
});
