import { framer } from "framer-plugin";
import { ConfigType } from "./App";
import { Feature } from "./GetFlags";

interface AddComponentProps {
  config: ConfigType;
  feature: Feature<unknown>;
}

export function AddComponent({ config, feature }: AddComponentProps) {
  console.log(`${config.apiHost}/features/${feature.name}`);
  const addComponent = async () => {
    await framer.addComponentInstance({
      url: "https://framer.com/m/GrowthBook-FBIs.js",
      attributes: {
        controls: {
          apiHost: config.apiHost,
          clientKey: config.clientKey,
          flagKey: feature.name,
        },
      },
    });
  };

  return (
    <div>
      <button onClick={addComponent} className="framer-button-primary">
        Add Component
      </button>
    </div>
  );
}
