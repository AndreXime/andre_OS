import { useState, useEffect } from "react";
import { ChevronRight, Command } from "lucide-react";
import { Footer, Pane, Typewriter } from "./Components";
import { ENV_CONFIG, NPM_PACKAGE, REPOS } from "./data";
import DevEnvHeader from "./DevEnvHeader";
import "./style.css";

type DevEnvTabId = "ENV_CONFIG" | "NPM_PACKAGES" | "REPOS";
type ToolCard = (typeof ENV_CONFIG)[number];
type RepoCard = (typeof REPOS)[number];
type Card = ToolCard | RepoCard;

const App = () => {
	const [booted, setBooted] = useState(false);
	const [logs, setLogs] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState<DevEnvTabId>("ENV_CONFIG");

	useEffect(() => {
		const sequence = [
			"INITIALIZING SYSTEM...",
			"LOADING KERNEL MODULES...",
			"MOUNTING /DEV/ENV...",
			"STARTING MONOSPACE_ENGINE...",
			"ACCESS GRANTED.",
		];

		sequence.forEach((msg, i) => {
			setTimeout(() => {
				setLogs((prev) => [...prev, `[OK] ${msg}`]);
				if (i === sequence.length - 1) setTimeout(() => setBooted(true), 500);
			}, i * 400);
		});
	}, []);

	if (!booted) {
		return (
			<div className="h-screen bg-[#0a0a0a] text-[#33ff00] font-mono p-10 flex flex-col justify-center items-center overflow-hidden">
				<div className="w-full max-w-md">
					{logs.map((log) => (
						<div key={log} className="mb-1">
							{log}
						</div>
					))}
					<div className="mt-4 animate-pulse">_</div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-[#0a0a0a] text-[#33ff00] font-mono selection:bg-[#33ff00] selection:text-[#0a0a0a] relative overflow-hidden flex flex-col">
			{/* Scanline Effect */}
			<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.03]">
				<div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
			</div>

			<div className="max-w-7xl mx-auto p-4 md:p-8 pb-6 flex flex-col gap-6 relative z-10 flex-1 overflow-hidden">
				{/* Header Section */}
				<DevEnvHeader />

				{/* Main Content Split Area */}
				<main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden min-h-0">
					{/* Sidebar / Quick Menu */}
					<aside className="lg:col-span-3 space-y-6 h-full min-h-0">
						<Pane title="NAVIGATION">
							<nav className="flex flex-col gap-2 text-sm">
								<button
									type="button"
									onClick={() => setActiveTab("ENV_CONFIG")}
									className={`text-left flex items-center gap-2 hover:bg-[#33ff00] hover:text-[#0a0a0a] px-2 py-1 transition-colors ${
										activeTab === "ENV_CONFIG" ? "text-[#ffb000]" : ""
									}`}
								>
									<ChevronRight size={14} /> [ 01 ] ENV_CONFIG
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("NPM_PACKAGES")}
									className={`text-left flex items-center gap-2 hover:bg-[#33ff00] hover:text-[#0a0a0a] px-2 py-1 transition-colors ${
										activeTab === "NPM_PACKAGES" ? "text-[#ffb000]" : ""
									}`}
								>
									<ChevronRight size={14} /> [ 02 ] NPM_PACKAGES
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("REPOS")}
									className={`text-left flex items-center gap-2 hover:bg-[#33ff00] hover:text-[#0a0a0a] px-2 py-1 transition-colors ${
										activeTab === "REPOS" ? "text-[#ffb000]" : ""
									}`}
								>
									<ChevronRight size={14} /> [ 04 ] REPOS
								</button>
							</nav>
						</Pane>
					</aside>

					{/* Tools Grid */}
					<section className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto h-full min-h-0 auto-rows-max content-start items-start">
						{(activeTab === "ENV_CONFIG" ? ENV_CONFIG : activeTab === "NPM_PACKAGES" ? NPM_PACKAGE : REPOS).map(
							(tool: Card) => {
								const isRepo = "githubLink" in tool;
								return (
									<div
										key={tool.id}
										className="group border border-[#1f521f] bg-[#0a0a0a] hover:border-[#33ff00] transition-colors relative flex flex-col h-50 self-start"
									>
										<div className="p-3 border-b border-[#1f521f] group-hover:bg-[#1f521f] group-hover:text-[#33ff00] flex justify-between items-center transition-colors">
											<div className="flex items-center gap-2">
												{tool.icon}
												<span className="font-bold text-sm tracking-widest">{tool.name}</span>
											</div>
											<span className="text-[10px] border border-current px-1 opacity-70">{tool.status}</span>
										</div>

										<div className="p-4 flex-1 space-y-4">
											<p className="text-xs leading-relaxed opacity-90 h-12 overflow-hidden">
												<Typewriter text={tool.desc} />
											</p>

											{!isRepo ? (
												<div className="space-y-2">
													<div className="text-[10px] uppercase opacity-50">Installation Command:</div>
													<div className="bg-[#0f0f0f] border border-[#1f521f] p-2 flex items-center justify-between group-hover:border-[#33ff00]">
														<code className="text-[10px] text-[#ffb000] truncate">$ {tool.cmd}</code>
														<button
															onClick={() => {
																const el = document.createElement("textarea");
																el.value = tool.cmd;
																document.body.appendChild(el);
																el.select();
																document.execCommand("copy");
																document.body.removeChild(el);
															}}
															className="ml-2 hover:text-[#ffb000]"
															title="Copy to clipboard"
														>
															<Command size={12} />
														</button>
													</div>
												</div>
											) : (
												<div className="space-y-2">
													<div className="text-[10px] uppercase opacity-50">Repository:</div>
													<div className="bg-[#0f0f0f] border border-[#1f521f] p-2 flex items-center justify-between group-hover:border-[#33ff00]">
														<a
															href={tool.githubLink}
															target="_blank"
															rel="noreferrer"
															className="text-[10px] text-[#ffb000] truncate hover:underline"
														>
															{tool.githubLink}
														</a>
														<button
															type="button"
															onClick={() => window.open(tool.githubLink, "_blank", "noopener,noreferrer")}
															className="ml-2 hover:text-[#ffb000]"
															title="Open on GitHub"
														>
															<Command size={12} />
														</button>
													</div>
												</div>
											)}
										</div>

										<div className="h-1 bg-[#1f521f] overflow-hidden">
											<div className="h-full bg-[#33ff00] w-0 group-hover:w-full transition-all duration-500 ease-in-out"></div>
										</div>
									</div>
								);
							},
						)}
					</section>
				</main>
			</div>

			<Footer />
		</div>
	);
};

export default App;
