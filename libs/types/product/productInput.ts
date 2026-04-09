import { Direction } from "../../enums/common.enum";
import { ProductAgeCategory, ProductColor, ProductSize, ProductStatus, ProductType } from "../../enums/product/product";

export interface ProductInput {
  productType: ProductType;
  productStatus: ProductStatus;
  productAgeCategory: ProductAgeCategory;
  productColor: ProductColor;
  productSize: ProductSize;
  productName: string;
  productPrice: number;
  productImages: string[];
  productDesc?: string;
  memberId?: string;
}
interface PrISearch {
  memberId?: string;
  productStatus?: ProductStatus;
  productTypeList?: ProductType[];
  colorList?: ProductColor[];
  sizeList?: ProductSize[];
  ageCategoryList?: ProductAgeCategory[];
  pricesRange?: Range;
  text?: string;
}

export interface ProductInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: PrISearch;
}

interface Range {
  start: number;
  end: number;
}

const input: ProductInquiry = {
  page: 1,
  limit: 8,
  sort: "createdAt",
  direction: Direction.DESC,
  search: {
    productStatus: ProductStatus.ACTIVE,
  },
};