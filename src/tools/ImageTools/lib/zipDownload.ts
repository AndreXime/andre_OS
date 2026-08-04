import { zipSync } from "fflate";
import { buildZipEntryName, getSelectedDoneItems, type ImageItem, type OutputFormat } from "../domain";

export async function downloadProcessedZip(
	items: ImageItem[],
	selectedIds: string[],
	outputFormat?: OutputFormat,
): Promise<void> {
	const done = getSelectedDoneItems(items, selectedIds);
	if (done.length < 2) return;

	const files: Record<string, Uint8Array> = {};
	const usedNames = new Map<string, number>();

	for (const item of done) {
		if (!item.resultBlob) continue;
		let name = buildZipEntryName(item, outputFormat);
		const count = usedNames.get(name) ?? 0;
		usedNames.set(name, count + 1);
		if (count > 0) {
			const dot = name.lastIndexOf(".");
			name = dot > 0 ? `${name.slice(0, dot)}_${count}${name.slice(dot)}` : `${name}_${count}`;
		}
		files[name] = new Uint8Array(await item.resultBlob.arrayBuffer());
	}

	if (Object.keys(files).length < 2) return;

	const zipped = zipSync(files, { level: 0 });
	const blob = new Blob([zipped], { type: "application/zip" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "imagens_processadas.zip";
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
