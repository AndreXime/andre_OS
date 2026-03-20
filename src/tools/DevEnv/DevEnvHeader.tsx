import { useEffect, useRef, useState } from "react";
import { Pane } from "./Components";
import { ASCII_LOGO } from "./data";

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
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
		const cpuStep = 1;
		const tempStep = 1;

		const timer = setInterval(() => {
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

	const cpuProgress = clamp(cpuLoad, 0, 100) / 100; // 0..1
	const tempProgress = (clamp(tempC, tempMin, tempMax) - tempMin) / (tempMax - tempMin); // 0..1

	return (
		<header className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2 border border-[#1f521f] p-4 flex flex-col justify-center">
				<pre className="text-[0.6rem] md:text-xs leading-none text-[#33ff00] drop-shadow-[0_0_5px_rgba(51,255,0,0.5)]">
					{ASCII_LOGO}
				</pre>
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

					<div className="mt-4">
						<div className="mb-1 flex justify-between">
							<span>CPU LOAD</span>
							<span className="flex items-center gap-2">
								<div className="cpu-rail" aria-hidden="true">
									<div
										className="cpu-loader"
										style={{ ["--progress" as string]: cpuProgress } as React.CSSProperties}
									/>
								</div>
								<span> {cpuLoad}%</span>
							</span>
						</div>
						<div className="flex justify-between text-[#ffb000]">
							<span>TEMP</span>
							<span className="flex items-center gap-2">
								<div className="cpu-rail" aria-hidden="true">
									<div
										className="cpu-loader"
										style={{ ["--progress" as string]: tempProgress } as React.CSSProperties}
									/>
								</div>
								<span>{tempC}°C</span>
							</span>
						</div>
					</div>
				</div>
			</Pane>
		</header>
	);
}
