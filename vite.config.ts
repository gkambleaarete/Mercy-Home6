import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Figma Make source imports packages as "pkg@1.2.3"; strip the version for local installs.
function versionedImportResolver() {
  return {
    name: 'versioned-import-resolver',
    enforce: 'pre' as const,
    async resolveId(id, importer, options) {
      const m = id.match(/^((?:@[^/@]+\/)?[^/@]+)@\d[^/]*(\/.*)?$/)
      if (!m) return null
      return this.resolve(m[1] + (m[2] ?? ''), importer, { ...options, skipSelf: true })
    },
  }
}

export default defineConfig({
  plugins: [
    versionedImportResolver(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react({
      // Story files export CSF objects, not React components. The React
      // plugin still injects a Fast Refresh accept hook into every .tsx,
      // which absorbs the HMR update without doing anything useful — so
      // edits to a `.stories.tsx` file silently no-op instead of bubbling
      // to a full iframe reload. Exclude them so changes propagate.
      exclude: [/\.stories\.tsx?$/],
      babel: { compact: false },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
