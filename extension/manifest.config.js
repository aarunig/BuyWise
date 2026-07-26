import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({

    manifest_version: 3,

    name: pkg.name,

    version: pkg.version,

    icons: {

        48: "public/logo.png"

    },

    permissions: [

        "storage",
        "sidePanel"

    ],

    host_permissions: [

        "https://*/*"

    ],

    action: {

        default_icon: {

            48: "public/logo.png"

        },

        default_popup: "src/popup/index.html"

    },

    content_scripts: [

        {

            matches: [

                "https://*/*"

            ],

            js: [

                "src/content/contentScript.jsx"

            ],

            run_at: "document_idle"

        }

    ],

    side_panel: {

        default_path: "src/sidepanel/index.html"

    }

});