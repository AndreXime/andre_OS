import type { ComponentType } from "react";
import WebEditor from "./editor/App";

export const toolRegistry = {
	WebCodeEditor: WebEditor,
} as Record<string, ComponentType>;
