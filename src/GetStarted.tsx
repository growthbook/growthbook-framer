import { ExternalLink } from "./components/Icons";

export function GetStarted() {
  return (
    <div className="gb-container">
      <p style={{ textWrap: "pretty" }}>
        In GrowthBook, create a Feature Flag with an Experiment rule and add
        variants. Then, return to Framer to connect your Feature Flag and map
        components to those variants.
      </p>
      <a className="gb-link-button" href="https://growthbook.io/docs/">
        View GrowthBook Docs <ExternalLink />
      </a>
    </div>
  );
}
