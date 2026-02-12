export type UserRole = "ADMIN" | "USER";

export interface UserDomain {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  phone: string | null;
}

export interface UserUpdateDomain {
  name?: string;
  role?: UserRole;
  phone?: string;
}
