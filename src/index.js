import { isNullOrUndefined } from 'util';

function normalizeExtension(extension) {
    return extension.startsWith(`.`) ? extension : `.${extension}`;
}

function verifyTargets(targets) {
    for (const target of targets) {
        // General checks
        if (isNullOrUndefined(target.from) && isNullOrUndefined(target.fromExt)) {
            throw new Error(`Missing 'from' or 'fromExt'`)
        }
        if (target.from && target.fromExt) {
            throw new Error(`Cannot specify both 'from' and 'fromExt'`);
        }

        // 'from' checks
        if (target.from && isNullOrUndefined(target.to)) {
            throw new Error(`Missing 'to' for 'from' "${target.from}"`);
        }
        if (target.from && target.toExt) {
            throw new Error(`Cannot specify 'toExt' for 'from' "${target.from}" - use 'fromExt' or 'to' instead`);
        }

        // 'fromExt' checks
        if (target.fromExt && isNullOrUndefined(target.toExt)) {
            throw new Error(`Missing 'toExt' for 'fromExt' "${target.fromExt}"`);
        }
        if (target.fromExt && target.to) {
            throw new Error(`Cannot specify 'to' for 'fromExt' "${target.fromExt}" - use 'from' or 'toExt' instead`);
        }
    }
}

export default function redirect(options) {
    const {
        targets = [],
        verbose = false
    } = options;

    verifyTargets(targets);

    for (const target of targets) {
        if (target.fromExt) {
            target.from = `^(.*)\\${normalizeExtension(target.fromExt)}(.*)$`;
            target.to = `$1${normalizeExtension(target.toExt)}$2`;
        }
    }

    return {
        async resolveId(id, importer) {
            for (const target of targets) {
                const result = id.match(target.from);
                if (result) {
                    const groups = Array.from(result);
                    const newId = target.to.replace(/\$[0-9]+/g, v => groups[+v.substring(1)]);
                    const resolved = await this.resolve(newId, importer);
                    this.addWatchFile(resolved);
                    if (verbose) {
                        console.log(`Redirect: ${id} -> ${newId}`);
                    }
                    return resolved;
                }
            }
            return null;
        }
    };
}
