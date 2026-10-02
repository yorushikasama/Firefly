import {
	createCipheriv,
	createHmac,
	pbkdf2Sync,
	randomBytes,
} from "node:crypto";

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

/**
 * Derive deterministic bytes from a key and context string using HMAC-SHA256.
 */
function deriveBytes(key: string, context: string, length: number): Buffer {
	return createHmac("sha256", key).update(context).digest().subarray(0, length);
}

/**
 * Encrypt HTML content with AES-256-GCM using PBKDF2-derived key.
 *
 * Salt is deterministic (derived from password + slug) while the IV is freshly
 * random per encryption. GCM only requires IV uniqueness under the same key:
 * a deterministic IV across builds would let two ciphertexts of related
 * plaintexts cancel out (GCM forbidden attack), so the IV must stay random.
 * The deterministic salt keeps the derived key stable across rebuilds, so a
 * sessionStorage-cached password keeps working after content-free redeploy.
 *
 * Output format: base64(salt[16] + iv[12] + authTag[16] + ciphertext)
 */
export function encryptContent(
	html: string,
	password: string,
	slug: string,
): string {
	const salt = deriveBytes(password, `salt:${slug}`, SALT_LENGTH);
	const iv = randomBytes(IV_LENGTH);
	const key = pbkdf2Sync(
		password,
		salt,
		PBKDF2_ITERATIONS,
		KEY_LENGTH,
		"sha256",
	);

	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(html, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	const result = Buffer.concat([salt, iv, authTag, encrypted]);
	return result.toString("base64");
}
