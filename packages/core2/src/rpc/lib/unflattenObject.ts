/**
 * The following code is a modified version of `nested` from `borm/nest-deep` on
 * GitHub.
 *
 * Source:
 * https://github.com/borm/nest-deep/blob/3d73310a119c41706d08338110bac3f5906827a7/src/nested.ts
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValueType = any;

type SerializerObjectType = {
	[key: string]: ValueType;
};

type ResultArrayType =
	| (ResultObjectType | ValueType)[]
	| (ResultObjectType | ValueType)[][];

interface ResultObjectType {
	[key: string]: ValueType | ResultObjectType | ResultArrayType;
}

const REGEX = /\.?([^.\[\]]+)|\[(\d+)\]/g;

export const unflattenObject = (
	object: SerializerObjectType,
): ResultObjectType => {
	const result: ResultObjectType = {};

	const keys = Object.keys(object);
	for (const key of keys) {
		let current = result;
		let prop = "";
		let m;
		// tslint:disable-next-line:no-conditional-assignment
		while ((m = REGEX.exec(key))) {
			current = current[prop] || (current[prop] = m[2] ? [] : {});
			prop = m[2] || m[1];
		}
		current[prop] = object[key];
	}

	return (result[""] as ResultObjectType) || result;
};
