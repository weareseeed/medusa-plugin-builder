import Medusa from "@medusajs/js-sdk"
import {
    StoreProductListParams,
    StoreProductResponse,
    StoreProductCategoryListParams,
    FindParams,
    StoreProductCategory,
    StoreProduct,
} from "@medusajs/types"
import { transformCategory, transformProduct } from "./utils"


type MedusaConfig = {
    baseUrl: string
    publishableKey: string
}

interface CustomStoreProductCategory extends StoreProductCategory {
    title: string
}

export class MedusaClient {

    medusaSdk;

    constructor({ baseUrl, publishableKey }: MedusaConfig) {
        this.medusaSdk = new Medusa({
            baseUrl,
            publishableKey,
            debug: true,
        })
    }

    async getProductsList(query?: StoreProductListParams): Promise<StoreProduct[]> {
        const response = await this.medusaSdk.store.product.list({
            limit: 20,
            ...query
        })
        return response.products.map(transformProduct)
    }

    async getProduct(id: string): Promise<StoreProductResponse['product']> {
        const response = await this.medusaSdk.store.product.retrieve(id)
        return transformProduct(response.product)
    }

    async getCategoriesList(query?: FindParams & StoreProductCategoryListParams): Promise<CustomStoreProductCategory[]> {
        const response = await this.medusaSdk.store.category.list({
            limit: 20,
            ...query
        })
        return response.product_categories.map(transformCategory)
    }

    async getCategory(id: string): Promise<CustomStoreProductCategory> {
        const response = await this.medusaSdk.store.category.retrieve(id)
        return transformCategory(response.product_category)
    }

}