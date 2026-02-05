import Sidebar from "./Sidebar";
import type { UserData } from "./lib/types";
import { initFromStorage, parsedContent$ } from "./lib/store";
import { useStore } from "@nanostores/preact";
import { useEffect } from "preact/hooks";
import "./styles.css";

export default function CVBuilder() {
	useEffect(() => {
		initFromStorage();
	}, []);

	return (
		<div class="w-full h-full">
			<div className="min-h-screen bg-slate-200/50 min-[1282px]:pl-[550px] transition-all duration-300 print:contents">
				<div className="flex flex-col items-center justify-start min-h-screen overflow-hidden pt-32 pb-10 min-[1282px]:justify-center min-[1282px]:pt-10 print:contents">
					<div className="origin-top scale-[0.45] sm:scale-75 lg:scale-100 transition-transform duration-300 shadow-2xl print:contents">
						<ResumeContent />
					</div>
				</div>
			</div>

			<Sidebar />
		</div>
	);
}

function ResumeContent() {
	const content = useStore(parsedContent$);

	if (!content) return null;

	return (
		<div class="a4-page pt-52">
			<Header data={content.header} />
			<Intro text={content.intro} />
			<Experience experiences={content.experience} />
			<Projects projects={content.projects} />
			<Skills skills={content.skills} />
			<Education educations={content.education} />
		</div>
	);
}

// Para resolver negritos e italicos do markdown que podem aparecer
export const RichText = ({ content }: { content: string }) => {
	const html = content.replace(/\*\*(.*?)\*\*/g, "<strong >$1</strong>").replace(/\*(.*?)\*/g, "<em >$1</em>");
	return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

function Header({ data }: { data: UserData["header"] }) {
	return (
		<header class="text-center border-b-2 border-black pb-3 mb-5">
			<h1 class="text-3xl font-bold uppercase tracking-wide mb-0.5">{data.name}</h1>
			<p class="text-base uppercase tracking-wider font-medium mb-2">{data.role}</p>
			<div class="text-xs font-medium space-y-0.5">
				<p>
					{data.location} {" | "}
					{data.phone} {" | "}
					<a href="mailto:andreximenesa20@gmail.com" class="text-blue-700 underline decoration-blue-700">
						{data.email}
					</a>
				</p>
				<p>
					<a
						href={data.links.portfolio}
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-700 underline decoration-blue-700"
					>
						{data.links.portfolio.replace(/^https?:\/\//, "")}
					</a>
					{" | "}
					<a
						href={data.links.linkedin}
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-700 underline decoration-blue-700"
					>
						{data.links.linkedin.replace(/^https?:\/\//, "")}
					</a>
					{" | "}
					<a
						href={data.links.github}
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-700 underline decoration-blue-700"
					>
						{data.links.github.replace(/^https?:\/\//, "")}
					</a>
				</p>
			</div>
		</header>
	);
}

function Intro({ text }: { text: UserData["intro"] }) {
	return (
		<section class="mb-4">
			<h2 class="section-title font-bold uppercase border-b border-black mb-1.5 pb-[2px]">Resumo Profissional</h2>
			<p class="content-text text-justify">
				<RichText content={text} />
			</p>
		</section>
	);
}

function Skills({ skills }: { skills: UserData["skills"] }) {
	return (
		<section class="mb-4">
			<h2 class="section-title font-bold uppercase border-b border-black mb-1.5 pb-[2px]">Habilidades Técnicas</h2>
			<div class="content-text grid grid-cols-1 gap-0.5">
				{skills.map((skill) => (
					<div>
						<RichText content={skill} />
					</div>
				))}
			</div>
		</section>
	);
}

function Experience({ experiences }: { experiences: UserData["experience"] }) {
	return (
		<section class="mb-4">
			<h2 class="section-title font-bold uppercase border-b border-black mb-2 pb-[2px]">Experiência Profissional</h2>

			{experiences.map((experience) => (
				<div class="mb-2">
					<div class="flex justify-between items-baseline mb-0.5">
						<h3 class="font-bold text-[13px]">{experience.role}</h3>
						<span class="meta-text font-bold">{experience.period}</span>
					</div>
					<div class="meta-text italic mb-1">{experience.company}</div>
					{experience.shortdescription && (
						<div class="content-text mb-1">
							<RichText content={experience.shortdescription} />
						</div>
					)}
					{experience.descriptionList && experience.descriptionList.length > 0 && (
						<ul class="list-disc list-outside ml-4 content-text space-y-0.5 text-justify">
							{experience.descriptionList.map((text) => (
								<li>
									<RichText content={text} />
								</li>
							))}
						</ul>
					)}
				</div>
			))}
		</section>
	);
}

function Projects({ projects }: { projects: UserData["projects"] }) {
	return (
		<section class="mb-4">
			<h2 class="section-title font-bold uppercase border-b border-black mb-1.5 pb-[2px]">Projetos Relevantes</h2>

			{projects.map((project) => (
				<div class="mb-3">
					<div class="flex justify-between items-baseline">
						<h3 class="font-bold text-[13px]">{project.title}</h3>
						<span class="meta-text italic">{project.stack}</span>
					</div>
					<p class="content-text text-justify my-1">
						<RichText content={project.description} />
					</p>
					{project.descriptionList && project.descriptionList.length > 0 && (
						<ul class="list-disc list-outside ml-4 content-text space-y-0.5 text-justify">
							{project.descriptionList.map((text) => (
								<li>
									<RichText content={text} />
								</li>
							))}
						</ul>
					)}
				</div>
			))}
		</section>
	);
}

function Education({ educations }: { educations: UserData["education"] }) {
	return (
		<section class="mb-2">
			<h2 class="section-title font-bold uppercase border-b border-black mb-1.5 pb-[2px]">Formação Acadêmica</h2>
			{educations.map((edu) => (
				<div class="flex justify-between items-baseline content-text mb-4">
					<div>
						<span class="font-bold">{edu.degree}</span>
						<span class="block italic text-[11px] mt-0.5">{edu.institution}</span>
						<span class="block text-[11px] mt-0.5 text-justify">
							<RichText content={edu.description} />
						</span>
					</div>
					<span class="font-bold whitespace-nowrap">{edu.period}</span>
				</div>
			))}
		</section>
	);
}
