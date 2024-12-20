import { Word } from "./Word";
import { LogoPaths } from "./paths";

export default function EchochambersLogo() {
	return (
		<div className="flex justify-center items-center w-full overflow-visible">
			<svg
				viewBox="-0 -12 1000 111"
				className="w-full max-w-[1400px] h-auto overflow-visible">
				<g>
					<Word
						paths={LogoPaths.echo}
						color="currentColor"
						baseDelay={0}
					/>
				</g>
				<g>
					<Word
						paths={LogoPaths.chambers}
						color="currentColor"
						baseDelay={0.6}
					/>
				</g>
				<rect
					x="945"
					y="66"
					width="60"
					height="12"
					fill="#ffffff48"
					className="animate-[blink_1s_infinite]">
					<animate
						attributeName="opacity"
						values="0;1;0"
						dur="1s"
						repeatCount="indefinite"
					/>
				</rect>
			</svg>
		</div>
	);
}
