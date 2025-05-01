import { framer } from "framer-plugin";
import { useEffect, useState, useMemo } from "react";
import "./App.css";
import { Settings } from "./Settings";
import { ConnectExperiments } from "./ConnectExperiments";
import {
  Cog,
  ExternalLink,
  Flask,
  GbLogo,
  InfoFilled,
} from "./components/Icons";
import { parseGrowthBookUrl } from "./utils";
import { Accordion } from "./components/Accordion";
import { GetStarted } from "./GetStarted";

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
  const [isLoading, setIsLoading] = useState(true);
  const [config, updateConfig] = useState<ConfigType>({
    clientKey: "",
    apiHost: "",
  });

  useEffect(() => {
    const getData = async () => {
      const [clientKey, apiHost] = await Promise.all([
        framer.getPluginData("clientKey"),
        framer.getPluginData("apiHost"),
      ]);

      // Update both states in a single render
      updateConfig({ clientKey, apiHost });
      setIsLoading(false);
    };

    getData();
  }, []);

  // Only inject the script if we have valid config
  useEffect(() => {
    async function setCode() {
      if (config.clientKey) {
        const script = `<script async data-api-host="${config.apiHost}" data-client-key="${config.clientKey}" src="https://cdn.jsdelivr.net/npm/@growthbook/growthbook/dist/bundles/auto.min.js"></script>`;
        const customCode = await framer.getCustomCode();
        if (customCode.headStart.html === script) {
          return;
        }
        framer.setCustomCode({
          html: script,
          location: "headStart",
        });
      }
    }
    setCode();
  }, [config.clientKey, config.apiHost]); // Include both config values in dependencies

  const items = useMemo(
    () => [
      {
        id: "1",
        title: "Settings",
        content: <Settings config={config} updateConfig={updateConfig} />,
        icon: <Cog />,
      },
      {
        id: "2",
        title: "Get Started",
        content: <GetStarted />,
        icon: <InfoFilled />,
      },
      {
        id: "3",
        title: "Connect Your Experiments",
        content: <ConnectExperiments config={config} />,
        icon: <Flask />,
      },
    ],
    [config]
  ); // Only recreate when config changes

  if (isLoading) {
    return (
      <main>
        <div className="gb-container gb-intro">
          <GbLogo />
          <p className="gb-intro-headline">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="gb-container gb-intro">
        <GbLogo />
        <p className="gb-intro-headline">What will you A/B test today?</p>
        <p className="gb-intro-text">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${parseGrowthBookUrl(config.apiHost)}`}
            className="gb-link-button"
          >
            Open GrowthBook <ExternalLink />
          </a>
        </p>
      </div>
      <Accordion items={items} defaultOpenId={config.clientKey ? "3" : "1"} />
    </main>
  );
}
