import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Container } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { ProductType } from '../../enums/product/product';
import { ProductInquiry } from '../../types/product/productInput';
import { getImageUrl } from '../../utils';

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

const E_bike = () => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [initialInput] = useState<ProductInquiry>({
    page: 1,
    limit: 3,
    sort: 'createdAt',
    direction: Direction.DESC,
    search: {
      productTypeList: [ProductType.E_BIKE],
    },
  });

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { input: initialInput },
  });

  if (loading) return <Box component="div" className="e-bike"><p>Loading...</p></Box>;
  if (error) return <Box component="div" className="e-bike"><p>Error loading products</p></Box>;

  const products = data?.getProducts?.list || [];

  return (
    <Box component="div" className="e-bike">
      <Container maxWidth="lg">

        {/* Header */}
        <Box component="div" className="e-bike-header">
          <Typography variant="h3" component="h2" className="e-bike-title">
            E-BIKE COLLECTION
          </Typography>
          <Button
            className="e-bike-see-all"
            onClick={() => router.push('/products')}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
          >
            See All
          </Button>
        </Box>

        {/* Grid */}
        <Box component="div" className="e-bike-grid">
          {products.map((product: any) => (
            <Box
              component="div"
              key={product._id}
              className={`e-bike-card ${hoveredId === product._id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredId(product._id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => router.push(`/products/${product._id}`)}
              sx={{ cursor: 'pointer' }}
            >
              {/* Image Box */}
              <Box component="div" className="e-bike-image-box">
                <img
                  className="e-bike-image"
                  src={
                    getImageUrl(product.productImages?.[0], '/img/4253517958_2224302_3.png')
                  }
                  alt={product.productName}
                />
              </Box>

              {/* Info */}
              <Box component="div" className="e-bike-info">

                {/* Name & Add to Cart */}
                <Box component="div" className="e-bike-name-row">
                  <Typography className="e-bike-name">
                    {product.productName}
                  </Typography>
                
                </Box>

                {/* Type */}
                <Typography className="e-bike-type">
                  {product.productType}
                </Typography>

                {/* Price */}
                <Typography className="e-bike-price">
                  ${product.productPrice.toLocaleString()}
                </Typography>

                {/* Color Dots */}
                <Box component="div" className="e-bike-colors">
                  <Box
                    component="div"
                    className="e-bike-color-dot"
                    sx={{ background: colorMap[product.productColor] || '#ccc' }}
                  />
                  <Button
                    className="e-bike-add-btn"
                    startIcon={<AddShoppingCartIcon sx={{ fontSize: 14 }} />}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); router.push(`/products/${product._id}`); }}
                  >
                    View Details
                  </Button>
                </Box>

                

              </Box>
            </Box>
          ))}
        </Box>

      </Container>
    </Box>
  );
};

export default E_bike;