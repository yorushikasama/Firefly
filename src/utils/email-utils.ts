/**
 * 邮箱链接 base64 加密工具，防止爬虫直接抓取邮箱地址。
 *
 * 用法（与 Profile / 横幅链接一致）：
 * - 渲染时：href 用 "#"，data-encoded-email 用 encodeMailto(url) 的返回值；
 * - 点击时：内联 onclick 执行 MAILTO_ONCLICK_SCRIPT 解码并跳转。
 */

// 加密邮箱（去掉 "mailto:" 前缀后 base64 编码，SSR 侧使用）
export function encodeMailto(url: string): string {
	return Buffer.from(url.replace("mailto:", "")).toString("base64");
}

// 邮箱链接的点击解密脚本（内联 onclick 使用；base64 存的是 UTF-8 字节，需 TextDecoder 还原）
export const MAILTO_ONCLICK_SCRIPT =
	"(function(){var e=this.getAttribute('data-encoded-email');this.href='mailto:'+new TextDecoder().decode(Uint8Array.from(atob(e),function(c){return c.charCodeAt(0)}));this.removeAttribute('data-encoded-email');this.removeAttribute('onclick');this.click();return false;}).call(this);";
