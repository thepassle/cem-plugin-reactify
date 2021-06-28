/**
 * @event {Event} selected-changed
 * @attr {boolean} disabled
 * @attr {string} label
 * @attr {string} for
 * @property {boolean} checked
 */
class GenericSwitch extends HTMLElement {}
customElements.define('generic-switch', GenericSwitch);


// Exclude
class MyElement extends HTMLElement {}
customElements.define('my-element', MyElement);