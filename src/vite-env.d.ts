/// <reference types="vite/client" />

interface Window {
  growthbook?: {
    getFeatureValue: (key: string, fallback: any) => any;
    subscribe: (key: string, callback: () => void) => () => void;
  };
  growthbook_config?: {
    clientKey: string;
    apiHost?: string;
    enableDevMode?: boolean;
    trackingCallback?: (experiment: any, result: any) => void;
  };
}
