import {defineConfig} from "vite"
import preact from "@preact/preset-vite"
import {resolve} from "path"

export default defineConfig({
    plugins: [preact()],
    root: "src/frontend",
    resolve: {alias: [{find: "~", replacement: resolve(__dirname, "src/frontend")}]},
    build: {outDir: "../../dist", emptyOutDir: true},
    publicDir: "../../public",
})
