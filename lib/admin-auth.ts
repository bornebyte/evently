// The seed command uses these values as the first local account defaults. Login
// still verifies against the AdminUser row and an HttpOnly database session.
export const DEMO_ADMIN = {
  email: "admin@evently.com",
  password: "admin",
  name: "Evently Admin",
  role: "ADMIN",
} as const;
