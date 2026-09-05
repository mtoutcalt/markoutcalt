/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		/** True when the request's `Accept` header prefers `text/markdown`. */
		prefersMarkdown: boolean;
	}
}
