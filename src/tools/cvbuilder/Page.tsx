import Sidebar from "./Sidebar";
import type { UserData } from "./lib/types";
import { initFromStorage, parsedContent$ } from "./lib/store";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import "./styles.css";

export default function CVBuilder() {
	useEffect(() => {
		initFromStorage();
	}, []);

	return (
		<div className="w-full h-full">
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
		<div className="a4-page">
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
const RichText = ({ content }: { content: string }) => {
	const html = content.replace(/\*\*(.*?)\*\*/g, "<strong >$1</strong>").replace(/\*(.*?)\*/g, "<em >$1</em>");
	return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

function Header({ data }: { data: UserData["header"] }) {
	return (
		<header className="text-center border-b-2 border-black pb-3 mb-4">
			<h1 className="text-3xl font-bold uppercase tracking-wide mb-0.5">{data.name}</h1>
			<p className="text-base uppercase tracking-wider font-medium mb-2">{data.role}</p>
			<div className="text-xs font-medium space-y-0.5">
				<p>
					{data.location} {" | "}
					{data.phone} {" | "}
					<a href={`mailto:${data.email}`} className="text-blue-700 underline decoration-blue-700">
						{data.email}
					</a>
				</p>
				<p>
					<a
						href={data.links.portfolio}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-700 underline decoration-blue-700"
					>
						{data.links.portfolio.replace(/^https?:\/\//, "")}
					</a>
					{" | "}
					<a
						href={data.links.linkedin}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-700 underline decoration-blue-700"
					>
						{data.links.linkedin.replace(/^https?:\/\//, "")}
					</a>
					{" | "}
					<a
						href={data.links.github}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-700 underline decoration-blue-700"
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
		<section className="mb-4">
			<h2 className="text-[14px] font-bold uppercase border-b border-black mb-1.5 pb-[2px]">Resumo Profissional</h2>
			<p className="text-[12px] leading-normal text-left">
				<RichText content={text} />
			</p>
		</section>
	);
}

function Skills({ skills }: { skills: UserData["skills"] }) {
	return (
		<section className="mb-4">
			<h2 className="text-[14px] font-bold uppercase border-b border-black mb-1.5 pb-[2px]">Habilidades Técnicas</h2>
			<div className="text-[12px] leading-normal grid grid-cols-1 gap-0.5">
				{skills.map((skill) => (
					<div key={skill}>
						<RichText content={skill} />
					</div>
				))}
			</div>
		</section>
	);
}

function Experience({ experiences }: { experiences: UserData["experience"] }) {
	return (
		<section className="mb-4">
			<h2 className="text-[14px] font-bold uppercase border-b border-black mb-2 pb-[2px]">Experiência Profissional</h2>

			{experiences.map((experience) => (
				<div key={experience.company} className="mb-2 last:mb-0">
					<div className="flex justify-between items-baseline mb-0.5">
						<h3 className="font-bold text-[13px]">{experience.role}</h3>
						<span className="text-[12px] font-bold">{experience.period}</span>
					</div>
					<div className="text-[12px] italic mb-1">{experience.company}</div>
					{experience.shortdescription && (
						<div className="text-[12px] leading-normal mb-1">
							<RichText content={experience.shortdescription} />
						</div>
					)}
					{experience.descriptionList && experience.descriptionList.length > 0 && (
						<ul className="list-disc list-outside ml-4 text-[12px] leading-normal space-y-0.5 text-left">
							{experience.descriptionList.map((text) => (
								<li key={text}>
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
		<section className="mb-4">
			<h2 className="text-[14px] font-bold uppercase border-b border-black mb-1.5 pb-[2px]">Projetos Relevantes</h2>

			{projects.map((project) => (
				<div key={project.title} className="mb-3 last:mb-0">
					<div className="flex justify-between items-baseline">
						<h3 className="font-bold text-[13px]">{project.title}</h3>
						<span className="text-[12px] italic">{project.stack}</span>
					</div>
					<p className="text-[12px] leading-normal text-left my-1">
						<RichText content={project.description} />
					</p>
					{project.descriptionList && project.descriptionList.length > 0 && (
						<ul className="list-disc list-outside ml-4 text-[12px] leading-normal space-y-0.5 text-left">
							{project.descriptionList.map((text) => (
								<li key={text}>
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
		<section className="mb-0">
			<h2 className="text-[14px] font-bold uppercase border-b border-black mb-1.5 pb-[2px]">Formação Acadêmica</h2>
			{educations.map((edu) => (
				<div key={edu.institution} className="mb-4 text-[12px] leading-normal last:mb-0">
					<div className="flex justify-between items-baseline">
						<span className="font-bold">{edu.degree}</span>
						<span className="font-bold whitespace-nowrap ml-2">{edu.period}</span>
					</div>
					<span className="block italic text-[11px] mt-0.5">{edu.institution}</span>
					<span className="block text-[11px] mt-0.5 text-left">
						<RichText content={edu.description} />
					</span>
				</div>
			))}
		</section>
	);
}
