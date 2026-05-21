import React, { useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useQuery } from '@apollo/client';
import Swal from 'sweetalert2';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { ProductType } from '../../enums/product/product';
import { ProductInquiry } from '../../types/product/productInput';

const Accessories = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [initialInput] = useState<ProductInquiry>({
    page: 1,
    limit: 3,
    sort: 'createdAt',
    direction: Direction.DESC,
    search: {
      productTypeList: [ProductType.ACCESSORY],
    },
  });

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { input: initialInput },
  });

  const accessories = data?.getProducts?.list || [];

  const handleBuyNow = (accessory: any) => {
    Swal.fire({
      icon: 'info',
      title: accessory.productName,
      text: `Price: $${accessory.productPrice.toLocaleString()}`,
      confirmButtonText: 'Add to Cart',
      showCancelButton: true,
      confirmButtonColor: '#1a1a1a',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Added to Cart!',
          text: `${accessory.productName} has been added to your cart.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  if (loading) return (
    <Box className="accessories-section">
      <Container maxWidth="lg">
        <Typography>Loading...</Typography>
      </Container>
    </Box>
  );

  if (error) return (
    <Box className="accessories-section">
      <Container maxWidth="lg">
        <Typography>Error loading accessories</Typography>
      </Container>
    </Box>
  );

  return (
    <Box className="accessories-section">
      <Container maxWidth="lg">

        {/* Header */}
        <Box className="accessories-header">
          <Typography variant="h4" component="h2" className="accessories-title">
            ACCESSORIES
          </Typography>
          <Button
            variant="outlined"
            className="accessories-see-all-button"
            endIcon={<ArrowForwardIcon />}
          >
            See All
          </Button>
        </Box>

        {/* Grid */}
        <Box className="accessories-grid">
          {accessories.length === 0 ? (
            <Typography className="accessories-empty">
              No accessories found.
            </Typography>
          ) : (
            accessories.map((accessory: any) => (
              <Box
                key={accessory._id}
                className={`accessory-card ${hoveredId === accessory._id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredId(accessory._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image Box */}
                <Box className="accessory-image-box">
                  <img
                    className="accessory-image"
                    src={
                      accessory.productImages?.[0]
                        ? `${process.env.NEXT_PUBLIC_API_URL}/${accessory.productImages[0]}`
                        : '/img/R1-01.webp'
                    }
                    alt={accessory.productName}
                  />
                </Box>

                {/* Info */}
                <Box className="accessory-info">

                  {/* Name & Add to Cart */}
                  <Box className="accessory-name-row">
                    <Typography className="accessory-name">
                      {accessory.productName}
                    </Typography>
                  </Box>

                  {/* Type */}
                  <Typography className="accessory-type">
                    {accessory.productType}
                  </Typography>

                  {/* Desc */}
                  <Typography className="accessory-desc">
                    {accessory.productDesc || 'Quality accessory for every ride.'}
                  </Typography>

                  {/* Price */}
                  <Typography className="accessory-price">
                    ${accessory.productPrice.toLocaleString()}
                  </Typography>

				   <Button
                      className="accessory-add-btn"
                      startIcon={<AddShoppingCartIcon sx={{ fontSize: 14 }} />}
                      onClick={() => handleBuyNow(accessory)}
                    >
                      Add to Cart
                    </Button>

                </Box>
              </Box>
            ))
          )}
        </Box>

      </Container>
    </Box>
  );
};

export default Accessories;