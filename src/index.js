import { isNullOrUndefined } from 'util';
import {
    missingFrom,
    tooManyFroms,
    missingToForFrom,
    toExtNotAllowedForFrom,
    missingToExtForFromExt,
    toNotAllowedForFromExt
} from './errorMessages';

function normalizeExtension(extension) {
    return extension.startsWith(`.`) ? extension : `.${extension}`;
}

function verifyTargets(targets) {
    targets.forEach(target => {
        // General checks
        if (isNullOrUndefined(target.from) && isNullOrUndefined(target.fromExt)) {
            throw new Error(missingFrom(target));
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
    });
}

export default function redirect(options = {}) {
    const {
        targets: inputTargets = [],
        verbose = false
    } = options;

    verifyTargets(inputTargets);

    const targets = inputTargets.map(target => {
        if (target.fromExt) {
            return {
                from: `^(.*)\\${normalizeExtension(target.fromExt)}(.*)$`,
                to: `$1${normalizeExtension(target.toExt)}$2`
            };
        }
        return target;
    });

    return {
        name: `redirect-files`,
        async resolveId(id, importer) {
            let groups;
            const target = targets.find(t => {
                const result = id.match(t.from);
                if (result) {
                    groups = Array.from(result);
                    return true;
                }
                return false;
            });

            if (target) {
                const newId = target.to.replace(/\$[0-9]+/g, v => groups[+v.substring(1)]);
                const resolved = await this.resolve(newId, importer);
                this.addWatchFile(resolved);
                if (verbose) {
                    // eslint-disable-next-line no-console
                    console.log(`Redirect: ${id} -> ${newId}`);
                }
                return resolved;
            }

            return null;
        }
    };
}
