import path from "path";

const flattenTailwindLayersPath = path.resolve(
  process.cwd(),
  "postcss/flatten-tailwind-layers.cjs",
);

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    [flattenTailwindLayersPath]: {},
    autoprefixer: {},
  },
};

export default config;
