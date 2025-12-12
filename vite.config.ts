import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import { buildEmailTheme } from "keycloakify-emails";
import tailwindcss from '@tailwindcss/vite'
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const logoUrl = env.VITE_DOMAIN_PATH_FOR_LOGO;
  return {
    plugins: [
      react(),
      tailwindcss(),
      keycloakify({
        accountThemeImplementation: "none",
        themeName: ["keycloak-custom"],
        environmentVariables: [
          {
            name: "logoUrl",
            default: logoUrl,
          },
        ],
        postBuild: async (buildContext) => {
          await buildEmailTheme({
            templatesSrcDirPath: path.join(
              buildContext.themeSrcDirPath,
              "email",
              "templates"
            ),
            i18nSourceFile: path.join(
              buildContext.themeSrcDirPath,
              "email",
              "i18n.ts"
            ),
            themeNames: buildContext.themeNames,
            keycloakifyBuildDirPath: buildContext.keycloakifyBuildDirPath,
            locales: ["en"],
            cwd: import.meta.dirname,
            environmentVariables: buildContext.environmentVariables,
            esbuild: {},
          });
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
