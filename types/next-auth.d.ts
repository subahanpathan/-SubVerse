import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      karma: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    karma?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    karma?: number;
  }
}
