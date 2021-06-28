/* eslint-disable */

import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

import { camelize, createEventName, has, getDefineCallForElement, RESERVED_WORDS } from './utils.js';

const packageJsonPath = `${process.cwd()}${path.sep}package.json`;
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

export default function reactify({ 
  exclude = [], 
  attributeMapping = {},
  outdir = 'legacy'
 } = {}) {
  return {
    name: 'reactify',
    packageLinkPhase({ customElementsManifest }) {
      if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir);
      }

      const components = [];
      customElementsManifest.modules.forEach(mod => {
        mod.declarations.forEach(dec => {
          if (!exclude.includes(dec.name) && (dec.customElement || dec.tagName)) {
            components.push(dec);
          }
        });
      });

      components.forEach(component => {
        let useEffect = false;
        const fields = component?.members?.filter(
          member =>
            member.kind === 'field' &&
            !member.static &&
            member.privacy !== 'private' &&
            member.privacy !== 'protected',
        );

        const booleanAttributes = [];
        const attributes = [];

        component?.attributes
          ?.filter(attr => !attr.fieldName)
          ?.forEach(attr => {
            /** Handle reserved keyword attributes */
            if (RESERVED_WORDS.includes(attr?.name)) {
              /** If we have a user-specified mapping, rename */
              if (attr.name in attributeMapping) {
                const attribute = {
                  ...attr,
                  originalName: attr.name,
                  name: attributeMapping[attr.name],
                };
                if (attr?.type?.text === 'boolean') {
                  booleanAttributes.push(attribute);
                } else {
                  attributes.push(attribute);
                }
                return;
              }
              throw new Error(
                `Attribute \`${attr.name}\` in custom element \`${component.name}\` is a reserved keyword and cannot be used. Please provide an \`attributeMapping\` in the plugin options to rename the JavaScript variable that gets passed to the attribute.`,
              );
            }

            if (attr?.type?.text === 'boolean') {
              booleanAttributes.push(attr);
            } else {
              attributes.push(attr);
            }
          });

        let params = [];
        component?.events?.forEach(event => {
          params.push(createEventName(event));
        });

        fields?.forEach(member => {
          params.push(member.name);
        });

        [...(booleanAttributes || []), ...(attributes || [])]?.forEach(attr => {
          params.push(camelize(attr.name));
        });

        params = params?.join(', ');

        const events = component?.events?.map(
          event => `
            useEffect(() => {
              if(${createEventName(event)} !== undefined) {
                ref.current.addEventListener('${event.name}', ${createEventName(event)});
              }
            }, [])
          `,
        );

        const booleanAttrs = booleanAttributes?.map(
          attr => `
            useEffect(() => {
              if(${attr?.name ?? attr.originalName} !== undefined) {
                if(${attr?.name ?? attr.originalName}) {
                  ref.current.setAttribute('${attr.name}', '');
                } else {
                  ref.current.removeAttribute('${attr.name}');
                }
              }
            }, [${attr?.originalName ?? attr.name}])
          `,
        );

        const attrs = attributes?.map(
          attr => `
            useEffect(() => {
              if(${attr?.name ??
                attr.originalName} !== undefined && ref.current.getAttribute('${attr?.originalName ??
                      attr.name}') !== String(${attr?.name ?? attr.originalName})) {
                ref.current.setAttribute('${attr?.originalName ?? attr.name}', ${attr?.name ??
                      attr.originalName})
              }
            }, [${attr?.name ?? attr.originalName}])
        `,
        );

        const props = fields?.map(
          member => `
            useEffect(() => {
              if(${member.name} !== undefined && ref.current.${member.name} !== ${member.name}) {
                ref.current.${member.name} = ${member.name};
              }
            }, [${member.name}])
        `,
        );

        if (has(events) || has(props) || has(attrs) || has(booleanAttrs)) {
          useEffect = true;
        }

        const moduleSpecifier = path.join(
          packageJson.name,
          getDefineCallForElement(customElementsManifest, component.tagName),
        );

        const result = `
          import React${useEffect ? ', {useEffect, useRef}' : ''} from "react";
          import '${moduleSpecifier}';

          export function ${component.name}({children${params ? ',' : ''} ${params}}) {
            ${useEffect ? `const ref = useRef(null);` : ''}

            ${has(events) ? '/** Event listeners - run once */' : ''}
            ${events?.join('') || ''}
            ${has(booleanAttrs) ? '/** Boolean attributes - run whenever an attr has changed */' : ''}
            ${booleanAttrs?.join('') || ''}
            ${has(attrs) ? '/** Attributes - run whenever an attr has changed */' : ''}
            ${attrs?.join('') || ''}
            ${has(props) ? '/** Properties - run whenever a property has changed */' : ''}
            ${props?.join('') || ''}

            return (
              <${component.tagName} ${useEffect ? 'ref={ref}' : ''} ${[...booleanAttributes, ...attributes]
                    .map(attr => `${attr?.originalName ?? attr.name}={${attr?.name ?? attr.originalName}}`)
                    .join(' ')}>
                {children}
              </${component.tagName}>
            )
          }
        `;

        fs.writeFileSync(
          path.join(outdir, `${component.name}.jsx`),
          prettier.format(result, { parser: 'babel' }),
        );
      });
    },
  };
}
