import { framer } from "framer-plugin";

import { Config } from "./Config";
import { useEffect, useState } from "react";
import "./App.css";
import { GetFlags } from "./GetFlags";
import { GbLogo } from "./Logo";
import { parseGrowthBookUrl } from "./utils";

export type ConfigType = {
  clientKey?: string | null;
  apiHost?: string | null;
};

framer.showUI({
  position: "center",
  width: 320,
  height: 706,
  resizable: false,
});

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

  // Only inject the script if we have valid config
  useEffect(() => {
    async function setCode() {
      if (config.clientKey) {
        const script = `<script async data-api-host="${config.apiHost}" data-client-key="${config.clientKey}" src="https://cdn.jsdelivr.net/npm/@growthbook/growthbook/dist/bundles/auto.min.js"></script>`;
        const customCode = await framer.getCustomCode();
        console.log("customCode", customCode);
        if (customCode.headStart.html === script) {
          console.log("script already exists");
          return;
        }
        framer.setCustomCode({
          html: script,
          location: "headStart",
        });
      }
    }
    setCode();
  }, [config.clientKey, config.apiHost]);

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
                Go to your GrowthBook dashboard &rarr;
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
