import React, { useState } from "react";
import { Stack, Box } from "@mui/material";


interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  src: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Trailblazer 4.0 - Forest Green',
    category: 'Enduro / Trail',
    price: '$699.00 USD',
    src: '../img/4253517958_2224302_3.png', 
  },
  {
    id: 2,
    name: 'RidgeX 3.8 - Ocean Blue',
    category: 'Road / Race',
    price: '$899.00 USD',
    src: '../img/4253517958_2224302_3.png', 
  },
  {
    id: 3,
    name: 'AeroBolt 4.0 - Flame Red',
    category: 'City / Urban',
    price: '$750.00 USD',
    src: '../img/4253517958_2224302_3.png', 
  },
  {
    id: 4,
    name: 'VoltEdge 3.6 - Matte Black',
    category: 'Hybrid / All-Rounder',
    price: '$999.00 USD',
    src: '../img/4253517958_2224302_3.png', 
  },
];
const TrendProperties = () => {
  return (
    <Stack className={"trend-properties"}>
      <section className="new-arrivals-section">
        <div className="new-arrivals-header">
          <h2 className="new-arrivals-title">New Arrivals</h2>
          <button className="new-arrivals-see-all-btn">
            See All
            <svg
              className="new-arrivals-arrow-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>

        <div className="new-arrivals-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-header">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
              </div>

              <div className="product-image-container">
                <img
                  className="product-image"
                  src={product.src}
                  alt={product.name}
                />
              </div>

              <div className="product-card-footer">
                <span className="product-price">{product.price}</span>
                <button className="product-buy-btn">Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Stack>
  );
};

export default TrendProperties;
