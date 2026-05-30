/* Allow TypeScript to import .scss / .css files as side-effects */
declare module '*.scss' {
	const content: Record<string, string>;
	export default content;
}
declare module '*.css' {
	const content: Record<string, string>;
	export default content;
}
