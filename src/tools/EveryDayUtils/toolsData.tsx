import { DollarSign, Fuel, Lock, type LucideIcon, Percent } from "lucide-react";
import type { ComponentType } from "react";
import FuelCost from "./tools/FuelCost";
import Investiment from "./tools/Investiment";
import Password from "./tools/Password";
import PercentageCalculator from "./tools/PercentageCalculator";

export interface ToolListItem {
	title: string;
	icon: LucideIcon;
	component: ComponentType;
}

export const tools: ReadonlyArray<ToolListItem> = [
	{ title: "Gerador de Orçamento de Combustível", icon: Fuel, component: FuelCost },
	{ title: "Calculadora de renda passiva", icon: DollarSign, component: Investiment },
	{
		title: "Calculos de porcentagem",
		icon: Percent,
		component: PercentageCalculator,
	},
	{ title: "Gerador de Senhas", icon: Lock, component: Password },
];
