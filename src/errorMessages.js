export const missingFrom = () => 'Missing \'from\' or \'fromExt\'';

export const tooManyFroms = () => 'Cannot specify both \'from\' and \'fromExt\'';

export const missingToForFrom = (target) => `Missing 'to' for 'from' "${target.from}"`;

export const toExtNotAllowedForFrom = (target) => `Cannot specify 'toExt' for 'from' "${target.from}" - use 'fromExt' or 'to' instead`;

export const missingToExtForFromExt = (target) => `Missing 'toExt' for 'fromExt' "${target.fromExt}"`;

export const toNotAllowedForFromExt = (target) => `Cannot specify 'to' for 'fromExt' "${target.fromExt}" - use 'from' or 'toExt' instead`;
