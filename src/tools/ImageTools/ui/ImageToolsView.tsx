import { useStore } from "@nanostores/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildDownloadFilename, formatFileSize, getSelectedDoneItems } from "../domain";
import { useBgRemoval } from "../hooks/useBgRemoval";
import { useImageProcessor } from "../hooks/useImageProcessor";
import { detectFormatSupport, isFormatSupported } from "../lib/formatSupport";
import { downloadProcessedZip } from "../lib/zipDownload";
import {
	$activeItem,
	$activeOperation,
	$batchProgress,
	$batchRunning,
	$compressMaxWidth,
	$error,
	$hasItems,
	$items,
	$modelPreloadProgress,
	$modelPreloadStatus,
	$outputFormat,
	$quality,
	$selectedIds,
	$supportedFormats,
	addSources,
	cancelAll,
	replaceItemWithBlob,
} from "../store";
import { ModelPreloadBanner } from "./components";
import { CONVERT_FORMATS } from "./constants";
import { ImageQueue } from "./ImageQueue";
import { UploadZone } from "./UploadZone";
import { WorkspacePanel } from "./WorkspacePanel";

export default function ImageToolsView() {
	const items = useStore($items);
	const activeItem = useStore($activeItem);
	const hasItems = useStore($hasItems);
	const selectedIds = useStore($selectedIds);
	const activeOperation = useStore($activeOperation);
	const outputFormat = useStore($outputFormat);
	const quality = useStore($quality);
	const compressMaxWidth = useStore($compressMaxWidth);
	const supportedFormats = useStore($supportedFormats);
	const modelPreloadStatus = useStore($modelPreloadStatus);
	const modelPreloadProgress = useStore($modelPreloadProgress);
	const error = useStore($error);
	const batchRunning = useStore($batchRunning);
	const batchProgress = useStore($batchProgress);

	const { convert, compress, runBatchOnSelected } = useImageProcessor();
	const { removeBackground, runBgRemovalBatchOnSelected, cancelBgRemoval, retryPreload } = useBgRemoval(
		activeOperation === "bg-removal",
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const addMoreInputRef = useRef<HTMLInputElement>(null);
	const [resultAnnouncement, setResultAnnouncement] = useState("");

	const isBgRemovalLoading = modelPreloadStatus === "loading";
	const canRunBgRemoval = modelPreloadStatus === "ready" || modelPreloadStatus === "error";
	const anyProcessing = batchRunning || items.some((i) => i.status === "processing");
	const isApplyDisabled =
		anyProcessing ||
		!activeItem ||
		activeItem.status === "loading" ||
		(activeOperation === "bg-removal" && !canRunBgRemoval);
	const isBatchDisabled =
		anyProcessing || selectedIds.length === 0 || (activeOperation === "bg-removal" && !canRunBgRemoval);

	const doneSelected = getSelectedDoneItems(items, selectedIds);
	const selectedItems = items.filter((item) => selectedIds.includes(item.id));
	const showMultiPreview = selectedItems.length > 1;

	useEffect(() => {
		detectFormatSupport().then((support) => {
			$supportedFormats.set(support);
			if (!isFormatSupported(support, $outputFormat.get())) {
				const fallback = CONVERT_FORMATS.find((f) => isFormatSupported(support, f)) ?? "png";
				$outputFormat.set(fallback);
			}
		});
	}, []);

	useEffect(() => {
		if (activeItem?.status === "done" && activeItem.resultBlob) {
			setResultAnnouncement(
				`Processamento concluido. Arquivo resultante: ${formatFileSize(activeItem.resultBlob.size)}.`,
			);
		}
	}, [activeItem?.status, activeItem?.resultBlob]);

	const handleFileSelect = useCallback(async (files: FileList | null) => {
		if (!files?.length) return;
		await addSources(files);
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (addMoreInputRef.current) addMoreInputRef.current.value = "";
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			void handleFileSelect(e.dataTransfer.files);
		},
		[handleFileSelect],
	);

	const handleDownloadSingle = useCallback(() => {
		const item = doneSelected[0] ?? (activeItem?.status === "done" ? activeItem : null);
		if (!item?.resultBlob || !item.resultUrl || !item.lastOperation) return;

		const a = document.createElement("a");
		a.href = item.resultUrl;
		a.download = buildDownloadFilename(
			item.file.name,
			item.resultBlob,
			item.lastOperation,
			item.lastOperation === "convert" ? outputFormat : undefined,
		);
		a.click();
	}, [doneSelected, activeItem, outputFormat]);

	const handleDownloadZip = useCallback(async () => {
		try {
			await downloadProcessedZip(items, selectedIds, outputFormat);
		} catch (err) {
			$error.set((err as Error).message || "Falha ao gerar o ZIP.");
		}
	}, [items, selectedIds, outputFormat]);

	const handleUseResultAsSource = useCallback(async () => {
		if (!activeItem?.resultBlob || !activeItem.lastOperation) return;

		const filename = buildDownloadFilename(
			activeItem.file.name,
			activeItem.resultBlob,
			activeItem.lastOperation,
			activeItem.lastOperation === "convert" ? outputFormat : undefined,
		);
		await replaceItemWithBlob(activeItem.id, activeItem.resultBlob, filename);
	}, [activeItem, outputFormat]);

	const handleCancel = useCallback(() => {
		if (activeOperation === "bg-removal") {
			cancelBgRemoval();
		} else {
			cancelAll();
		}
	}, [activeOperation, cancelBgRemoval]);

	const handleExecute = useCallback(async () => {
		if (!activeItem || !activeOperation) return;

		switch (activeOperation) {
			case "convert":
				await convert(activeItem.id, outputFormat, quality);
				break;
			case "compress":
				await compress(activeItem.id, quality, compressMaxWidth);
				break;
			case "bg-removal":
				removeBackground(activeItem.id);
				break;
		}
	}, [activeItem, activeOperation, outputFormat, quality, compressMaxWidth, convert, compress, removeBackground]);

	const handleBatchExecute = useCallback(async () => {
		if (!activeOperation || selectedIds.length === 0) return;

		switch (activeOperation) {
			case "convert":
				await runBatchOnSelected("convert", {
					format: outputFormat,
					quality,
					maxWidth: compressMaxWidth,
				});
				break;
			case "compress":
				await runBatchOnSelected("compress", {
					format: outputFormat,
					quality,
					maxWidth: compressMaxWidth,
				});
				break;
			case "bg-removal":
				await runBgRemovalBatchOnSelected();
				break;
		}
	}, [
		activeOperation,
		selectedIds.length,
		outputFormat,
		quality,
		compressMaxWidth,
		runBatchOnSelected,
		runBgRemovalBatchOnSelected,
	]);

	if (!hasItems) {
		return (
			<div className="flex flex-col gap-4 w-full">
				<ModelPreloadBanner status={modelPreloadStatus} progress={modelPreloadProgress} onRetry={retryPreload} />
				<UploadZone onFileSelect={handleFileSelect} onDrop={handleDrop} fileInputRef={fileInputRef} error={error} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			<ModelPreloadBanner status={modelPreloadStatus} progress={modelPreloadProgress} onRetry={retryPreload} />
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{resultAnnouncement}
			</div>

			<div className="flex flex-col gap-4">
				<ImageQueue
					items={items}
					activeItemId={activeItem?.id ?? null}
					selectedIds={selectedIds}
					anyProcessing={anyProcessing}
					addMoreInputRef={addMoreInputRef}
					onFileSelect={handleFileSelect}
				/>
				<WorkspacePanel
					activeItem={activeItem}
					selectedItems={selectedItems}
					selectedIds={selectedIds}
					showMultiPreview={showMultiPreview}
					doneSelectedCount={doneSelected.length}
					activeOperation={activeOperation}
					outputFormat={outputFormat}
					quality={quality}
					compressMaxWidth={compressMaxWidth}
					supportedFormats={supportedFormats}
					modelPreloadStatus={modelPreloadStatus}
					anyProcessing={anyProcessing}
					batchRunning={batchRunning}
					batchProgress={batchProgress}
					error={error}
					isBgRemovalLoading={isBgRemovalLoading}
					isApplyDisabled={isApplyDisabled}
					isBatchDisabled={isBatchDisabled}
					onCancel={handleCancel}
					onExecute={() => void handleExecute()}
					onBatchExecute={() => void handleBatchExecute()}
					onDownloadSingle={handleDownloadSingle}
					onDownloadZip={() => void handleDownloadZip()}
					onUseResultAsSource={() => void handleUseResultAsSource()}
				/>
			</div>
		</div>
	);
}
