// Pequeno hack na vercel pra revalidar cache estando no plano Hobby
export async function revalidateCache() {
	try {
		const DEPLOY_HOOK_URL = import.meta.env.DEPLOY_HOOK_URL;

		const response = await fetch(DEPLOY_HOOK_URL, {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error();
		}

		return true;
	} catch {
		return false;
	}
}
