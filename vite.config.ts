import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import { buildEmailTheme } from "keycloakify-emails";
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    keycloakify({
      accountThemeImplementation: "none",
      themeName: ["keycloak-custom"],
      // See: https://docs.keycloakify.dev/features/environment-variables
      environmentVariables: [
        { name: "domain_path_for_logo", default: "/img/logo500.png" },
      ],
      postBuild: async (buildContext) => {
        await buildEmailTheme({
          templatesSrcDirPath: path.join(
            buildContext.themeSrcDirPath,
            "email",
            "templates",
          ),
          i18nSourceFile: path.join(
            buildContext.themeSrcDirPath,
            "email",
            "i18n.ts",
          ),
          themeNames: buildContext.themeNames,
          keycloakifyBuildDirPath: buildContext.keycloakifyBuildDirPath,
          locales: ["en"],
          cwd: import.meta.dirname,
          environmentVariables: buildContext.environmentVariables,
          esbuild: {}, // optional esbuild options
        });
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
