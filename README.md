# cem-plugin-reactify


[@custom-elements-manifest/analyzer](https://github.com/open-wc/custom-elements-manifest) plugin to automatically create React wrappers for your custom elements based on your custom elements manifest. You can see this plugin in action [here](https://github.com/thepassle/generic-components/tree/master/legacy), or view the live demo on [Stackblitz](https://stackblitz.com/edit/react-kghcjw).
## Usage

### Install:

```bash
npm i -D cem-plugin-reactify
```

### Import

`custom-elements-manifest.config.js`:
```js
import reactify from 'cem-plugin-reactify';

export default {
  plugins: [
    reactify()
  ]
}
```

### Configuration

`custom-elements-manifest.config.js`:
```js
import reactify from 'cem-plugin-reactify';

export default {
  plugins: [
    reactify({
      /** Directory to write the React wrappers to, defaults to `legacy` */
      outdir: 'react',
      
      /** Provide an attribute mapping to avoid using JS/React reserved keywords */
      attributeMapping: {
        'for': '_for'
      },

      /** Array of classNames to exclude */
      exclude: ['MyElement']
    });
  ]
}
```


## Details

You can read more about the reactification-process in [this here](https://dev.to/thepassle/reactifying-custom-elements-using-a-custom-elements-manifest-2e) blogpost.

### Slots

Any children passed to the React component will get passed through to the custom element using `{children}`.

Example:
```jsx
export function GenericSwitch({children}) {
  return <generic-switch>{children}</generic-switch>
}
```

#### Usage:
```jsx
<GenericSwitch>
  Toggle me!

  <div slot="namedslot">
    This gets projected to `namedslot`
  </div>
</GenericSwitch>
```

### Properties

`cem-plugin-reactify` makes a decision on whether to use an attribute or property based on whether or not an attribute has a corresponding `fieldName`. If an attribute does have a `fieldName`, the attribute will get ignored, but the property will be used instead.

Private and protected fields will be ignored.

Example:

```jsx
function GenericSwitch({checked}) {
  const ref = useRef(null);

  useEffect(() => {
    if(ref.current.checked !== undefined) {
      ref.current.checked = checked;
    }
  }, [checked]);

  return <generic-switch ref={ref}></generic-switch>
}
```

#### Usage:
```jsx
<GenericSwitch checked={true}/>
```

```jsx
<GenericList complexProperty={[{name: 'peter'}]}/>
```


### Attributes

Since values in React get passed as JavaScript variables, it could be the case that an attribute name clashes with a React or JS reserved keyword. For example: a custom element could have a `for` attribute, which is a reserved keyword in JavaScript. In the plugin's configuration, you can specify an `attributeMapping` to prevent this clash from happening, and rename the value that gets passed to the attribute. The attribute name itself will remain untouched.

Example:
```js
export default {
  plugins: [
    reactify({
      attributeMapping: {
        for: '_for',
      },
    }),
  ],
};
```

Will result in:
```jsx
function GenericSkiplink({_for}) {
  return <generic-skiplink for={_for}></generic-skiplink>
}
```

Additionally, boolean attributes will receive a special handling.

Example:
```jsx
function GenericSwitch({checked}) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled !== undefined) {
      if (disabled) {
        ref.current.setAttribute("disabled", "");
      } else {
        ref.current.removeAttribute("disabled");
      }
    }
  }, [disabled]);

  return <generic-switch ref={ref}></generic-switch>
}
```

#### Usage:
```jsx
<GenericSwitch label={'hello world'}/>  // regular attribute
```
```jsx
<GenericSwitch disabled={true}/>        // boolean attribute
```



### Events

Event names are capitalized, camelized and prefixed with `'on'`, so: `'selected-changed'` becomes `onSelectedChanged`.

Example:
```jsx
function GenericSwitch({onCheckedChanged}) {
  const ref = useRef(null);

  useEffect(() => {
    if(onCheckedChanged !== undefined) {
      ref.current.addEventListener("checked-changed", onCheckedChanged);
    }
  }, []);

  return <generic-switch ref={ref}></generic-switch>
}
```

#### Usage:
```jsx
<GenericSwitch onCheckedChanged={e => console.log(e)}/>
```
