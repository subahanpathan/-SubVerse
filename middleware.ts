export { default } from "next-auth/middleware";

export const config = {
  // Protect write-action pages  
  matcher: ["/submit", "/api/posts/:path*", "/api/communities/:path*", "/api/comments/:path*"],
};
