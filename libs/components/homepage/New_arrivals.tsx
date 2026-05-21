import React, { useState } from 'react';
import { Stack, Box, Typography, Button, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useQuery } from '@apollo/client';
import { Direction } from '../../enums/common.enum';
import { ProductInquiry } from '../../types/product/productInput';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { ProductType } from '../../enums/product/product';

const colorMap: Record<string, string> = {
  BLACK: '#111111',
  WHITE: '#f5f5f5',
  RED: '#ef4444',
  BLUE: '#2563eb',
  GREEN: '#10b981',
  YELLOW: '#f59e0b',
  ORANGE: '#f97316',
  PURPLE: '#8b5cf6',
  SILVER: '#94a3b8',
  GRAY: '#6b7280',
  BROWN: '#92400e',
  PINK: '#ec4899',
  MULTICOLOR: 'linear-gradient(135deg, #ef4444, #3b82f6, #10b981)',
};

const NewArrivals = () => {
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const [initialInput] = useState<ProductInquiry>({
    page: 1,
    limit: 6,
    sort: 'createdAt',
    direction: Direction.DESC,
    search: {
      productTypeList: [ProductType.ROAD, ProductType.E_BIKE],
    },
  });

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { input: initialInput },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading products</p>;

  const products = data?.getProducts?.list || [];

  const toggleLike = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <Stack className="new-arrivals-section">
      <Box className="new-arrivals-header">
        <Typography variant="h4" className="new-arrivals-title">
          New Arrivals
        </Typography>
        <Button variant="outlined" className="new-arrivals-see-all-btn">
          See All →
        </Button>
      </Box>

      <Box className="new-arrivals-grid">
        {products.map((product: any) => (
          <Box key={product._id} className="arrival-card">

            {/* Image */}
            <Box className="arrival-image-wrapper">
              <img
                className="arrival-image"
                src={
                  product.productImages?.[0]
                    ? `${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[0]}`
                    : '/img/4253517958_2224302_3.png'
                }
                alt={product.productName}
              />
            </Box>

            {/* Name & Price */}
            <Box className="arrival-info">
              <Typography className="arrival-name">
                {product.productName}
              </Typography>
              <Typography className="arrival-price">
                ${product.productPrice.toLocaleString()}
              </Typography>
            </Box>

            {/* Description */}
            <Typography className="arrival-desc">
              {product.productDesc
                ? product.productDesc.slice(0, 80) + '...'
                : 'High quality product built for performance and comfort.'}
            </Typography>

            {/* Size */}
            <Box className="arrival-sizes">
              <Typography className="arrival-sizes-label">SIZE</Typography>
              <Box className="arrival-size-list">
                <button className="size-btn active">{product.productSize}</button>
              </Box>
            </Box>

            {/* Color */}
            <Box className="arrival-colors">
              <Typography className="arrival-sizes-label">COLOR</Typography>
              <Box className="arrival-color-list">
                <Box
                  className="color-dot"
                  title={product.productColor}
                  sx={{
                    background: colorMap[product.productColor] || '#ccc',
                    border: '2px solid #ddd',
                  }}
                />
                <Typography className="color-label">
                  {product.productColor}
                </Typography>
              </Box>
            </Box>

            {/* Stats */}
            <Box className="arrival-stats">
              <Box className="arrival-stat">
                <VisibilityIcon sx={{ fontSize: 14 }} />
                <Typography>{product.productViews}</Typography>
              </Box>
              <Box className="arrival-stat">
                <FavoriteIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                <Typography>{product.productLikes}</Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box className="arrival-actions">
              <IconButton
                className={`arrival-wishlist-btn ${likedIds.includes(product._id) ? 'liked' : ''}`}
                onClick={() => toggleLike(product._id)}
              >
                {likedIds.includes(product._id)
                  ? <FavoriteIcon sx={{ color: '#ef4444' }} />
                  : <FavoriteBorderIcon />
                }
              </IconButton>
              <Button
                className="arrival-add-to-cart-btn"
                startIcon={<AddShoppingCartIcon />}
              >
                ADD TO CART
              </Button>
            </Box>

          </Box>
        ))}
      </Box>
    </Stack>
  );
};

export default NewArrivals;
