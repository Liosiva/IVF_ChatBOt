// Convex + Clerk Authentication Configuration
// The domain should match your Clerk frontend API URL from the Clerk Dashboard
// Format: https://<your-clerk-subdomain>.clerk.accounts.dev

export default {
  providers: [
    {
      // IMPORTANT: Set CLERK_ISSUER_URL in Convex Dashboard -> Settings -> Environment Variables
      // Get this value from Clerk Dashboard -> Configure -> Domains -> Frontend API
      domain: process.env.CLERK_ISSUER_URL,
      applicationID: "convex",
    },
  ],
};