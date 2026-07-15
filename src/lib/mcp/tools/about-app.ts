import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PRODUCT, LEGAL } from "@/lib/constants";

export default defineTool({
  name: "about_peacecode",
  title: "About PeaceCode",
  description:
    "Returns product overview information about PeaceCode Practice: name, tagline, contact email, and legal/status URLs. Read-only, no user data.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: PRODUCT.name,
      tagline: PRODUCT.tagline,
      buildYear: PRODUCT.buildYear,
      contactEmail: LEGAL.contactEmail,
      statusUrl: LEGAL.statusUrl,
      privacyUrl: LEGAL.privacyUrl,
      termsUrl: LEGAL.termsUrl,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
z; // keep zod import stable for future tools
