import { isNullOrUndefined } from 'util';
import { missingFrom, tooManyFroms, missingToForFrom, toExtNotAllowedForFrom, missingToExtForFromExt, toNotAllowedForFromExt } from './errorMessages';

function normalizeExtension(extension) {
    return extension.startsWith(`.`) ? extension : `.${extension}`;
}

function verifyTargets(targets) {
    for (const target of targets) {
        // General checks
        if (isNullOrUndefined(target.from) && isNullOrUndefined(target.fromExt)) {
            throw new Error(missingFrom(target))
        }
        if (!isNullOrUndefined(target.from) && !isNullOrUndefined(target.fromExt)) {
            throw new Error(tooManyFroms(target));
        }

        // 'from' checks
        if (!isNullOrUndefined(target.from) && isNullOrUndefined(target.to)) {
            throw new Error(missingToForFrom(target));
        }
        if (!isNullOrUndefined(target.from) && !isNullOrUndefined(target.toExt)) {
            throw new Error(toExtNotAllowedForFrom(target));
        }

        // 'fromExt' checks
        if (!isNullOrUndefined(target.fromExt) && isNullOrUndefined(target.toExt)) {
            throw new Error(missingToExtForFromExt(target));
        }
        if (!isNullOrUndefined(target.fromExt) && !isNullOrUndefined(target.to)) {
            throw new Error(toNotAllowedForFromExt(target));
        }
    }
}

export default function redirect(options = {}) {
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
