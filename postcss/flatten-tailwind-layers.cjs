module.exports = function flattenTailwindLayers() {
  return {
    postcssPlugin: "flatten-tailwind-layers",
    Once(root) {
      let changed = true;
      while (changed) {
        changed = false;
        root.walkAtRules("layer", (atRule) => {
          changed = true;

          if (atRule.nodes?.length) {
            atRule.replaceWith(...atRule.nodes);
            return;
          }

          atRule.remove();
        });
      }
    },
  };
};

module.exports.postcss = true;
