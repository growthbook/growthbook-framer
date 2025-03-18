import { useState, useEffect, useRef } from "react";
import { framer } from "framer-plugin";
import { ConfigType } from "./App";

type ConfigProps = {
  config: ConfigType | null;
  updateConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
};

export function Config({ config, updateConfig }: ConfigProps) {
  const [localConfig, setLocalConfig] = useState<ConfigType>({
    apiHost: config?.apiHost || "https://cdn.growthbook.io",
    clientKey: config?.clientKey || "",
  });

  const inputRef = useRef(null);

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

    // Show success message
  }

  return (
    <div className="gb-container">
      <h2>Settings</h2>

      <div>
        <label htmlFor="client-key" className="gb-label">
          Client Key
        </label>
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
        <label htmlFor="api-host" className="gb-label">
          API Host
        </label>
        <input
          id="api-host"
          type="text"
          placeholder="https://cdn.growthbook.io"
          value={localConfig.apiHost || ""}
          onChange={(e) => handleInputChange("apiHost", e.target.value)}
          className="gb-input"
        />
      </div>

      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
}
