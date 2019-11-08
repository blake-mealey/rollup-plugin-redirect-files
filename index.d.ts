import rollup from 'rollup';

interface RedirectTarget {
    /**
     * A regular expression or string to match files with. If supplied,
     * cannot supply `fromExt` or `toExt` and must supply `to`.
     * @default undefined
     */
    readonly from?: RegExp | string,

    /**
     * A string to redirect files to. Use $0 to reference the full match of
     * the `from` regex, and $n, n >= 1 to access the capture groups of the
     * `from` regex.
     * @default undefined
     */
    readonly to?: string,

    /**
     * A file extension to match files with. May or may not start with '.'
     * (style choice). If supplied, cannot supply `from` or `to` and must
     * supply `toExt`.
     * @default undefined
     */
    readonly fromExt?: string,

    /**
     * A file extension to redirect files to. May or may not start with '.'
     * (style choice).
     * @default undefined
     */
    readonly toExt?: string
}

interface RedirectOptions {
    /**
     * Array of targets to redirect.
     * @default []
     */
    readonly targets?: Array<RedirectTarget>;

    /**
     * Output redirected files to console.
     * @default false
     */
    readonly verbose?: boolean;
}

/**
 * Redirect file imports using Rollup.js
 */
export default function redirect(options?: RedirectOptions): rollup.Plugin;
