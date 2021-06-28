
export function getDefineCallForElement(cem, tagName) {
  let result = undefined;

  cem?.modules?.forEach(_module => {
    _module?.exports?.forEach(ex => {
      if (ex.kind === 'custom-element-definition' && ex.name === tagName) result = _module.path;
    });
  });

  return result;
}

export function camelize(str) {
  const arr = str.split('-');
  const capital = arr.map((item, index) =>
    index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item.toLowerCase(),
  );
  return capital.join('');
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const createEventName = event => `on${capitalizeFirstLetter(camelize(event.name))}`;


export const has = arr => Array.isArray(arr) && arr.length > 0;

export const RESERVED_WORDS = [
  'children',
  'localName',
  'ref',
  'style',
  'className',
  'abstract',
  'arguments',
  'await',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'function',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'int',
  'interface',
  'let',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'volatile',
  'while',
  'with',
  'yield',
];