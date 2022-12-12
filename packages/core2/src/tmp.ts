type AppendDotPathSegment<
	TPath extends string,
	TSegment extends string,
> = TPath extends "" ? TSegment : `${TPath}.${TSegment}`;

type AllObjDotPaths<TObj, TPath extends string = ""> = TObj extends Record<
	PropertyKey,
	unknown
>
	? {
			[P in keyof TObj]: P extends string
				?
						| AppendDotPathSegment<TPath, P>
						| AllObjDotPaths<TObj[P], AppendDotPathSegment<TPath, P>>
				: TPath;
	  }[keyof TObj]
	: TPath;

type RecursiveOmitNested<
	TObj,
	TOmitPath extends string,
	TPath extends string = "",
> = TObj extends Record<string, unknown>
	? {
			[P in keyof TObj as P extends string
				? AppendDotPathSegment<TPath, P> extends TOmitPath
					? never
					: P
				: never]: P extends string
				? RecursiveOmitNested<
						TObj[P],
						TOmitPath,
						AppendDotPathSegment<TPath, P>
				  >
				: TObj[P];
	  }
	: TObj;

type OmitNested<
	TObj extends Record<string, unknown>,
	TOmitPath extends AllObjDotPaths<TObj>,
> = RecursiveOmitNested<TObj, TOmitPath>;

type TestArgs<TFoo extends string> = {
	foo: TFoo[];
};
const test = <TFoo extends string>(args: TestArgs<TFoo>): TFoo[] => {
	return args.foo;
};

const x = test({ foo: ["bar", "baz"] });

// type X = {
// 	foo: {
// 		bar: "baz";
// 		abc: "baz";
// 		methodA: () => void;
// 		methodB: () => void;
// 		array: [1, 2, 3];
// 		whut: {
// 			are: "you";
// 		};
// 	};
// 	qux: "quux";
// };
// type Y = OmitNested<X, "foo.whut.are" | "qux" | "foo.methodA" | "foo.array">;
