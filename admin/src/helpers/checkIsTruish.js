const truishValues = new Set([true, 1, '1', 'true']);

export const checkIsTruish = (value) => truishValues.has(value);
