import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/lib/index.ts"],
  format: ["cjs", "esm"], // Build for both CommonJS and ES Modules
  dts: true,              // Generate TypeScript declarations
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei"], // Don't bundle dependencies
});