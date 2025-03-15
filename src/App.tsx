import { framer } from "framer-plugin";

import { Config } from "./Config";
import { useEffect, useState } from "react";
import "./App.css";
import { GetFlags } from "./GetFlags";
import { GbLogo } from "./Logo";

export type ConfigType = {
  clientKey?: string | null;
  apiHost?: string | null;
};

framer.showUI({
  position: "center",
  width: 320,
  resizable: true,
});

function parseGrowthBookUrl(url: string | null | undefined) {
  if (url === "https://cdn.growthbook.io") {
    return "https://app.growthbook.io";
  }
  return url; // Need to add field for self-hosted
}

export function App() {
  const [config, updateConfig] = useState<ConfigType>({
    clientKey: "",
    apiHost: "",
  });

  useEffect(() => {
    const getData = async () => {
      const clientKey = await framer.getPluginData("clientKey");
      const apiHost = await framer.getPluginData("apiHost");
      updateConfig({ clientKey, apiHost });
    };

    getData();
  }, []);

  return (
    <main>
      <div className="gb-container gb-intro">
        <GbLogo />
        {!config.clientKey ? (
          <>
            <p className="gb-intro-headline">
              Feature flag and A/B test your content. Update your settings to
              get started.
            </p>
            <p className="gb-intro-text">
              Don't have an account?{" "}
              <a href="https://growthbook.io">Get started.</a>
            </p>
          </>
        ) : (
          <>
            <p className="gb-intro-headline">
              Welcome back! What are you going to A/B test today?
            </p>
            <p className="gb-intro-text">
              <a target="_blank" href={`${parseGrowthBookUrl(config.apiHost)}`}>
                Go to your GrowthBook dashboard.
              </a>
            </p>
          </>
        )}
      </div>

      <Config config={config} updateConfig={updateConfig} />
      <GetFlags config={config} />
    </main>
  );
}
