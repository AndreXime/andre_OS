export const SITE_NAME = "dev.andreximenes";

export const SITE_TAGLINE = "Edição contínua · hub técnico de um autor";

export const SITE_DESCRIPTION =
	"Notas técnicas, ferramentas web e links curados por André Ximenes.";

export function pageTitle(segment: string): string {
	return `${segment} · ${SITE_NAME}`;
}
