import { defineTool } from "@lovable.dev/mcp-js";

const MODULES = [
  { slug: "patients", label: "Patients", description: "Patient roster, charts, notes, and timelines." },
  { slug: "sessions", label: "Sessions", description: "Scheduled and completed therapy sessions, telehealth rooms, and wrap-ups." },
  { slug: "assessments", label: "Assessments", description: "Standardized instrument library, assignments, and results." },
  { slug: "billing", label: "Billing", description: "Invoices, payments, claims, services, and financial reports." },
  { slug: "calendar", label: "Calendar", description: "Day/month/agenda views, availability, booking link, and integrations." },
  { slug: "documents", label: "Documents", description: "Clinical documents, worksheets, certificates, and templates." },
  { slug: "messaging", label: "Messaging", description: "Secure client threads, canned replies, and message audit." },
  { slug: "team", label: "Team", description: "Colleagues, roles, coverage, handoffs, and supervision." },
  { slug: "portal", label: "Client Portal", description: "Patient-facing surface for sessions, homework, and messages." },
  { slug: "integrations", label: "Integrations", description: "Directory, webhooks, API tokens, and automations." },
  { slug: "inbox", label: "Inbox", description: "Daily brief and clinical task inbox." },
  { slug: "copilot", label: "Co-Pilot", description: "AI-assisted SOAP drafts, continuity briefs, and clinical assistance." },
  { slug: "governance", label: "Governance", description: "Consent, audit trail, DPA, breach, retention, and regulator view." },
  { slug: "settings", label: "Settings", description: "Profile, credentials, appearance, availability, and preferences." },
];

export default defineTool({
  name: "list_modules",
  title: "List product modules",
  description:
    "Returns the top-level modules available in PeaceCode Practice with a short description of each. Read-only product metadata.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(MODULES, null, 2) }],
    structuredContent: { modules: MODULES },
  }),
});
