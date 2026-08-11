import { useState } from "react";
import { toolSegmentTabClass, toolTabBarClass } from "@/lib/toolUi";
import { ReceivePanel } from "./ui/ReceivePanel";
import { TransmitPanel } from "./ui/TransmitPanel";

type TabId = "transmit" | "receive";

export default function QrStreamView() {
	const [tab, setTab] = useState<TabId>("transmit");

	return (
		<div className="flex flex-col gap-md">
			<div className={toolTabBarClass} role="tablist" aria-label="Modo da ferramenta">
				<button
					type="button"
					role="tab"
					aria-selected={tab === "transmit"}
					className={toolSegmentTabClass(tab === "transmit")}
					onClick={() => setTab("transmit")}
				>
					Transmitir
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={tab === "receive"}
					className={toolSegmentTabClass(tab === "receive")}
					onClick={() => setTab("receive")}
				>
					Receber
				</button>
			</div>

			{tab === "transmit" ? <TransmitPanel /> : <ReceivePanel />}
		</div>
	);
}
