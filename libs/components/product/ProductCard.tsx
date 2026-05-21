import React, { useState } from "react";
import { Box, Typography, Chip, IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  ProductType,
  ProductStatus,
  ProductAgeCategory,
  ProductColor,
  ProductSize,
} from "../../enums/product/product";

/** ─── GraphQL Mutation ───────────────────────────────────── */
const LIKE_TARGET_PRODUCT = gql`
  mutation LikeTargetProduct($input: String!) {
    likeTargetProduct(productId: $input) {
      _id
      productLikes
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

/** ─── Types ─────────────────────────────────────────────── */
export interface Product {
  _id: string;
  productType: ProductType;
  productStatus: ProductStatus;
  productAgeCategory: ProductAgeCategory;
  productColor: ProductColor;
  productSize: ProductSize;
  productName: string;
  productPrice: number;
  productViews: number;
  productLikes: number;
  productComments: number;
  productRank: number;
  productImages: string[];
  productDesc: string;
  memberId: string;
  soldAt?: string;
  deletedAt?: string;
  updatedAt: string;
  meLiked?: { memberId: string; likeRefId: string; myFavorite: boolean }[];
}

interface ProductCardProps {
  product: Product;
}

/** ─── Constants ─────────────────────────────────────────── */
const STATUS_COLOR: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]:  "#22c55e",
  [ProductStatus.SOLD]:    "#ef4444",
  [ProductStatus.HIDDEN]:  "#f59e0b",
  [ProductStatus.DELETED]: "#9ca3af",
};

const TYPE_LABEL: Record<ProductType, string> = {
  [ProductType.ROAD]:      "Road",
  [ProductType.E_BIKE]:    "E-Bike",
  [ProductType.ACCESSORY]: "Accessory",
};

const AGE_LABEL: Record<ProductAgeCategory, string> = {
  [ProductAgeCategory.KIDS]:     "Kids",
  [ProductAgeCategory.TEENAGER]: "Teenager",
  [ProductAgeCategory.ADULT]:    "Adult",
};

/** ─── Component ─────────────────────────────────────────── */
const ProductCard = ({ product }: ProductCardProps) => {
  const [imgError, setImgError]   = useState(false);
  const [liked, setLiked]         = useState(product.meLiked?.[0]?.myFavorite ?? false);
  const [likeCount, setLikeCount] = useState(product.productLikes);

  const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

  // hide accessories
  if (product.productType === ProductType.ACCESSORY) return null;

  const imgSrc =
    !imgError && product.productImages?.[0]
      ? `${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[0]}`
      : "/img/placeholder-bike.png";

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click if you add navigation later
    try {
      const { data } = await likeTargetProduct({
        variables: { input: product._id },
      });
      const modifier = data?.likeTargetProduct?.productLikes - likeCount;
      setLiked(modifier > 0);
      setLikeCount(data?.likeTargetProduct?.productLikes ?? likeCount);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  return (
    <Box className="product-card">
      {/* Image */}
      <Box className="product-card__image-wrap">
        <Box
          component="img"
          src={imgSrc}
          alt={product.productName}
          onError={() => setImgError(true)}
          className="product-card__image"
        />

        <Box
          className="product-card__status"
          sx={{ backgroundColor: STATUS_COLOR[product.productStatus] ?? "#9ca3af" }}
        >
          {product.productStatus}
        </Box>

        {product.productColor && (
          <Box
            className="product-card__color-dot"
            sx={{ backgroundColor: product.productColor.toLowerCase() }}
          />
        )}
      </Box>

      {/* Body */}
      <Box className="product-card__body">
        <Typography className="product-card__meta">
          {TYPE_LABEL[product.productType]} · {product.productSize}
        </Typography>

        <Typography className="product-card__name">
          {product.productName}
        </Typography>

        {/* ── Stats + Like button ── */}
        <Box className="product-card__stats">
          {/* Views */}
          <Box className="product-card__stat">
            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography className="product-card__stat-count">
              {product.productViews}
            </Typography>
          </Box>

          {/* Comments */}
          <Box className="product-card__stat">
            <ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />
            <Typography className="product-card__stat-count">
              {product.productComments}
            </Typography>
          </Box>

          {/* Like */}
          <Box className="product-card__stat product-card__stat--like">
            <IconButton
              className="product-card__like-btn"
              onClick={handleLike}
              disableRipple
              size="small"
            >
              {liked ? (
                <FavoriteIcon sx={{ fontSize: 16, color: "#ef4444" }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 16, color: "#aaa" }} />
              )}
            </IconButton>
            <Typography
              className="product-card__stat-count"
              sx={{ color: liked ? "#ef4444" : "#999" }}
            >
              {likeCount}
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box className="product-card__footer">
          <Typography className="product-card__price">
            ${product.productPrice?.toLocaleString()}
          </Typography>
          <Chip
            label={AGE_LABEL[product.productAgeCategory]}
            size="small"
            className="product-card__age-chip"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProductCard;