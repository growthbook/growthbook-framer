import { useEffect, useState, useCallback } from "react";
import { AddComponent } from "./AddComponent";
import { ConfigType } from "./App";
import { FeatureApiResponse } from "@growthbook/growthbook-react";
import { framer } from "framer-plugin";
import { Tooltip } from "./components/Tooltip";
import { ExternalLink, Refresh } from "./components/Icons";
import { parseGrowthBookUrl } from "./utils";

export interface Feature<T> {
  name: string;
  hasExperiment: boolean;
  hasForceRule: boolean;
  variationCount?: number;
  defaultValue: T;
}

function CreateFeatureLink({ config }: { config: ConfigType }) {
  return (
    <div>
      <a
        className="gb-link-button"
        href={`${parseGrowthBookUrl(config.apiHost)}/features/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Create Feature
        <ExternalLink />
      </a>
    </div>
  );
}

export function ConnectExperiments({ config }: { config: ConfigType }) {
  const [features, setFeatures] = useState<Feature<unknown>[]>([]);
  const [selectedFeature, setSelectedFeature] =
    useState<Feature<unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getFlags = useCallback(
    async (showNotifications = false) => {
      if (!config.clientKey) {
        setFeatures([]);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(
          `${config.apiHost || "https://cdn.growthbook.io"}/api/features/${
            config.clientKey
          }`
        );
        const data = (await res.json()) as FeatureApiResponse;

        const processedFeatures = Object.entries(data.features ?? {}).map(
          ([name, feature]) => {
            const hasExperiment =
              feature.rules?.some((rule) => rule.variations) ?? false;
            const hasForceRule =
              feature.rules?.some((rule) => "force" in rule) ?? false;
            const ruleType = typeof feature.defaultValue;
            const variationCount = feature.rules?.find(
              (rule) => rule.variations
            )?.variations?.length;

            return {
              name,
              hasExperiment,
              hasForceRule,
              variationCount,
              ruleType,
              defaultValue: feature.defaultValue,
            };
          }
        );

        setFeatures(processedFeatures.filter((f) => f.ruleType === "number"));
        if (showNotifications) {
          framer.notify("Features refreshed successfully", {
            variant: "success",
            durationMs: 2000,
          });
        }
      } catch (error) {
        console.error("Error fetching features:", error);
        if (showNotifications) {
          framer.notify("Failed to refresh features", {
            variant: "error",
            durationMs: 3000,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [config.apiHost, config.clientKey]
  );

  useEffect(() => {
    getFlags(false); // Don't show notifications for automatic fetches
  }, [config, getFlags]);

  return features.length ? (
    <div className="gb-container">
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <div className="gb-label-tooltip-container">
            <label htmlFor="feature-select" className="gb-label">
              Select Feature to import
            </label>
            <Tooltip id="feature-select">
              Only <strong>numeric</strong> feature flags will appear in this
              list
            </Tooltip>
          </div>

          <Tooltip
            id="refresh-features"
            icon={<Refresh />}
            clickHandler={() => getFlags(true)}
            disabled={isLoading}
            right
          >
            Sync feature list with your GrowthBook account
          </Tooltip>
        </div>
        <select
          id="feature-select"
          value={selectedFeature?.name || ""}
          onChange={(e) => {
            const feature = features.find((f) => f.name === e.target.value);
            setSelectedFeature(feature || null);
          }}
          className="gb-select"
        >
          <option value="">Select...</option>
          {features.map((feature) => (
            <option key={feature.name} value={feature.name}>
              {feature.name}
            </option>
          ))}
        </select>
      </div>

      <CreateFeatureLink config={config} />

      {selectedFeature && (
        <AddComponent config={config} feature={selectedFeature} />
      )}
    </div>
  ) : (
    <div className="gb-container">
      <p>No Features exist yet.</p>
      <CreateFeatureLink config={config} />
    </div>
  );
}
