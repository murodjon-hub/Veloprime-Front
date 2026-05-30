import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Box, Typography, Button, Chip, CircularProgress,
  Divider, IconButton, Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_PRODUCT, GET_PRODUCTS } from '../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Product } from '../../libs/components/product/ProductCard';
import ProductCard from '../../libs/components/product/ProductCard';
import { getImageUrl } from '../../libs/utils';
import Swal from 'sweetalert2';

const COLOR_MAP: Record<string, string> = {
  BLACK: '#1a1a1a', WHITE: '#f5f5f5', RED: '#e53e3e', BLUE: '#3182ce',
  GREEN: '#38a169', YELLOW: '#d69e2e', ORANGE: '#dd6b20', PURPLE: '#805ad5',
  SILVER: '#a0aec0', GRAY: '#718096', BROWN: '#975a16', PINK: '#d53f8c',
  MULTICOLOR: 'linear-gradient(135deg,#e53e3e,#3182ce,#38a169)',
};

const TYPE_LABEL: Record<string, string> = {
  ROAD: 'Road Bike', E_BIKE: 'Electric Bike', ACCESSORY: 'Accessory',
};

const BikeDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const device = useDeviceDetect();
  const user = useReactiveVar(userVar);

  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const { data, loading } = useQuery(GET_PRODUCT, {
    variables: { input: id as string },
    skip: !id,
    onCompleted: (data) => {
      if (!initialized && data?.getProduct) {
        const p = data.getProduct;
        setLiked(p.meLiked?.[0]?.myFavorite ?? false);
        setLikeCount(p.productLikes);
        setInitialized(true);
      }
    },
  });

  const { data: relatedData } = useQuery(GET_PRODUCTS, {
    variables: {
      input: { page: 1, limit: 4, sort: 'createdAt', direction: 'DESC', search: {} },
    },
    skip: !id,
  });

  const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

  const bike: any = data?.getProduct;
  const related: Product[] = (relatedData?.getProducts?.list ?? []).filter(
    (p: Product) => p._id !== id,
  ).slice(0, 3);

  const images: string[] = bike?.productImages ?? [];

  const handleLike = async () => {
    if (!user?._id) {
      Swal.fire({
        icon: 'warning',
        title: 'Login required',
        text: 'Please login to save this bike to your favorites.',
        confirmButtonColor: '#1a1a1a',
      });
      return;
    }
    try {
      const { data: mutData } = await likeTargetProduct({ variables: { input: bike._id } });
      const newCount = mutData?.likeTargetProduct?.productLikes ?? likeCount;
      setLiked(newCount > likeCount);
      setLikeCount(newCount);
    } catch {
      setLiked((prev) => !prev);
      setLikeCount((prev) => liked ? prev - 1 : prev + 1);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      Swal.fire({ icon: 'success', title: 'Link copied!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'info', title: 'Share this link', text: window.location.href });
    }
  };

  const handleContact = () => {
    if (!user?._id) {
      Swal.fire({
        icon: 'warning',
        title: 'Login required',
        text: 'Please login to contact the seller.',
        confirmButtonColor: '#1a1a1a',
      });
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'Message sent!',
      text: `Your interest in "${bike?.productName}" has been forwarded to the seller.`,
      confirmButtonColor: '#1a1a1a',
    });
  };

  if (device === 'mobile') {
    return (
      <Box component="div" sx={{ p: 2 }}>
        {loading && <CircularProgress />}
        {bike && (
          <>
            <Typography variant="h5" fontWeight={700}>{bike.productName}</Typography>
            <Typography variant="h6" color="primary">${bike.productPrice?.toLocaleString()}</Typography>
            {images[0] && (
              <Box component="img" src={getImageUrl(images[0], '/img/placeholder-bike.png')} alt={bike.productName}
                sx={{ width: '100%', borderRadius: 2, mt: 1 }} />
            )}
            <Typography sx={{ mt: 2 }}>{bike.productDesc}</Typography>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box component="div" id="bike-detail-page">
      {loading && (
        <Box component="div" className="bike-detail__loading">
          <CircularProgress sx={{ color: '#1a1a1a' }} size={48} />
        </Box>
      )}

      {!loading && bike && (
        <>
          {/* ── Breadcrumb ── */}
          <Box component="div" className="bike-detail__breadcrumb">
            <span onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Home</span>
            <span> / </span>
            <span onClick={() => router.push('/products')} style={{ cursor: 'pointer' }}>Bikes</span>
            <span> / </span>
            <span>{bike.productName}</span>
          </Box>

          {/* ── Main Layout ── */}
          <Box component="div" className="bike-detail__layout">

            {/* ── Gallery ── */}
            <Box component="div" className="bike-detail__gallery">
              <Box component="div" className="bike-detail__main-img-wrap">
                {images.length > 0 ? (
                  <Box
                    component="img"
                    src={getImageUrl(images[activeImg], '/img/placeholder-bike.png')}
                    alt={bike.productName}
                    className="bike-detail__main-img"
                  />
                ) : (
                  <Box component="div" className="bike-detail__img-placeholder">
                    <Typography>No image available</Typography>
                  </Box>
                )}

                {images.length > 1 && (
                  <>
                    <IconButton
                      className="bike-detail__img-btn bike-detail__img-btn--prev"
                      onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                    >
                      <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      className="bike-detail__img-btn bike-detail__img-btn--next"
                      onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  </>
                )}

                <Box component="div" className="bike-detail__img-counter">
                  {activeImg + 1} / {images.length || 1}
                </Box>
              </Box>

              {images.length > 1 && (
                <Box component="div" className="bike-detail__thumbnails">
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={getImageUrl(img, '/img/placeholder-bike.png')}
                      alt={`view ${i + 1}`}
                      className={`bike-detail__thumb ${activeImg === i ? 'bike-detail__thumb--active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* ── Info Panel ── */}
            <Box component="div" className="bike-detail__info">

              {/* Status & Type */}
              <Box component="div" className="bike-detail__badges">
                <Chip
                  label={bike.productStatus}
                  size="small"
                  className={`bike-detail__status-chip bike-detail__status-chip--${bike.productStatus.toLowerCase()}`}
                />
                <Chip
                  label={TYPE_LABEL[bike.productType] ?? bike.productType}
                  size="small"
                  className="bike-detail__type-chip"
                />
              </Box>

              {/* Name */}
              <Typography className="bike-detail__name">{bike.productName}</Typography>

              {/* Price */}
              <Typography className="bike-detail__price">
                ${bike.productPrice?.toLocaleString()}
              </Typography>

              {/* Actions */}
              <Box component="div" className="bike-detail__actions">
                <Tooltip title={liked ? 'Remove from wishlist' : 'Add to wishlist'}>
                  <IconButton onClick={handleLike} className="bike-detail__action-btn">
                    {liked
                      ? <FavoriteIcon sx={{ color: '#ef4444' }} />
                      : <FavoriteBorderIcon />}
                    <Typography className="bike-detail__action-count">{likeCount}</Typography>
                  </IconButton>
                </Tooltip>
                <Box component="div" className="bike-detail__stat">
                  <RemoveRedEyeOutlinedIcon sx={{ fontSize: 18, color: '#999' }} />
                  <Typography className="bike-detail__action-count">{bike.productViews}</Typography>
                </Box>
                <Box component="div" className="bike-detail__stat">
                  <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: '#999' }} />
                  <Typography className="bike-detail__action-count">{bike.productComments}</Typography>
                </Box>
                <Tooltip title="Share">
                  <IconButton onClick={handleShare} className="bike-detail__action-btn">
                    <ShareOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Specs */}
              <Typography className="bike-detail__section-label">Specifications</Typography>
              <Box component="div" className="bike-detail__specs">
                <Box component="div" className="bike-detail__spec-row">
                  <Typography className="bike-detail__spec-key">Frame Size</Typography>
                  <Typography className="bike-detail__spec-val">{bike.productSize}</Typography>
                </Box>
                <Box component="div" className="bike-detail__spec-row">
                  <Typography className="bike-detail__spec-key">Rider Age</Typography>
                  <Typography className="bike-detail__spec-val">
                    {bike.productAgeCategory.charAt(0) + bike.productAgeCategory.slice(1).toLowerCase()}
                  </Typography>
                </Box>
                <Box component="div" className="bike-detail__spec-row">
                  <Typography className="bike-detail__spec-key">Color</Typography>
                  <Box component="div" className="bike-detail__spec-color">
                    <Box
                      component="div"
                      className="bike-detail__color-dot"
                      sx={{ background: COLOR_MAP[bike.productColor] ?? '#ccc' }}
                    />
                    <Typography className="bike-detail__spec-val">
                      {bike.productColor.charAt(0) + bike.productColor.slice(1).toLowerCase()}
                    </Typography>
                  </Box>
                </Box>
                <Box component="div" className="bike-detail__spec-row">
                  <Typography className="bike-detail__spec-key">Category</Typography>
                  <Typography className="bike-detail__spec-val">
                    {TYPE_LABEL[bike.productType] ?? bike.productType}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Description */}
              {bike.productDesc && (
                <>
                  <Typography className="bike-detail__section-label">Description</Typography>
                  <Typography className="bike-detail__desc">{bike.productDesc}</Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* Trust badges */}
              <Box component="div" className="bike-detail__trust">
                <Box component="div" className="bike-detail__trust-item">
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                  <Typography>Verified listing</Typography>
                </Box>
                <Box component="div" className="bike-detail__trust-item">
                  <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                  <Typography>Delivery available</Typography>
                </Box>
                <Box component="div" className="bike-detail__trust-item">
                  <BuildOutlinedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  <Typography>Serviced &amp; inspected</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* CTA buttons */}
              <Box component="div" className="bike-detail__cta">
                <Button
                  fullWidth
                  variant="contained"
                  className="bike-detail__btn bike-detail__btn--primary"
                  onClick={handleContact}
                >
                  Contact Seller
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  className="bike-detail__btn bike-detail__btn--secondary"
                  onClick={handleLike}
                  startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                >
                  {liked ? 'Saved' : 'Save Bike'}
                </Button>
              </Box>

              {/* Seller card */}
              {bike.memberData && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    component="div"
                    className="bike-detail__seller"
                    onClick={() => router.push(`/member?memberId=${bike.memberId}`)}
                  >
                    <Box
                      component="img"
                      src={getImageUrl(bike.memberData.memberImage, '/img/profile/defaultUser.svg')}
                      alt={bike.memberData.memberNick}
                      className="bike-detail__seller-img"
                    />
                    <Box component="div" className="bike-detail__seller-info">
                      <Typography className="bike-detail__seller-name">
                        {bike.memberData.memberNick}
                      </Typography>
                      <Typography className="bike-detail__seller-type">
                        {bike.memberData.memberType === 'MEMBER' ? 'Professional Seller' : 'Private Seller'}
                      </Typography>
                    </Box>
                    <PersonOutlineIcon sx={{ color: '#999', ml: 'auto' }} />
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* ── Related Bikes ── */}
          {related.length > 0 && (
            <Box component="div" className="bike-detail__related">
              <Typography className="bike-detail__related-title">You May Also Like</Typography>
              <Box component="div" className="bike-detail__related-grid">
                {related.map((p) => (
                  <Box
                    component="div"
                    key={p._id}
                    onClick={() => router.push(`/products/${p._id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ProductCard product={p} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}

      {!loading && !bike && (
        <Box component="div" className="bike-detail__not-found">
          <Typography variant="h4">Bike not found</Typography>
          <Button onClick={() => router.push('/products')} sx={{ mt: 2 }}>
            Browse all bikes
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default withLayoutBasic(BikeDetailPage);
