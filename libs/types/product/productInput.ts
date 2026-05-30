import { Direction } from '../../enums/common.enum';
import {
	BrakeType,
	ProductAgeCategory,
	ProductColor,
	ProductCondition,
	ProductSize,
	ProductStatus,
	ProductType,
	SuspensionType,
} from '../../enums/product/product';

export interface AllProductInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: {
		productStatus?: ProductStatus;
		productType?: ProductType;
	};
}

export interface UpdateProductInput {
	_id: string;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productCondition?: ProductCondition;
	productAgeCategory?: ProductAgeCategory;
	productColor?: ProductColor;
	productSize?: ProductSize;
	productName?: string;
	productBrand?: string;
	productDesc?: string;
	productPrice?: number;
	productImages?: string[];
	productBrakeType?: BrakeType;
	productSuspension?: SuspensionType;
	productGearCount?: number;
	productWheelSize?: number;
	productFrameSize?: number;
	productWeight?: number;
	productMileage?: number;
	productYear?: number;
}

export interface ProductInput {
	productType: ProductType;
	productStatus?: ProductStatus;
	productCondition?: ProductCondition;
	productAgeCategory: ProductAgeCategory;
	productColor: ProductColor;
	productSize: ProductSize;
	productName: string;
	productBrand?: string;
	productPrice: number;
	productImages: string[];
	productDesc?: string;
	productBrakeType?: BrakeType;
	productSuspension?: SuspensionType;
	productGearCount?: number;
	productWheelSize?: number;
	productFrameSize?: number;
	productWeight?: number;
	productMileage?: number;
	productYear?: number;
	memberId?: string;
}

export interface PrISearch {
	memberId?: string;
	productStatus?: ProductStatus;
	productTypeList?: ProductType[];
	productConditionList?: ProductCondition[];
	colorList?: ProductColor[];
	sizeList?: ProductSize[];
	ageCategoryList?: ProductAgeCategory[];
	brakeTypeList?: BrakeType[];
	suspensionList?: SuspensionType[];
	pricesRange?: Range;
	productBrand?: string;
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
