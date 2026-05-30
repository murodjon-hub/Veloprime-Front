import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/router";
import { Product } from "../product/ProductCard";
import { getImageUrl } from "../../utils";


/** ─── GraphQL ───────────────────────────────────────────── */
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

/** ─── Component ─────────────────────────────────────────── */
const AccessoryCard = ({ product }: { product: Product }) => {
  const router = useRouter();

  const [imgError, setImgError]   = useState(false);
  const [liked, setLiked]         = useState(product.meLiked?.[0]?.myFavorite ?? false);
  const [likeCount, setLikeCount] = useState(product.productLikes);

  const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

  const imgSrc = imgError
    ? '/img/placeholder-accessory.png'
    : getImageUrl(product.productImages?.[0], '/img/placeholder-accessory.png');

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data } = await likeTargetProduct({ variables: { input: product._id } });
      const modifier = data?.likeTargetProduct?.productLikes - likeCount;
      setLiked(modifier > 0);
      setLikeCount(data?.likeTargetProduct?.productLikes ?? likeCount);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleClick = () => {
    router.push(`/accessories/${product._id}`);
  };

  const colorHex: Record<string, string> = {
    BLACK:      "#1a1a1a",
    WHITE:      "#f5f5f5",
    RED:        "#e53e3e",
    BLUE:       "#3182ce",
    GREEN:      "#38a169",
    YELLOW:     "#d69e2e",
    ORANGE:     "#dd6b20",
    PURPLE:     "#805ad5",
    SILVER:     "#a0aec0",
    GRAY:       "#718096",
    BROWN:      "#975a16",
    PINK:       "#d53f8c",
    MULTICOLOR: "linear-gradient(135deg,#e53e3e,#3182ce,#38a169)",
  };

  const dotBg = colorHex[product.productColor] ?? "#ccc";

  return (
    <Box component="div" className="acc-card" onClick={handleClick}>

      {/* Image area */}
      <Box component="div" className="acc-card__img-wrap">
        <Box
          component="img"
          src={imgSrc}
          alt={product.productName}
          onError={() => setImgError(true)}
          className="acc-card__img"
        />

        {/* Color swatch */}
        <Box
          component="div"
          className="acc-card__color"
          sx={{ background: dotBg }}
        />

        {/* Status badge */}
        <Box component="div" className={`acc-card__badge acc-card__badge--${product.productStatus.toLowerCase()}`}>
          {product.productStatus}
        </Box>

        {/* Quick-like overlay */}
        <Box component="div" className="acc-card__overlay">
          <IconButton
            className="acc-card__like-btn"
            onClick={handleLike}
            disableRipple
            size="small"
          >
            {liked
              ? <FavoriteIcon    sx={{ fontSize: 18, color: "#e53e3e" }} />
              : <FavoriteBorderIcon sx={{ fontSize: 18, color: "#fff"    }} />
            }
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box component="div" className="acc-card__body">

        {/* Size tag */}
        {product.productSize && (
          <Box component="div" className="acc-card__size-tag">{product.productSize}</Box>
        )}

        <Typography className="acc-card__name">{product.productName}</Typography>

        <Typography className="acc-card__age">
          {product.productAgeCategory.charAt(0) + product.productAgeCategory.slice(1).toLowerCase()}
        </Typography>

        {/* Stats row */}
        <Box component="div" className="acc-card__stats">
          <Box component="div" className="acc-card__stat">
            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 13 }} />
            <span>{product.productViews}</span>
          </Box>
          <Box component="div" className="acc-card__stat">
            <ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />
            <span>{product.productComments}</span>
          </Box>
          <Box component="div" className="acc-card__stat acc-card__stat--like">
            <FavoriteBorderIcon sx={{ fontSize: 13, color: liked ? "#e53e3e" : "inherit" }} />
            <span style={{ color: liked ? "#e53e3e" : "inherit" }}>{likeCount}</span>
          </Box>
        </Box>

        {/* Footer */}
        <Box component="div" className="acc-card__footer">
          <Typography className="acc-card__price">
            ${product.productPrice?.toLocaleString()}
          </Typography>
          <Box component="div" className="acc-card__arrow">→</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AccessoryCard;
