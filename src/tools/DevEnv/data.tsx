import { Terminal, Cpu, Layers, Container, Code2, Zap, Monitor } from "lucide-react";

export const ASCII_LOGO = `
 ██████╗ ███████╗██╗   ██╗    ███████╗███╗   ██╗██╗   ██╗
 ██╔══██╗██╔════╝██║   ██║    ██╔════╝████╗  ██║██║   ██║
 ██║  ██║█████╗  ██║   ██║    █████╗  ██╔██╗ ██║██║   ██║
 ██║  ██║██╔══╝  ╚██╗ ██╔╝    ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝
 ██████╔╝███████╗ ╚████╔╝     ███████╗██║ ╚████║ ╚████╔╝ 
 ╚═════╝ ╚══════╝  ╚═══╝      ╚══════╝╚═╝  ╚═══╝  ╚═══╝  
`;

export const ENV_CONFIG = [
	{
		id: "cursor",
		name: "CURSOR",
		desc: "The AI-first code editor. Fork of VS Code with deep LLM integration for proactive debugging and refactoring.",
		cmd: 'curl -fsSL "https://api2.cursor.sh/updates/download/golden/linux-x64-deb/cursor/2.6" -o cursor.deb && sudo apt install -y ./cursor.deb && rm -f cursor.deb',
		status: "OPTIMIZED",
		icon: <Code2 size={18} />,
	},
	{
		id: "vscode",
		name: "VS CODE",
		desc: "The industry standard. Essential for broad plugin ecosystem and fallback stability.",
		cmd: "sudo apt install -y wget gpg software-properties-common && wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg && sudo install -D -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/microsoft.gpg && rm -f microsoft.gpg && sudo sh -c 'echo \"deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main\" > /etc/apt/sources.list.d/vscode.list' && sudo apt update && sudo apt install -y code",
		status: "STABLE",
		icon: <Monitor size={18} />,
	},
	{
		id: "nodejs",
		name: "NODE.JS",
		desc: "Core JavaScript runtime. Use NVM or FNM to manage versions (v20+ recommended).",
		cmd: "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs",
		status: "RUNTIME",
		icon: <Layers size={18} />,
	},
	{
		id: "bun",
		name: "BUN",
		desc: "Fast all-in-one JavaScript runtime, package manager, and bundler. Near-instant start times.",
		cmd: "curl -fsSL https://bun.sh/install | bash",
		status: "FAST",
		icon: <Zap size={18} />,
	},
	{
		id: "go",
		name: "GOLANG",
		desc: "Compiled language for high-performance system tools and microservices.",
		cmd: "wget https://dl.google.com/go/go1.22.5.linux-amd64.tar.gz && sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz && rm -f go1.22.5.linux-amd64.tar.gz && export PATH=$PATH:/usr/local/go/bin",
		status: "SYSTEM",
		icon: <Cpu size={18} />,
	},
	{
		id: "docker",
		name: "DOCKER",
		desc: 'Containerization engine. Essential for "it works on my machine" consistency.',
		cmd: "curl -fsSL https://get.docker.com | sh",
		status: "CONTAINER",
		icon: <Container size={18} />,
	},
	{
		id: "ohmyzsh",
		name: "OH-MY-ZSH",
		desc: "Framework for managing ZSH config. Use with Pure or Powerlevel10k themes.",
		cmd: 'sudo apt-get install -y git curl zsh && sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
		status: "SHELL",
		icon: <Terminal size={18} />,
	},
];

export const NPM_PACKAGE = [
	{
		id: "hono",
		name: "HONO",
		desc: "A lightweight web framework for building fast APIs and web services.",
		cmd: "npm i hono",
		status: "FRAMEWORK",
		icon: <Code2 size={18} />,
	},
	{
		id: "nestjs",
		name: "NESTJS",
		desc: "A progressive Node.js framework for building efficient and scalable server-side applications.",
		cmd: "npm i @nestjs/core @nestjs/common @nestjs/platform-express",
		status: "FRAMEWORK",
		icon: <Monitor size={18} />,
	},
	{
		id: "biome",
		name: "BIOME",
		desc: "A fast formatter, linter, and analyzer for JavaScript and TypeScript.",
		cmd: "npm i -D @biomejs/biome",
		status: "LINTER",
		icon: <Zap size={18} />,
	},
	{
		id: "husky",
		name: "HUSKY",
		desc: "Git hooks made easy. Run checks automatically on commits and pushes.",
		cmd: "npm i -D husky && npx husky init",
		status: "HOOKS",
		icon: <Terminal size={18} />,
	},
	{
		id: "typescript",
		name: "TYPESCRIPT",
		desc: "JavaScript with static types, enabling safer refactors and better tooling.",
		cmd: "npm i -D typescript",
		status: "TYPES",
		icon: <Layers size={18} />,
	},
	{
		id: "astro",
		name: "ASTRO",
		desc: "A fast, modern framework for building content-driven websites and apps.",
		cmd: "npm i astro",
		status: "FRAMEWORK",
		icon: <Zap size={18} />,
	},
	{
		id: "tailwind",
		name: "TAILWIND",
		desc: "Utility-first CSS framework for rapidly building custom designs.",
		cmd: "npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init -p",
		status: "STYLES",
		icon: <Code2 size={18} />,
	},
	{
		id: "react",
		name: "REACT",
		desc: "A component-based UI library for building interactive user interfaces.",
		cmd: "npm i react react-dom",
		status: "UI",
		icon: <Monitor size={18} />,
	},
	{
		id: "preact",
		name: "PREACT",
		desc: "A fast, lightweight alternative to React with a similar component model.",
		cmd: "npm i preact preact-render-to-string",
		status: "UI",
		icon: <Monitor size={18} />,
	},
	{
		id: "zustand",
		name: "ZUSTAND",
		desc: "Small, fast state management for React (and beyond).",
		cmd: "npm i zustand",
		status: "STATE",
		icon: <Container size={18} />,
	},
	{
		id: "nanostores",
		name: "NANO STORES",
		desc: "Tiny atomic state management built for performance and simplicity.",
		cmd: "npm i nanostores",
		status: "STATE",
		icon: <Container size={18} />,
	},
	{
		id: "nextjs",
		name: "NEXT.JS",
		desc: "React framework for production-grade apps with routing, rendering and more.",
		cmd: "npm i next react react-dom",
		status: "FRAMEWORK",
		icon: <Zap size={18} />,
	},
];

export const REPOS = [
	{
		id: "build-your-own-x",
		name: "Build Your Own X",
		desc: "Learn fundamentals by building tools and systems from scratch.",
		githubLink: "https://github.com/codecrafters-io/build-your-own-x",
		status: "LEARN",
		icon: <Terminal size={18} />,
	},
	{
		id: "free-programming-books",
		name: "Free Programming Books",
		desc: "A curated collection of free books and resources for developers.",
		githubLink: "https://github.com/EbookFoundation/free-programming-books",
		status: "BOOKS",
		icon: <Terminal size={18} />,
	},
	{
		id: "tech-interview-handbook",
		name: "Tech Interview Handbook",
		desc: "A practical guide to technical interviews with topics, structure, and tips.",
		githubLink: "https://github.com/yangshun/tech-interview-handbook",
		status: "GUIDE",
		icon: <Terminal size={18} />,
	},
	{
		id: "universal-android-debloater",
		name: "Universal Android Debloater",
		desc: "A project to remove/disable unwanted apps on Android devices.",
		githubLink: "https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation",
		status: "ANDROID",
		icon: <Terminal size={18} />,
	},
	{
		id: "public-apis",
		name: "Public APIs",
		desc: "A list of public APIs grouped by category for quick exploration and prototyping.",
		githubLink: "https://github.com/public-apis/public-apis",
		status: "APIs",
		icon: <Terminal size={18} />,
	},
];
