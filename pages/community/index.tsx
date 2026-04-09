
import { NextPage } from "next";
import { Box, Typography, Button, Card, CardContent, CardMedia, Chip, Stack } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import React from 'react';
import useDeviceDetect from "../../libs/hooks/useDeviceDetect";
import withLayoutBasic from "../../libs/components/layout/LayoutBasic";

const Community: NextPage = () => {
  interface BlogPost {
  id: string;
  title: string;
  date: string;
  categories: string[];
  excerpt: string;
  image: string;
}

const blogCategories = [
  'All Posts',
  'Nutrition',
  'Healthy Eating',
  'Salads',
  'Fruits',
  'Wellness',
  'Lifestyle',
  'Recipes',
];

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Sugar can make us addicts. How to fight against it!',
    date: 'April 27, 2023',
    categories: ['Salads', 'Fruits'],
    excerpt: 'Sugar is a super controversial ingredient! It can cause addiction and is often found in tons of ultra-processed foods!...',
    image: '../img/patrick-hendry-1ow9zrlldJU-unsplash.jpg',
  },
  {
    id: '2',
    title: '10 Superfoods you should include in your diet',
    date: 'May 12, 2023',
    categories: ['Nutrition', 'Wellness'],
    excerpt: 'Discover the most nutrient-dense foods on the planet that can help boost your immune system and energy levels naturally...',
    image: '../img/Blogs/dmitrii-vaccinium-9qsK2QHidmg-unsplash.jpg',
  },
  {
    id: '3',
    title: 'The benefits of a plant-based Mediterranean diet',
    date: 'June 05, 2023',
    categories: ['Healthy Eating', 'Recipes'],
    excerpt: 'The Mediterranean diet is more than just a meal plan; it is a lifestyle that promotes heart health and longevity...',
    image: '../img/Blogs/gabriel-rissi-6GGBPumFWeE-unsplash.jpg',
  },
  {
    id: '4',
    title: 'How to start your day with a healthy breakfast',
    date: 'June 18, 2023',
    categories: ['Wellness', 'Recipes'],
    excerpt: 'Starting your morning with the right nutrients can set the tone for your entire day. Here are some quick and easy ideas...',
    image: '../img/Blogs/rayyu-maldives-i-rETD5k1Qk-unsplash.jpg',
  },
  {
    id: '5',
    title: 'Understanding the impact of processed foods',
    date: 'July 02, 2023',
    categories: ['Nutrition', 'Lifestyle'],
    excerpt: 'Not all processed foods are bad, but knowing which ones to avoid can make a huge difference in your long-term health...',
    image: '../img/Blogs/saurav-kundu-H8QttyFgroY-unsplash.jpg',
  },
  {
    id: '6',
    title: 'Seasonal fruits you must try this summer',
    date: 'July 15, 2023',
    categories: ['Fruits', 'Healthy Eating'],
    excerpt: 'Summer brings a bounty of delicious and hydrating fruits. Learn about the best picks for the season and their benefits...',
    image: '../img/Blogs/alessio-soggetti-JQGGf6OuIdQ-unsplash.jpg',
  },
];
  const device = useDeviceDetect();

  if (device === "mobile") {
    return <Stack>COMMUNITY MOBILE</Stack>;
  } else {
    return (
      <Box className="blogs-page-container">
      <Box className="blogs-header">
        <Typography variant="h2" className="page-title">
          OUR BLOGS
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<CreateIcon />}
          className="write-blog-button"
        >
          Write a Blog
        </Button>
      </Box>

      <Box className="blogs-layout">
        {/* Sidebar */}
        <Box className="blogs-sidebar">
          <Typography variant="h6" className="sidebar-title">
            Categories
          </Typography>
          <ul className="category-list">
            {blogCategories.map((cat) => (
              <li key={cat} className={`category-item ${cat === 'All Posts' ? 'active' : ''}`}>
                {cat}
              </li>
            ))}
          </ul>
        </Box>

        {/* Blog Grid */}
        <Box className="blog-grid">
          {blogPosts.map((post) => (
            <Card key={post.id} className="blog-card" elevation={0}>
              <CardMedia
                component="img"
                image={post.image}
                alt={post.title}
                className="blog-card-image"
              />
              <CardContent className="blog-card-content">
                <Box className="blog-card-meta">
                  <Typography variant="body2" className="blog-date">
                    {post.date}
                  </Typography>
                  <Box className="blog-categories">
                    {post.categories.map((cat, index) => (
                      <React.Fragment key={cat}>
                        <Typography variant="body2" className="blog-category-link">
                          {cat}
                        </Typography>
                        {index < post.categories.length - 1 && (
                          <span className="category-separator">•</span>
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>
                
                <Typography variant="h5" className="blog-title">
                  {post.title}
                </Typography>
                
                <Typography variant="body2" className="blog-excerpt">
                  {post.excerpt} <span className="read-more">Read more</span>
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
    );
  }
};

export default withLayoutBasic(Community);
