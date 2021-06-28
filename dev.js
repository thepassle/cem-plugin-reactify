import fs from 'fs';
import ts from 'typescript';
import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import reactify from './index.js';

const code = fs.readFileSync('fixtures/generic-switch.js').toString();

const modules = [ts.createSourceFile(
  'my-element.js',
  code,
  ts.ScriptTarget.ES2015,
  true,
)];

console.log(JSON.stringify(create({
  modules, 
  plugins: [
    reactify({
      exclude: ['MyElement'],
      outdir: 'react',
      attributeMapping: {
        'for': '_for'
      }
    })
  ]}), null, 2));
