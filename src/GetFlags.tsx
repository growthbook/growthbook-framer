import { useEffect, useState, useCallback } from "react";
import { AddComponent } from "./AddComponent";
import { ConfigType } from "./App";
import { FeatureApiResponse } from "@growthbook/growthbook-react";
import { framer } from "framer-plugin";

export interface Feature<T> {
  name: string;
  hasExperiment: boolean;
  hasForceRule: boolean;
  variationCount?: number;
  defaultValue: T;
}

export function GetFlags({ config }: { config: ConfigType }) {
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
        // Should we disable non-numeric flags, as they won't be compatible with the plugin/component?
        const processedFeatures = Object.entries(data.features ?? {}).map(
          ([name, feature]) => {
            const hasExperiment =
              feature.rules?.some((rule) => rule.variations) ?? false;
            const hasForceRule =
              feature.rules?.some((rule) => "force" in rule) ?? false;
            const variationCount = feature.rules?.find(
              (rule) => rule.variations
            )?.variations?.length;

            return {
              name,
              hasExperiment,
              hasForceRule,
              variationCount,
              defaultValue: feature.defaultValue,
            };
          }
        );
        setFeatures(processedFeatures);
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
      <h2>Features</h2>

      <div>
        <div className="gb-label-container">
          <label htmlFor="feature-select" className="gb-label">
            Feature Flag
          </label>
          <button
            aria-label="Refresh Features"
            className={`gb-icon-button ${isLoading ? "loading" : ""}`}
            onClick={() => getFlags(true)} // Show notifications for manual refresh
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
            </svg>
          </button>
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
          <option value="">Select a feature...</option>
          {features.map((feature) => (
            <option key={feature.name} value={feature.name}>
              {feature.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="gb-info-text">
          Missing a feature flag?{" "}
          <a target="_blank" href={`https://app.growthbook.io`}>
            {/* TODO: Add self-hosted support */}
            Create one in GrowthBook
          </a>{" "}
          and refresh.
        </p>
      </div>

      {selectedFeature && (
        <AddComponent config={config} feature={selectedFeature} />
      )}
    </div>
  ) : null;
}
