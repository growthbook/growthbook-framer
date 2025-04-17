import { framer } from "framer-plugin";
import { ConfigType } from "./App";
import { Feature } from "./ConnectExperiments";

interface AddComponentProps {
  config: ConfigType;
  feature: Feature<unknown>;
}

export function AddComponent({ config, feature }: AddComponentProps) {
  const addComponent = async () => {
    await framer.addComponentInstance({
      url: "https://framer.com/m/GrowthBook-FBIs.js",
      attributes: {
        controls: {
          apiHost: config.apiHost,
          clientKey: config.clientKey,
          flagKey: feature.name,
          variantCount: feature.variationCount || 1,
        },
      },
    });
    await framer.closePlugin("Component added successfully", {
      variant: "success",
    });
  };

  return (
    <button onClick={addComponent} className="framer-button-primary">
      Add to Canvas
    </button>
  );
}
