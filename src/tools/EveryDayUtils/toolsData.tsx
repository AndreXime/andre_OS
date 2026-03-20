import { DollarSign, Fuel, Lock, type LucideIcon, Percent } from "lucide-react";
import type { ComponentType } from "react";
import FuelCost from "./tools/FuelCost";
import Investiment from "./tools/Investiment";
import PercentageCalculator from "./tools/PercentageCalculator";
import Password from "./tools/Password";

export const ColorThemes: Record<string, ToolThemeSchema> = {
	Emerald: {
		alias: "green",
		icon: "text-emerald-500",
		text: "text-emerald-400",
		border: "border-emerald-500/20",
		softBg: "bg-emerald-500/10",
		button: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20",
		ring: "focus:ring-emerald-500",
	},
	Blue: {
		alias: "blue",
		icon: "text-blue-500",
		text: "text-blue-400",
		border: "border-blue-500/20",
		softBg: "bg-blue-500/10",
		button: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20",
		ring: "focus:ring-blue-500",
	},
	Indigo: {
		alias: "indigo",
		icon: "text-indigo-500",
		text: "text-indigo-400",
		border: "border-indigo-500/20",
		softBg: "bg-indigo-500/10",
		button: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20",
		ring: "focus:ring-indigo-500",
	},
	Orange: {
		alias: "orange",
		icon: "text-orange-500",
		text: "text-orange-400",
		border: "border-orange-500/20",
		softBg: "bg-orange-500/10",
		button: "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20",
		ring: "focus:ring-orange-500",
	},
};

export const toolCategories: ToolCategory[] = [
	{
		name: "Matemática e Finanças",
		theme: ColorThemes.Emerald,
		tools: [
			{ title: "Gerador de Orçamento de Combustível", icon: Fuel, component: FuelCost },
			{ title: "Calculadora de renda passiva", icon: DollarSign, component: Investiment },
		],
	},
	{
		name: "Produtividade",
		theme: ColorThemes.Blue,
		tools: [
			{
				title: "Calculos de porcentagem",
				icon: Percent,
				component: PercentageCalculator,
			},
		],
	},
	{
		name: "Utilitários Web e Dev",
		theme: ColorThemes.Indigo,
		tools: [{ title: "Gerador de Senhas", icon: Lock, component: Password }],
	},
];

export type ToolThemeSchema = {
	alias: string;
	icon: string;
	text: string;
	border: string;
	softBg: string;
	button: string;
	ring: string;
};

export interface ActiveTool extends ToolListItem {
	colors: ToolThemeSchema;
}

interface ToolListItem {
	title: string;
	icon: LucideIcon;
	component: ComponentType<{ colors: ToolThemeSchema }>;
}

interface ToolCategory {
	name: string;
	theme: ToolThemeSchema;
	tools: ToolListItem[];
}
