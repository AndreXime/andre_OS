import { useEffect, useRef, useState } from "react";
import { Pane } from "./Components";
import { ASCII_LOGO_PART1, ASCII_LOGO_PART2 } from "./data";

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

function randomStep(maxUnits: number) {
	return Math.floor(Math.random() * maxUnits) + 1;
}

function maybeFlipDirection(dirRef: { current: 1 | -1 }, probability: number) {
	if (Math.random() < probability) {
		dirRef.current = dirRef.current === 1 ? -1 : 1;
	}
}

export default function DevEnvHeader() {
	const [cpuLoad, setCpuLoad] = useState(45);
	const [tempC, setTempC] = useState(62);
	const cpuDirRef = useRef<1 | -1>(1);
	const tempDirRef = useRef<1 | -1>(-1);

	const cpuMin = 35;
	const cpuMax = 65;
	const tempMin = 55;
	const tempMax = 70;

	useEffect(() => {
		const tickMs = 1000;
		const maxJump = 2;
		const reverseChance = 0.4;

		const timer = setInterval(() => {
			maybeFlipDirection(cpuDirRef, reverseChance);
			maybeFlipDirection(tempDirRef, reverseChance);

			const cpuStep = randomStep(maxJump);
			const tempStep = randomStep(maxJump);

			setCpuLoad((prev) => {
				let next = prev + cpuDirRef.current * cpuStep;
				if (next >= cpuMax) {
					next = cpuMax;
					cpuDirRef.current = -1;
				} else if (next <= cpuMin) {
					next = cpuMin;
					cpuDirRef.current = 1;
				}
				return next;
			});

			setTempC((prev) => {
				let next = prev + tempDirRef.current * tempStep;
				if (next >= tempMax) {
					next = tempMax;
					tempDirRef.current = -1;
				} else if (next <= tempMin) {
					next = tempMin;
					tempDirRef.current = 1;
				}
				return next;
			});
		}, tickMs);

		return () => clearInterval(timer);
	}, []);

	const cpuWidthPct = clamp(cpuLoad, 0, 100);
	const tempSpan = tempMax - tempMin;
	const tempWidthPct = tempSpan === 0 ? 0 : ((clamp(tempC, tempMin, tempMax) - tempMin) / tempSpan) * 100;

	return (
		<header className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2 border border-[#1f521f] p-4 flex flex-col justify-center">
				<div className="flex flex-row flex-wrap gap-2 md:gap-4 items-end">
					<pre className="text-[0.6rem] md:text-xs leading-none text-[#33ff00] drop-shadow-[0_0_5px_rgba(51,255,0,0.5)] shrink-0">
						{ASCII_LOGO_PART1}
					</pre>
					<pre className="text-[0.6rem] md:text-xs leading-none text-[#33ff00] drop-shadow-[0_0_5px_rgba(51,255,0,0.5)] shrink-0">
						{ASCII_LOGO_PART2}
					</pre>
				</div>
				<div className="mt-4 text-xs border-t border-dashed border-[#1f521f] pt-2 flex justify-between">
					<span>USER: dev@workstation</span>
					<span>HOST: local-unix-x86_64</span>
					<span>UPTIME: 99.9%</span>
				</div>
			</div>

			<Pane title="SYSINFO">
				<div className="space-y-2 text-xs">
					<div className="flex justify-between">
						<span>OS:</span>
						<span className="text-[#ffb000]">DEBIAN/LINUX</span>
					</div>
					<div className="flex justify-between">
						<span>SHELL:</span>
						<span>ZSH v5.9</span>
					</div>
					<div className="flex justify-between">
						<span>ARCH:</span>
						<span>x86_64 (Intel 64-bit)</span>
					</div>

					<div className="mt-4 grid grid-cols-[minmax(0,1fr)_140px_3.75rem] items-center gap-x-2 gap-y-1">
						<span>CPU</span>
						<div className="cpu-rail shrink-0" aria-hidden="true">
							<div className="cpu-loader" style={{ width: `${cpuWidthPct}%` }} />
						</div>
						<span className="text-right tabular-nums">{cpuLoad}%</span>
						<span className="text-[#ffb000]">TEMP</span>
						<div className="cpu-rail shrink-0" aria-hidden="true">
							<div className="cpu-loader" style={{ width: `${tempWidthPct}%` }} />
						</div>
						<span className="text-right tabular-nums text-[#ffb000]">{tempC}°C</span>
					</div>
				</div>
			</Pane>
		</header>
	);
}
