import { EncryptJWT, jwtDecrypt } from "jose";

export const ADMIN_SESSION_COOKIE = "admin_session";

function getJwtSecret() {
	return new TextEncoder().encode(import.meta.env.JWT_SECRET);
}

export async function isAuthenticated(cookieValue: string | undefined): Promise<boolean> {
	if (!cookieValue) return false;
	try {
		const { payload } = await jwtDecrypt(cookieValue, getJwtSecret());
		return payload.admin === true;
	} catch {
		return false;
	}
}

export async function createAdminToken(): Promise<string> {
	return new EncryptJWT({ admin: true })
		.setProtectedHeader({ alg: "dir", enc: "A256GCM" })
		.setIssuedAt()
		.setExpirationTime("24h")
		.encrypt(getJwtSecret());
}

export function getSessionCookieOptions() {
	return {
		path: "/",
		httpOnly: true,
		secure: import.meta.env.PROD,
		maxAge: 60 * 60 * 24,
	};
}

export function getAuthErrorMessage(e: unknown): string {
	if (e instanceof Error) {
		if (e.message === "UNAUTHORIZED_ACCESS") return "Sessão inválida ou expirada. Faça login novamente.";
		if (e.message.includes("UNIQUE constraint failed")) return "Já existe um post com este slug.";
		if (e.message.includes("SQLITE") || e.message.includes("database")) return "Erro no banco de dados. Tente novamente.";
		return e.message;
	}
	return "Erro inesperado. Tente novamente.";
}
