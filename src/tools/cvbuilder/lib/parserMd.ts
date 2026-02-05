import type { UserData } from "./types";

type PartialExperience = Partial<UserData["experience"][0]>;
type PartialProject = Partial<UserData["projects"][0]>;
type PartialEducation = Partial<UserData["education"][0]>;

export function parseResumeMarkdown(markdown: string): UserData {
	const lines = markdown.split("\n");

	const data: UserData = {
		header: {
			name: "",
			role: "",
			location: "",
			phone: "",
			email: "",
			links: { portfolio: "", linkedin: "", github: "" },
		},
		intro: "",
		skills: [],
		experience: [],
		projects: [],
		education: [],
	};

	let currentSection = "";

	let tempExp: PartialExperience | null = null;
	let tempProject: PartialProject | null = null;
	let tempEdu: PartialEducation | null = null;

	// Regex auxiliar para detectar listas (aceita "-", "*" ou "+")
	const isBullet = (line: string) => /^[-*+]\s/.test(line);
	const cleanBullet = (line: string) => line.replace(/^[-*+]\s/, "").trim();

	for (let line of lines) {
		line = line.trim();

		if (!line || line.startsWith("//")) continue;

		if (line.startsWith("# ")) {
			currentSection = line.replace("# ", "").toUpperCase();
			continue;
		}

		switch (currentSection) {
			case "HEADER": {
				const [key, ...values] = line.split(":");
				const value = values.join(":").trim();
				if (!key || !value) break;

				const k = key.toLowerCase();
				if (k === "name") data.header.name = value;
				else if (k === "role") data.header.role = value;
				else if (k === "location") data.header.location = value;
				else if (k === "phone") data.header.phone = value;
				else if (k === "email") data.header.email = value;
				else if (k === "portfolio") data.header.links.portfolio = value;
				else if (k === "linkedin") data.header.links.linkedin = value;
				else if (k === "github") data.header.links.github = value;
				break;
			}

			case "INTRO":
				data.intro += (data.intro ? " " : "") + line;
				break;

			case "SKILLS":
				if (isBullet(line)) {
					data.skills.push(cleanBullet(line));
				}
				break;

			case "EXPERIENCE":
				if (line.startsWith("## ")) {
					const parts = line
						.replace("## ", "")
						.split("|")
						.map((s) => s.trim());

					if (tempExp?.role && tempExp.company) {
						data.experience.push(tempExp as UserData["experience"][0]);
					}
					tempExp = {
						role: parts[0] || "",
						company: parts[1] || "",
						period: parts[2] || "",
						shortdescription: "",
						descriptionList: [],
					};
				} else if (isBullet(line) && tempExp) {
					// Garante array inicializado
					if (!tempExp.descriptionList) tempExp.descriptionList = [];
					tempExp.descriptionList.push(cleanBullet(line));
				} else if (tempExp && !line.startsWith("##")) {
					tempExp.shortdescription = (tempExp.shortdescription || "") + (tempExp.shortdescription ? " " : "") + line;
				}
				break;

			case "PROJECTS":
				if (line.startsWith("## ")) {
					const parts = line
						.replace("## ", "")
						.split("|")
						.map((s) => s.trim());

					if (tempProject?.title) {
						data.projects.push(tempProject as UserData["projects"][0]);
					}
					tempProject = {
						title: parts[0] || "",
						stack: parts[1] || "",
						description: "",
						descriptionList: [],
					};
				} else if (isBullet(line) && tempProject) {
					if (!tempProject.descriptionList) tempProject.descriptionList = [];
					tempProject.descriptionList.push(cleanBullet(line));
				}
				// Se não for bullet, concatena na descrição
				else if (tempProject && !line.startsWith("##")) {
					tempProject.description += (tempProject.description ? " " : "") + line;
				}
				break;

			case "EDUCATION":
				if (line.startsWith("## ")) {
					const parts = line
						.replace("## ", "")
						.split("|")
						.map((s) => s.trim());

					if (tempEdu?.degree) {
						data.education.push(tempEdu as UserData["education"][0]);
					}
					tempEdu = {
						degree: parts[0] || "",
						institution: parts[1] || "",
						period: parts[2] || "",
						description: "",
					};
				} else if (tempEdu && !line.startsWith("##")) {
					tempEdu.description += (tempEdu.description ? " " : "") + line;
				}
				break;
		}
	}

	// Push final
	if (tempExp?.role) data.experience.push(tempExp as UserData["experience"][0]);
	if (tempProject?.title) data.projects.push(tempProject as UserData["projects"][0]);
	if (tempEdu?.degree) data.education.push(tempEdu as UserData["education"][0]);

	return data;
}
