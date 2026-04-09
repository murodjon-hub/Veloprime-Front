import React, { useRef, useState, ChangeEvent } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import axios from "axios";
import { CREATE_PRODUCT } from "../../../apollo/admin/mutation";
import { ProductInput } from "../../../libs/types/product/productInput";
import { 
  ProductAgeCategory, 
  ProductColor, 
  ProductSize, 
  ProductStatus, 
  ProductType 
} from "../../../libs/enums/product/product";
import withLayoutBasic from "../../../libs/components/layout/LayoutBasic";
import { getJwtToken } from "../../../libs/auth";

const AddProduct = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = getJwtToken();

  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [uploading, setUploading] = useState(false);

  const [product, setProduct] = useState<ProductInput>({
    productName: "",
    productPrice: 0,
    productType: ProductType.ROAD,
    productStatus: ProductStatus.ACTIVE,
    productAgeCategory: ProductAgeCategory.ADULT,
    productColor: ProductColor.BLACK,
    productSize: ProductSize.M,
    productImages: [],
    productDesc: "",
  });

  const handleChange = (key: keyof ProductInput, value: any) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("Files selected:", files);
    
    if (!files || files.length === 0) {
      console.log("No files selected, returning");
      return;
    }

    console.log("File count:", files.length);

    if (files.length > 5) {
      return Swal.fire({
        icon: "warning",
        title: "Too many files",
        text: "You can upload a maximum of 5 images.",
      });
    }

    try {
      setUploading(true);
      const formData = new FormData();

      const nullsArray = Array(files.length).fill(null);
      const map: Record<string, string[]> = {};
      for (let i = 0; i < files.length; i++) {
        map[`${i}`] = [`variables.files.${i}`];
      }

      formData.append(
        "operations",
        JSON.stringify({
          query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
            imagesUploader(files: $files, target: $target)
          }`,
          variables: {
            files: nullsArray,
            target: "product",
          },
        })
      );

      formData.append("map", JSON.stringify(map));

      for (const key in files) {
        if (/^\d+$/.test(key)) formData.append(`${key}`, files[key]);
      }

      console.log("Sending request to:", process.env.NEXT_PUBLIC_API_GRAPHQL_URL);

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_GRAPHQL_URL!,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "apollo-require-preflight": true,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response:", response.data);

      const uploadedImages: string[] = response.data.data.imagesUploader;
      console.log("Uploaded images:", uploadedImages);

      setProduct((prev) => ({
        ...prev,
        productImages: [...prev.productImages, ...uploadedImages],
      }));

    } catch (err: any) {
      console.error("Upload error details:", err.response?.data || err.message);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message || "Something went wrong during image upload.",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!product.productName || product.productPrice <= 0 || !product.productDesc) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields and ensure price is greater than 0.",
        confirmButtonColor: "#3085d6",
      });
    }

    if (product.productImages.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "No Images",
        text: "Please upload at least one product image.",
      });
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to create this new product?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, create it!",
      });

      if (result.isConfirmed) {
        await createProduct({ variables: { input: product } });

        await Swal.fire({
          icon: "success",
          title: "Created!",
          text: "Product has been successfully added.",
          timer: 2000,
          showConfirmButton: false,
        });

        router.push("/products");
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.message || "Something went wrong while creating the product.",
      });
    }
  };

  return (
    <div className="add-product-container">
      <div className="form-card">
        <header className="form-header">
          <h1>Add New Product</h1>
          <p>Fill in the details below to list a new product in the store.</p>
        </header>

        <div className="form-body">

          {/* Product Name */}
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={product.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
            />
          </div>

          {/* Price & Type */}
          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={product.productPrice}
                onChange={(e) => handleChange("productPrice", Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={product.productType}
                onChange={(e) => handleChange("productType", e.target.value)}
              >
                {Object.values(ProductType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Size */}
          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <select
                value={product.productColor}
                onChange={(e) => handleChange("productColor", e.target.value)}
              >
                {Object.values(ProductColor).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Size</label>
              <select
                value={product.productSize}
                onChange={(e) => handleChange("productSize", e.target.value)}
              >
                {Object.values(ProductSize).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Age Category */}
          <div className="form-group">
            <label>Age Category</label>
            <select
              value={product.productAgeCategory}
              onChange={(e) => handleChange("productAgeCategory", e.target.value)}
            >
              {Object.values(ProductAgeCategory).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={4}
              placeholder="Describe the product features..."
              value={product.productDesc}
              onChange={(e) => handleChange("productDesc", e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Product Images</label>
            <div
              className="upload-zone"
              onClick={() => !uploading && fileInputRef.current?.click()}
              style={{ cursor: uploading ? "not-allowed" : "pointer" }}
            >
              <div className="upload-content">
                <i className="upload-icon">📁</i>
                <span>{uploading ? "Uploading..." : "Click to upload images"}</span>
                <small>Max 5 images • JPEG or PNG</small>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
                accept="image/jpg, image/jpeg, image/png"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Image Previews */}
          {product.productImages.length > 0 && (
            <div className="image-preview-grid">
              {product.productImages.map((img, i) => (
                <div key={i} className="preview-item">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
                    alt={`Preview ${i}`}
                  />
                  <button
                    className="remove-btn"
                    onClick={() => removeImage(i)}
                    title="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => router.back()}>
              Cancel
            </button>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Create Product"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default withLayoutBasic(AddProduct);