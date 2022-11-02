import { DiJqueryLogo } from "react-icons/di";
import { FaAngular, FaReact, FaVuejs, FaEmber } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io";
import { FrameworkName } from "./libraries";

// An ordered set of all framework names.
export const FrameworkNames: FrameworkName[] = [
  "react",
  "vue",
  "angular",
  "ember",
  "jquery",
  "vanilla",
];

export const FrameworkTitles = {
  react: "React",
  vue: "Vue.js",
  angular: "Angular",
  ember: "Ember.js",
  jquery: "jQuery",
  vanilla: "Vanilla JavaScript (no framework)",
};

export const FrameworkIcons = {
  react: FaReact,
  vue: FaVuejs,
  angular: FaAngular,
  ember: FaEmber,
  jquery: DiJqueryLogo,
  vanilla: IoLogoJavascript,
};
