import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
    plugins: [
        viteSingleFile({ useRecommendedBuildConfig: false }),
        createHtmlPlugin({ minify: true }),
    ],
    base: './',
    build: {
        minify: 'terser',
        target: 'esnext',
        modulePreload: {
            polyfill: false,
        },
        assetsDir: '',
        assetsInlineLimit: 0,
        reportCompressedSize: false,
        terserOptions: {
            compress: {
                unsafe_arrows: true,
                unsafe_comps: true,
                unsafe_Function: true,
                unsafe_methods: true,
                passes: 3,
            },
            mangle: {
                toplevel: true,
            },
            format: {
                comments: false,
            },
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                manualChunks: undefined,
                assetFileNames: '[name].[ext]'
            },
        },
    },
})
