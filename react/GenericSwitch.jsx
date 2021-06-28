import React, { useEffect, useRef } from "react";
import "cem-plugin-reactify/my-element.js";

export function GenericSwitch({
  children,
  onSelectedChanged,
  checked,
  disabled,
  label,
  _for,
}) {
  const ref = useRef(null);

  /** Event listeners - run once */

  useEffect(() => {
    if (onSelectedChanged !== undefined) {
      ref.current.addEventListener("selected-changed", onSelectedChanged);
    }
  }, []);

  /** Boolean attributes - run whenever an attr has changed */

  useEffect(() => {
    if (disabled !== undefined) {
      if (disabled) {
        ref.current.setAttribute("disabled", "");
      } else {
        ref.current.removeAttribute("disabled");
      }
    }
  }, [disabled]);

  /** Attributes - run whenever an attr has changed */

  useEffect(() => {
    if (
      label !== undefined &&
      ref.current.getAttribute("label") !== String(label)
    ) {
      ref.current.setAttribute("label", label);
    }
  }, [label]);

  useEffect(() => {
    if (
      _for !== undefined &&
      ref.current.getAttribute("for") !== String(_for)
    ) {
      ref.current.setAttribute("for", _for);
    }
  }, [_for]);

  /** Properties - run whenever a property has changed */

  useEffect(() => {
    if (checked !== undefined && ref.current.checked !== checked) {
      ref.current.checked = checked;
    }
  }, [checked]);

  return (
    <generic-switch ref={ref} disabled={disabled} label={label} for={_for}>
      {children}
    </generic-switch>
  );
}
