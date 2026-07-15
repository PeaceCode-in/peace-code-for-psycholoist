import { defineMcp } from "@lovable.dev/mcp-js";
import aboutApp from "./tools/about-app";
import listModules from "./tools/list-modules";

export default defineMcp({
  name: "peacecode-practice-mcp",
  title: "PeaceCode Practice",
  version: "0.1.0",
  instructions:
    "Read-only product metadata for PeaceCode Practice. Use `about_peacecode` for basic product/contact information and `list_modules` to see the available top-level modules in the app. This server does not expose patient, clinical, or account data.",
  tools: [aboutApp, listModules],
});
