import { Edit, Layout, Trash2 } from "lucide-preact";
import { startEditing, deleteItem, $items } from "./store";
import { useStore } from "@nanostores/preact";

export default function AdminList() {
	const items = useStore($items);

	return (
		<section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<h2 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
				<Layout size={20} className="text-zinc-500" /> Banco de Dados
			</h2>

			<div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
				{items.length === 0 ? (
					<div className="p-8 text-center text-zinc-500 font-mono text-sm">Nenhum post encontrado.</div>
				) : (
					<div className="divide-y divide-zinc-800">
						{items.map((item) => (
							<div
								key={item.id}
								className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors group"
							>
								<div className="flex items-center gap-4">
									<div
										className={`w-3 h-3 rounded-full flex-shrink-0 ${
											item.type === "note"
												? "bg-blue-500"
												: item.type === "tool"
													? "bg-emerald-500"
													: item.type === "link"
														? "bg-violet-500"
														: "bg-zinc-500"
										}`}
									/>

									<div className="min-w-0">
										<h3 className=" font-medium text-zinc-200 truncate">{item.title}</h3>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-[10px] font-mono text-zinc-500 uppercase border border-zinc-800 px-1 rounded bg-zinc-900">
												{item.type}
											</span>
											<span className="text-[10px] text-zinc-600 font-mono">
												{new Date(item.date || "").toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
									<button
										onClick={() => startEditing(item)}
										className="p-2 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
										title="Editar"
									>
										<Edit size={14} />
									</button>
									<button
										onClick={async () => await deleteItem(item.id)}
										className="p-2 hover:bg-red-900/30 rounded text-zinc-400 hover:text-red-400 transition-colors"
										title="Apagar"
									>
										<Trash2 size={14} />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
