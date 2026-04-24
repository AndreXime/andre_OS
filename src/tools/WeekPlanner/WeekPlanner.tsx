import { useStore } from "@nanostores/react";
import { useMemo } from "react";
import { getWeekStats } from "./plannerDomain";
import { weekPlan$ } from "./store";
import { WeekPlannerView } from "./WeekPlannerView";

export default function WeekPlanner() {
	const plan = useStore(weekPlan$);
	const { blocks: totalBlocks, hoursLabel } = useMemo(() => getWeekStats(plan), [plan]);

	return (
		<div className="min-h-dvh w-full bg-zinc-800">
			<WeekPlannerView plan={plan} totalBlocks={totalBlocks} hoursLabel={hoursLabel} />
		</div>
	);
}
