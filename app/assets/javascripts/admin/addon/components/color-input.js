import { action, computed } from "@ember/object";
import loadScript, { loadCSS } from "discourse/lib/load-script";
import Component from "@ember/component";
import { observes } from "discourse-common/utils/decorators";
import { schedule } from "@ember/runloop";

/**
  An input field for a color.

  @param hexValue is a reference to the color's hex value.
  @param brightnessValue is a number from 0 to 255 representing the brightness of the color. See ColorSchemeColor.
  @params valid is a boolean indicating if the input field is a valid color.
**/
export default Component.extend({
  classNames: ["color-picker"],

  onlyHex: true,

  styleSelection: true,

  maxlength: computed("onlyHex", function () {
    return this.onlyHex ? 6 : null;
  }),

  normalize(color) {
    if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
      if (!color.startsWith("#")) {
        color = "#" + color;
      }
    }

    return color;
  },

  @action
  onHexInput(color) {
    if (this.attrs.onChangeColor) {
      this.attrs.onChangeColor(this.normalize(color || ""));
    }
  },

  @observes("hexValue", "brightnessValue", "valid")
  hexValueChanged: function () {
    const hex = this.hexValue;
    let text = this.element.querySelector("input.hex-input");

    if (this.attrs.onChangeColor) {
      this.attrs.onChangeColor(this.normalize(hex));
    }

    if (this.valid) {
      this.styleSelection &&
        text.setAttribute(
          "style",
          "color: " +
            (this.brightnessValue > 125 ? "black" : "white") +
            "; background-color: #" +
            hex +
            ";"
        );

      if (this.pickerLoaded) {
        $(this.element.querySelector(".picker")).spectrum({
          color: "#" + hex,
        });
      }
    } else {
      this.styleSelection && text.setAttribute("style", "");
    }
  },

  didInsertElement() {
    loadScript("/javascripts/spectrum.js").then(() => {
      loadCSS("/javascripts/spectrum.css").then(() => {
        schedule("afterRender", () => {
          $(this.element.querySelector(".picker"))
            .spectrum({ color: "#" + this.hexValue })
            .on("change.spectrum", (me, color) => {
              this.set("hexValue", color.toHexString().replace("#", ""));
            });
          this.set("pickerLoaded", true);
        });
      });
    });
    schedule("afterRender", () => this.hexValueChanged());
  },
});
