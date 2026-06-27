import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: string;
      isStaff?: boolean;
    };
  }

  interface User {
    id: string;
    role?: string;
    isStaff?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role?: string;
    isStaff?: boolean;
  }
}