export const cookieName = "prime_crm_session";
export const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-secret-change-me");
