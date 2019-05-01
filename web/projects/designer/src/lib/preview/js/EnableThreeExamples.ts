// Set THREE as global variable, because it's required by the
// OrbitControls. Use a TS file, because JS will be
// omitted by ng-packgagr, when loaded from a component. And it needs
// to be loaded from a component, because require will not be available,
// if used from angular.json (besides not being packaged in the library).

// Declare 'require' again
declare function require(name:string);

// Set the THREEload variable, because require needs
// to be outside eval to work properly
let THREEload = require('three');

// Set the global variable in eval, because it's
// not possible in TypeScript.
eval("THREE = THREEload;")