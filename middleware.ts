import { authMiddleware } from "@clerk/nextjs";
 
// This middleware ensures that all routes are protected by Clerk authentication
// except for the explicitly defined public routes
export default authMiddleware({
  // Routes that can be accessed without authentication
  publicRoutes: [
    "/",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/about",
    "/contact",
    "/privacy"
  ],
  // Ensure all authentication is handled by Clerk only
  ignoredRoutes: [
    "/(api|trpc)(.*)",
    "/_next/(.*)$",
    "/favicon.ico",
    "/assets/(.*)"
  ]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};