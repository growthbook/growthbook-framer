import { addPropertyControls, ControlType } from "framer";
import {
  GrowthBook as GB,
  GrowthBookProvider,
  useFeatureValue,
} from "@growthbook/growthbook-react";
import { useEffect, useState, useRef } from "react";
import {
  autoAttributesPlugin,
  thirdPartyTrackingPlugin,
} from "@growthbook/growthbook/plugins";

interface Props {
  apiHost?: string;
  clientKey?: string;
  flagKey?: string;
  variants?: React.ReactNode[];
}

const trackingOptions = {
  additionalCallback: (
    experiment: { key: string },
    result: { key: string }
  ) => {
    console.log("Experiment Viewed", {
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
};

const GbLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M167.309 183.179L512 0C512 0 479.506 26.9984 480.934 85.4405C482.456 147.723 512 170.883 512 170.883L471.497 153.454L154.422 270.686C154.422 270.686 146.724 250.316 146.599 234.96C146.271 197.08 167.309 183.179 167.309 183.179Z"
      fill="url(#paint0_linear_98_108)"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M93.9888 302.928L470.586 172.823C470.586 172.823 438.09 199.821 439.52 258.265C441.043 320.547 470.586 343.706 470.586 343.706L417.974 324.576L79.9531 387.419C79.9531 387.419 73.3977 368.642 73.2781 354.711C72.953 316.828 93.9888 302.928 93.9888 302.928Z"
      fill="url(#paint1_linear_98_108)"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M20.7146 408.439L418.063 341.117C418.063 341.117 385.567 368.116 386.995 426.557C388.52 488.841 418.063 512 418.063 512H23.6814C23.6814 512 0.349653 498.615 0.00373409 458.278C-0.321558 420.396 20.7146 408.439 20.7146 408.439Z"
      fill="url(#paint2_linear_98_108)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_98_108"
        x1="283.61"
        y1="3.28478e-07"
        x2="300.663"
        y2="215.282"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.176783" stop-color="#06B8F4" />
        <stop offset="1" stop-color="#349DCD" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_98_108"
        x1="271.93"
        y1="172.823"
        x2="271.93"
        y2="387.419"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#2076FF" />
        <stop offset="1" stop-color="#024CB5" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_98_108"
        x1="209.031"
        y1="341.117"
        x2="209.031"
        y2="512"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#7B45EA" />
        <stop offset="1" stop-color="#43269A" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 
 */
export default function GrowthBook(props: Props) {
  const [growthbook, setGrowthbook] = useState<GB | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const gbRef = useRef<GB | null>(null);
  useEffect(() => {
    async function initGB() {
      try {
        if (!props.clientKey) {
          setError("Client key is required");
          setIsLoading(false);
          return;
        }

        const gb = new GB({
          apiHost: props.apiHost,
          clientKey: props.clientKey,
          plugins: [
            autoAttributesPlugin(),
            thirdPartyTrackingPlugin(trackingOptions),
          ],
          enableDevMode: true,
        });

        await gb.init({ streaming: true });

        gbRef.current = gb;
        setGrowthbook(gb);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize GrowthBook"
        );
        console.error("GrowthBook initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    initGB();

    return () => {
      if (gbRef.current) {
        gbRef.current.destroy();
        gbRef.current = null;
      }
    };
  }, [props.clientKey, props.apiHost]);

  if (isLoading) {
    return <></>;
  }

  if (error) {
    return (
      <div>
        <div style={{ color: "red", fontSize: 12 }}>{error}</div>
      </div>
    );
  }

  if (!growthbook) {
    return null;
  }
  console.log(growthbook);
  return (
    <GrowthBookProvider growthbook={growthbook}>
      <TestContent {...props} />
    </GrowthBookProvider>
  );
}

interface TestContentProps extends Props {
  flagKey?: string;
  variants?: React.ReactNode[];
}

function TestContent({ flagKey, variants = [] }: TestContentProps) {
  const variant = useFeatureValue<number | null>(flagKey || "", null);
  console.log("🚀 ~ functionTestContent(flagKey,variants ~ variant:", variant);

  if (variant === null) return <></>;

  if (!variants.length) {
    return (
      <div
        style={{
          width: 400,
          height: 225,
          color: "var(--framer-fresco-panelTitle-color)",
          border: "3px dotted currentColor",
          borderRadius: "3px",
          padding: "12px",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <GbLogo />
          <p>Add components for each variant</p>
        </div>
      </div>
    );
  }

  return variants[variant] || variants[0];
}

// Property Controls for Framer UI
addPropertyControls(GrowthBook, {
  clientKey: {
    type: ControlType.String,
    title: "GrowthBook Key",
    hidden() {
      return true;
    },
  },
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
    maxCount: 2,
  },
});
