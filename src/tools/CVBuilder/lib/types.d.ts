export interface UserData {
	header: {
		name: string;
		role: string;
		location: string;
		phone: string;
		email: string;
		links: {
			portfolio: string;
			linkedin: string;
			github: string;
		};
	};
	intro: string;
	skills: string[];
	experience: {
		role: string;
		company: string;
		period: string;
		url: string;
		shortdescription?: string;
		descriptionList?: string[];
	}[];
	projects: {
		title: string;
		url: string;
		description: string;
		descriptionList?: string[];
	}[];
	education: {
		degree: string;
		institution: string;
		period: string;
		url: string;
	}[];
}
