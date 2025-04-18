import { useState, useEffect, useRef } from "react";
import { framer } from "framer-plugin";
import { ConfigType } from "./App";
import { Tooltip } from "./components/Tooltip";

type ConfigProps = {
  config: ConfigType | null;
  updateConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
};

export function Settings({ config, updateConfig }: ConfigProps) {
  const [localConfig, setLocalConfig] = useState<ConfigType>({
    apiHost: config?.apiHost || "https://cdn.growthbook.io",
    clientKey: config?.clientKey || "",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef?.current?.focus();
  }

  // Sync local state with config when it changes
  useEffect(() => {
    setLocalConfig({
      apiHost: config?.apiHost || "https://cdn.growthbook.io",
      clientKey: config?.clientKey || "",
    });
  }, [config]);

  function handleInputChange(field: keyof ConfigType, value: string) {
    setLocalConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    // Save to Framer Plugin Data

    try {
      const res = await fetch(
        `${localConfig?.apiHost}/api/features/${localConfig?.clientKey}`
      );

      if (!res.ok) {
        framer.notify("Settings not saved. Check your client key.", {
          button: { text: "Try again", onClick: focusInput },
          variant: "error",
          durationMs: 3000,
        });
        return;
      }

      Object.entries(localConfig).forEach(([field, value]) => {
        framer.setPluginData(field, value);
      });
      updateConfig(localConfig);
      framer.notify("Settings saved", {
        variant: "success",
        durationMs: 2000,
      });
    } catch (err) {
      console.error(err);
      framer.notify("Settings not saved", {
        variant: "error",
        durationMs: 2000,
      });
    }
  }

  return (
    <div className="gb-container">
      <div>
        <div className="gb-label-tooltip-container">
          <label htmlFor="client-key" className="gb-label">
            Client Key
          </label>
          <Tooltip id="client-key">
            How you connect to GrowthBook. Found in{" "}
            <strong>SDK Connections</strong>
          </Tooltip>
        </div>

        <input
          id="client-key"
          type="text"
          placeholder="sdk-abc123"
          value={localConfig.clientKey || ""}
          onChange={(e) => handleInputChange("clientKey", e.target.value)}
          className="gb-input"
          ref={inputRef}
        />
      </div>
      <div>
        <div className="gb-label-tooltip-container">
          <label htmlFor="api-host" className="gb-label">
            API Host
          </label>
          <Tooltip id="api-host">
            Update this if you're self-hosting GrowthBook
          </Tooltip>
        </div>

        <input
          id="api-host"
          type="text"
          placeholder="https://cdn.growthbook.io"
          value={localConfig.apiHost || ""}
          onChange={(e) => handleInputChange("apiHost", e.target.value)}
          className="gb-input"
        />
      </div>

      <button className="framer-button-primary" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}
