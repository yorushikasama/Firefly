// 生成导航栏 Logo（Yuzuriha Inori 主题）：五柱音频波形，纯矢量参数化绘制。
//
// 设计要点（改动前请先看这份说明）：
// - 导航栏实际渲染尺寸只有 28×28 CSS px（Navbar.astro 的 h-7 w-7）。因此层次感
//   必须靠「整根柱子的不透明度分级」表达；柱内部的渐变在 28px 下会糊掉，只能作为
//   辅助的端点柔化。
// - 输出单色（浅色主题纯黑 / 深色主题纯白），配合 Navbar 的 dark:hidden 切换，
//   因此不需要额外的配色分支。
// - 尺寸 256×256 是给 Astro <Picture> 的 widths=[28,56] 留出 2x/4x 余量。
//
// 用法：pnpm logo
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DEST_DIR = path.join("src", "assets", "images", "logo");
const OUTPUT_SIZE = 256;

/** 绘制视口边长（SVG viewBox 与坐标都以它为单位） */
const VIEWBOX = 100;
/** 柱数（奇数，中间那根是主拍） */
const BAR_COUNT = 5;
/** 柱宽与柱间距（视口单位） */
const BAR_WIDTH = 10;
const BAR_GAP = 10;
/** 各柱高度包络：正弦形，中间最高，镜像对称 */
const HEIGHTS = [32, 60, 80, 60, 32];
/** 各柱整体不透明度：靠这一层做「层次感」，两端淡、中间实 */
const OPACITIES = [0.38, 0.7, 1, 0.7, 0.38];
/** 柱内端点渐隐比例（1 表示不渐隐）；只做柔化，不足以独立承担层次 */
const TIP_FADE = 0.72;
/** 中间柱向四周外扩的像素量，用于强调主拍 */
const ACCENT_GROW = 1.0;
/** 图形占画布的比例，留出呼吸空间 */
const INSET = 0.88;

interface LogoVariant {
	file: string;
	fill: string;
}

const VARIANTS: LogoVariant[] = [
	{ file: "yuzuriha-light.png", fill: "#000000" },
	{ file: "yuzuriha-dark.png", fill: "#ffffff" },
];

function buildWaveSvg(fill: string): string {
	const totalWidth = BAR_COUNT * BAR_WIDTH + (BAR_COUNT - 1) * BAR_GAP;
	const scale = (VIEWBOX * INSET) / totalWidth;
	const centerY = VIEWBOX / 2;
	const originX = (VIEWBOX - totalWidth * scale) / 2;
	const midIndex = Math.floor(BAR_COUNT / 2);

	const defs: string[] = [];
	const bars: string[] = [];

	for (let i = 0; i < BAR_COUNT; i++) {
		const grow = i === midIndex ? ACCENT_GROW : 0;
		const width = (BAR_WIDTH + grow * 2) * scale;
		const height = (HEIGHTS[i] + grow * 2) * scale;
		const x = originX + (i * (BAR_WIDTH + BAR_GAP) - grow) * scale;
		const y = centerY - height / 2;
		const radius = width / 2;
		const opacity = OPACITIES[i];
		const gradientId = `bar-${i}`;

		defs.push(
			`<linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">` +
				`<stop offset="0" stop-color="${fill}" stop-opacity="${(opacity * TIP_FADE).toFixed(4)}"/>` +
				`<stop offset="0.4" stop-color="${fill}" stop-opacity="${opacity.toFixed(4)}"/>` +
				`<stop offset="0.6" stop-color="${fill}" stop-opacity="${opacity.toFixed(4)}"/>` +
				`<stop offset="1" stop-color="${fill}" stop-opacity="${(opacity * TIP_FADE).toFixed(4)}"/>` +
				"</linearGradient>",
		);
		bars.push(
			`<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${width.toFixed(3)}" height="${height.toFixed(3)}" rx="${radius.toFixed(3)}" fill="url(#${gradientId})"/>`,
		);
	}

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" width="${VIEWBOX}" height="${VIEWBOX}">` +
		`<defs>${defs.join("")}</defs>${bars.join("")}</svg>`
	);
}

async function main(): Promise<void> {
	await fs.promises.mkdir(DEST_DIR, { recursive: true });

	for (const variant of VARIANTS) {
		const svg = buildWaveSvg(variant.fill);
		const output = path.join(DEST_DIR, variant.file);
		await sharp(Buffer.from(svg), { density: 1200 })
			.resize(OUTPUT_SIZE, OUTPUT_SIZE, {
				fit: "contain",
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png({ compressionLevel: 9 })
			.toFile(output);

		const { size } = await fs.promises.stat(output);
		console.log(`wrote ${output}  ${OUTPUT_SIZE}x${OUTPUT_SIZE}  ${size}B`);
	}
}

main().catch((error: unknown) => {
	console.error("FAILED", error);
	process.exit(1);
});
