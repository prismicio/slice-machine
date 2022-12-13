/**
 * The following code is a modified version of `flatten` from `borm/nest-deep`
 * on GitHub.
 *
 * Source:
 * https://github.com/borm/nest-deep/blob/3d73310a119c41706d08338110bac3f5906827a7/src/flatten.ts
 *
 * MIT License
 *
 * Copyright (c) 2019 Dmitry Efimenko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const typeOf = (operand: unknown): string => {
	return Object.prototype.toString.call(operand).slice(8, -1).toLowerCase();
};

const isArray = (array: unknown): array is unknown[] => {
	return typeOf(array) === "array";
};

const isObject = (object: unknown): object is Record<PropertyKey, unknown> => {
	return typeOf(object) === "object";
};

export const flattenObject = (
	obj: Record<string, unknown>,
): Record<string, unknown> => {
	if (!isObject(obj)) {
		throw new Error();
	}

	const recur = (
		accumulator: Record<string, unknown>,
		key: string,
		value: unknown,
	): Record<string, unknown> => {
		if (isObject(value)) {
			const objKeys = Object.keys(value);
			if (objKeys.length) {
				objKeys.forEach((v) => {
					recur(accumulator, `${key}.${v}`, value[v]);
				});

				return accumulator;
			}
		}

		if (isArray(value)) {
			if (value.length) {
				value.forEach((v, i) => {
					recur(accumulator, `${key}[${i}]`, v);
				});

				return accumulator;
			}
		}

		accumulator[key] = value;

		return accumulator;
	};

	return Object.keys(obj).reduce(
		(accumulator, key) => ({
			...accumulator,
			...recur(accumulator, key, obj[key]),
		}),
		{},
	);
};
