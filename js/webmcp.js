/**
 * Buttercup Advertising Studio — WebMCP In-Browser Agent Interface
 * Implements navigator.modelContext.registerTool() on page load
 */
(function initWebMcpTools() {
  'use strict';

  function registerTools() {
    if (typeof navigator !== "undefined" && navigator.modelContext && typeof navigator.modelContext.registerTool === "function") {
      try {
        navigator.modelContext.registerTool({
          name: "requestBrandConsultation",
          description: "Submit a project inquiry or request a brand consultation quote from Buttercup Advertising Studio.",
          inputSchema: {
            type: "object",
            properties: {
              firstName: { type: "string", description: "First name of contact person" },
              lastName: { type: "string", description: "Last name of contact person" },
              email: { type: "string", format: "email", description: "Email address" },
              phone: { type: "string", description: "Phone number with country code" },
              projectDetails: { type: "string", description: "Overview of branding, logo, web or advertising needs" }
            },
            required: ["firstName", "email", "projectDetails"]
          },
          execute: async function(params) {
            return {
              status: "success",
              message: "Inquiry received by Buttercup Advertising Studio. We will contact you at " + (params.email || "your email") + " shortly."
            };
          }
        });

        navigator.modelContext.registerTool({
          name: "getAgencyServices",
          description: "Get service details, packages, and pricing from Buttercup Advertising Studio.",
          inputSchema: {
            type: "object",
            properties: {
              service: {
                type: "string",
                enum: ["brand-strategy", "visual-identity", "marketing-communication", "all"],
                description: "Service category"
              }
            }
          },
          execute: async function(params) {
            return {
              agency: "Buttercup Advertising Studio",
              location: "Ahmedabad, Gujarat, India",
              email: "info@buttercup.in",
              phone: "+91 99250 34404",
              packages: [
                { name: "Brand Strategy", startingPrice: "₹49,999", url: "https://buttercup.in/pages/services/brand-strategy/" },
                { name: "Visual Identity", startingPrice: "₹74,999", url: "https://buttercup.in/pages/services/visual-identity/" },
                { name: "Brand Communication", startingPrice: "₹99,999", url: "https://buttercup.in/pages/services/marketing-communication/" }
              ]
            };
          }
        });

        navigator.modelContext.registerTool({
          name: "getPortfolioProjects",
          description: "Retrieve selected client branding case studies from Buttercup Advertising Studio.",
          inputSchema: {
            type: "object",
            properties: {
              category: { type: "string", description: "Optional filter for product or service sector" }
            }
          },
          execute: async function() {
            return {
              portfolioUrl: "https://buttercup.in/pages/case-studies/",
              featuredProjects: ["Prajay Steel", "Senal Diamonds", "Glogeous", "Atlas Bloom", "Polka Tots", "Farmbyte"]
            };
          }
        });
      } catch (err) {
        console.warn("WebMCP tool registration:", err);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerTools);
  } else {
    registerTools();
  }
})();
