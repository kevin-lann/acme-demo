import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/dashboard/:path*", "/cart/:path*", "/checkout/:path*", "/orders/:path*", "/account/:path*"],
};
