import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Link,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "../../../apollo/user/query";
import { Direction } from "../../enums/common.enum";
import { ProductType } from "../../enums/product/product";
import { ProductInquiry } from "../../types/product/productInput";

const E_bike = () => {
  const [initialInput] = useState<ProductInquiry>({
    page: 1,
    limit: 3,
    sort: "createdAt",
    direction: Direction.DESC,
    search: {
      productTypeList: [ProductType.E_BIKE],
    },
  });

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { input: initialInput },
  });

  const products = data?.getProducts?.list || [];

  if (loading) return <Box className="e-bike"><p>Loading...</p></Box>;
  if (error) return <Box className="e-bike"><p>Error loading products</p></Box>;

  return (
    <Box className="e-bike">
      <Container maxWidth="lg">
        <Box className="arrivals-header">
          <Typography variant="h3" component="h2" className="arrivals-title">
            E-BIKE COLLECTION
          </Typography>
          <Link href="#" className="see-all-link" underline="none">
            See All <ArrowForwardIcon sx={{ fontSize: 18, marginLeft: 1 }} />
          </Link>
        </Box>

        <Grid container spacing={3} className="products-grid">
          {products.map((product: any) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card className="product-card">
                <CardMedia
                  component="img"
                  height="280"
                  image={
                    product.productImages?.[0]
                      ? `${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[0]}`
                      : "../img/4253517958_2224302_3.png"
                  }
                  alt={product.productName}
                  className="product-image"
                />
                <CardContent className="product-info">
                  <Typography gutterBottom variant="h6" component="div" className="product-name">
                    {product.productName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className="product-category">
                    {product.productType}
                  </Typography>
                </CardContent>
                <CardActions className="product-footer">
                  <Typography variant="body1" className="product-price">
                    ${product.productPrice}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    className="buy-now-btn"
                    sx={{
                      backgroundColor: '#000',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#333' },
                    }}
                  >
                    Buy Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default E_bike;