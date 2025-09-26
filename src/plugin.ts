import pkg from "../package.json";
import { registerCommercePlugin } from "@builder.io/commerce-plugin-tools";
import { MedusaClient } from "./medusa";
import appState from "@builder.io/app-context";
import {
  transformCategory,
  transformCollection,
  transformProduct,
} from "./utils";

registerCommercePlugin(
  {
    id: pkg.name,
    name: "Medusa",
    noPreviewTypes: true,
    settings: [
      {
        name: "baseUrl",
        type: "string",
        helperText:
          "A required string that defines the full URL of your Medusa backend instance. Example: https://medusajs.app/",
        required: true,
      },
      {
        name: "publishableKey",
        type: "string",
        helperText:
          "A required string specifying the publishable API key for the storefront, retrieve this key from the Medusa Admin.",
        required: true,
      },
    ],
    ctaText: "Connect your Medusa App",
    onSave: async () => {
      appState.globalState.hideGlobalBlockingLoading();
      try {
        const pluginInfo =
          appState.user.organization.value.settings.plugins.get(pkg.name);
        const baseUrl = pluginInfo.get("baseUrl");
        const publishableKey = pluginInfo.get("publishableKey");

        if (!baseUrl || !publishableKey) {
          throw new Error("Both Base URL and Publishable Key are required.");
        }

        const medusaClient = new MedusaClient({
          baseUrl,
          publishableKey,
        });

        await medusaClient.ping();

        await appState.dialogs.alert(
          "Medusa JS is now successfully connected.",
          "Setup Complete"
        );
      } catch (e: any) {
        console.error(e);
        await appState.dialogs.alert(
          `${e.message}`,
          `An error occurred while connecting to Medusa JS`
        );
      }
    },
  },
  async (settings) => {
    const baseUrl = settings.get("baseUrl")?.trim();
    const publishableKey = settings.get("publishableKey")?.trim();

    const medusaClient = new MedusaClient({
      baseUrl,
      publishableKey,
    });

    return {
      product: {
        async findById(id: string) {
          return await medusaClient.getProduct(id);
        },
        async findByHandle(handle: string) {
          const response = await medusaClient.getProductsList({ handle });
          return transformProduct(response.find(Boolean));
        },
        async search(search: string) {
          return await medusaClient.getProductsList({
            q: search,
          });
        },
        getRequestObject(id: string) {
          return {
            "@type": "@builder.io/core:Request" as const,
            request: {
              url: `${baseUrl}/store/products/${id}`,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json; charset=utf-8",
                "x-publishable-api-key": publishableKey,
              },
            },
            options: {
              product: id,
            },
          };
        },
      },
      collection: {
        async findById(id: string) {
          return await medusaClient.getCollection(id);
        },
        async findByHandle(handle: string) {
          const response = await medusaClient.getCollectionsList({ handle });
          return transformCollection(response.find(Boolean));
        },
        async search(search: string) {
          return await medusaClient.getCollectionsList({
            q: search,
          });
        },
        getRequestObject(id: string) {
          return {
            "@type": "@builder.io/core:Request" as const,
            request: {
              url: `${baseUrl}/store/collections/${id}`,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json; charset=utf-8",
                "x-publishable-api-key": publishableKey,
              },
            },
            options: {
              collection: id,
            },
          };
        },
      },
      category: {
        async findById(id: string) {
          return await medusaClient.getCategory(id);
        },
        async findByHandle(handle: string) {
          const response = await medusaClient.getCategoriesList({ handle });
          return transformCategory(response.find(Boolean));
        },
        async search(search: string) {
          return await medusaClient.getCategoriesList({
            q: search,
          });
        },
        getRequestObject(id: string) {
          return {
            "@type": "@builder.io/core:Request" as const,
            request: {
              url: `${baseUrl}/store/product-categories/${id}`,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json; charset=utf-8",
                "x-publishable-api-key": publishableKey,
              },
            },
            options: {
              category: id,
            },
          };
        },
      },
    };
  }
);
