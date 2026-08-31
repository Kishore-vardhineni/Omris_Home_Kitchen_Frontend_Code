import Product from '../models/Product.js';
import { saveBase64Image } from '../config/multer.js';

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CONTROLLER
// All handlers follow the same { success, message, data } envelope pattern
// used in authController.js.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const addProduct = async (req, res) => {
  try {
    let {
      name, category, subCategory, tags, shortDescription, longDescription,
      ingredients, shelfLife, storageInstructions, image, gallery, variants,
      isFeatured, isBestseller, isNewArrival, isActive, isVegetarian, isVegan,
      isGlutenFree, isOrganicCertified, certificationBadges, nutritionalInfo, seo,
    } = req.body;

    // Parse stringified JSON from body fields
    if (typeof variants === 'string') { try { variants = JSON.parse(variants); } catch (e) { variants = []; } }
    if (typeof tags === 'string') { try { tags = JSON.parse(tags); } catch (e) { tags = []; } }
    if (typeof ingredients === 'string') { try { ingredients = JSON.parse(ingredients); } catch (e) { ingredients = []; } }
    if (typeof certificationBadges === 'string') { try { certificationBadges = JSON.parse(certificationBadges); } catch (e) { certificationBadges = []; } }
    if (typeof nutritionalInfo === 'string') { try { nutritionalInfo = JSON.parse(nutritionalInfo); } catch (e) { nutritionalInfo = undefined; } }
    if (typeof seo === 'string') { try { seo = JSON.parse(seo); } catch (e) { seo = undefined; } }

    // Normalize image if string or imageUrl field is passed
    if (typeof image === 'string') {
      try {
        if (image.trim().startsWith('{')) image = JSON.parse(image);
        else image = { url: image.trim(), altText: name || 'Product Image' };
      } catch (e) {
        image = { url: image.trim(), altText: name || 'Product Image' };
      }
    }
    if (!image && req.body.imageUrl) {
      image = { url: req.body.imageUrl.trim(), altText: req.body.imageAlt || name || 'Product Image' };
    }

    // Normalize gallery if stringified or array of URL strings
    if (typeof gallery === 'string') {
      try { gallery = JSON.parse(gallery); } catch (e) { gallery = []; }
    }
    if (Array.isArray(gallery)) {
      gallery = gallery.map(g => (typeof g === 'string' ? { url: g.trim(), altText: name || 'Product Image' } : g)).filter(g => g && g.url);
    } else {
      gallery = [];
    }

    // Convert string booleans
    isFeatured = isFeatured === 'true' || isFeatured === true;
    isBestseller = isBestseller === 'true' || isBestseller === true;
    isNewArrival = isNewArrival === 'true' || isNewArrival === true;
    isActive = isActive !== 'false' && isActive !== false;
    isVegetarian = isVegetarian !== 'false' && isVegetarian !== false;
    isVegan = isVegan === 'true' || isVegan === true;
    isGlutenFree = isGlutenFree === 'true' || isGlutenFree === true;
    isOrganicCertified = isOrganicCertified === 'true' || isOrganicCertified === true;

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    // Process structured primaryImage payload ({ base64, url, altText })
    if (req.body.primaryImage) {
      let pImg = req.body.primaryImage;
      if (typeof pImg === 'string') { try { pImg = JSON.parse(pImg); } catch (e) {} }
      if (pImg && typeof pImg === 'object') {
        if (pImg.base64) {
          try {
            const filename = saveBase64Image(pImg.base64, 'product');
            image = { url: `${baseUrl}/uploads/${filename}`, altText: pImg.altText || name || 'Product Image' };
          } catch (err) {
            console.error('Primary image save error:', err);
          }
        } else if (pImg.url) {
          image = { url: pImg.url.trim(), altText: pImg.altText || name || 'Product Image' };
        }
      }
    }

    // Process structured galleryItems payload ([{ base64, url, altText }, ...])
    if (req.body.galleryItems) {
      let gItems = req.body.galleryItems;
      if (typeof gItems === 'string') { try { gItems = JSON.parse(gItems); } catch (e) { gItems = []; } }
      if (Array.isArray(gItems)) {
        const processedGallery = [];
        for (const item of gItems) {
          if (!item) continue;
          if (item.base64) {
            try {
              const filename = saveBase64Image(item.base64, 'gallery');
              processedGallery.push({ url: `${baseUrl}/uploads/${filename}`, altText: item.altText || name || 'Gallery Image' });
            } catch (err) {
              console.error('Gallery item save error:', err);
            }
          } else if (item.url) {
            processedGallery.push({ url: item.url.trim(), altText: item.altText || name || 'Gallery Image' });
          }
        }
        gallery = processedGallery;
      }
    }

    // Fallback: Process legacy uploaded base64 images array
    let base64List = req.body.base64Images;
    if (typeof base64List === 'string') {
      try { base64List = JSON.parse(base64List); } catch (e) { base64List = [base64List]; }
    }

    if (!image?.url && Array.isArray(base64List) && base64List.length > 0) {
      try {
        const filename0 = saveBase64Image(base64List[0], 'product');
        image = { url: `${baseUrl}/uploads/${filename0}`, altText: name || 'Product Image' };
        if (base64List.length > 1) {
          const newGallery = base64List.slice(1).map(b64 => {
            const fn = saveBase64Image(b64, 'product');
            return { url: `${baseUrl}/uploads/${fn}`, altText: name || 'Product Image' };
          });
          gallery = [...gallery, ...newGallery];
        }
      } catch (imgErr) {
        console.error('Image save error in addProduct:', imgErr);
        return res.status(400).json({ success: false, message: `Image upload failed: ${imgErr.message}` });
      }
    }

    // ── Image Fallback & Normalization ──────────────────────────────────────
    if (!image || !image.url) {
      if (req.body.primaryImage && typeof req.body.primaryImage === 'string') {
        try {
          const fn = saveBase64Image(req.body.primaryImage, 'product');
          image = { url: `${baseUrl}/uploads/${fn}`, altText: name || 'Product Image' };
        } catch (e) {
          console.error('Fallback image save error:', e.message);
        }
      }
    }

    if (!image || !image.url) {
      image = {
        url: `${baseUrl}/uploads/default-pickle.jpg`,
        altText: name || 'Product Image',
      };
    }

    // ── 1. Required-field validation ──────────────────────────────────────
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Product Name and Category',
      });
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one variant (weight / packing size) is required',
      });
    }

    // ── 2. Validate each variant has required sub-fields ─────────────────
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.label || !v.weightInGrams || !v.sku || v.price == null) {
        return res.status(400).json({
          success: false,
          message: `Variant ${i + 1}: label, weightInGrams, sku, and price are all required`,
        });
      }
      if (v.price < 0) {
        return res.status(400).json({
          success: false,
          message: `Variant ${i + 1}: price cannot be negative`,
        });
      }
      if (v.discountedPrice != null && v.discountedPrice > v.price) {
        return res.status(400).json({
          success: false,
          message: `Variant ${i + 1}: discountedPrice must be ≤ price`,
        });
      }
    }

    // ── 3. Check for duplicate product name / slug ───────────────────────
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const existingProduct = await Product.findOne({
      $or: [{ slug }, { name: { $regex: new RegExp(`^${name}$`, 'i') } }],
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'A product with this name already exists',
      });
    }

    // ── 4. Check for duplicate SKUs within the payload ───────────────────
    const skus = variants.map((v) => v.sku.toUpperCase().trim());
    const uniqueSkus = new Set(skus);
    if (uniqueSkus.size !== skus.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate SKUs found within variants — each SKU must be unique',
      });
    }

    // Check against existing SKUs in the database
    const existingSku = await Product.findOne({
      'variants.sku': { $in: skus },
    });
    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: 'One or more SKUs already exist in the catalogue',
      });
    }

    // ── 5. Build product document ────────────────────────────────────────
    const productData = {
      name:               name.trim(),
      category,
      subCategory:        subCategory || undefined,
      tags:               Array.isArray(tags) ? tags : [],
      shortDescription:   shortDescription || undefined,
      longDescription:    longDescription || undefined,
      ingredients:        Array.isArray(ingredients) ? ingredients : [],
      shelfLife:          shelfLife || undefined,
      storageInstructions: storageInstructions || undefined,
      image,
      gallery:            Array.isArray(gallery) ? gallery : [],
      variants,
      isFeatured:         !!isFeatured,
      isBestseller:       !!isBestseller,
      isNewArrival:       !!isNewArrival,
      isActive:           isActive !== false,       // Default true unless explicitly false
      isVegetarian:       isVegetarian !== false,    // Default true for Omris
      isVegan:            !!isVegan,
      isGlutenFree:       !!isGlutenFree,
      isOrganicCertified: !!isOrganicCertified,
      certificationBadges: Array.isArray(certificationBadges) ? certificationBadges : [],
      nutritionalInfo:    nutritionalInfo || undefined,
      seo:                seo || undefined,
    };

    // ── 6. Create product (slug auto-generated by pre-save hook) ─────────
    const product = await Product.create(productData);

    // ── 7. Respond ───────────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        _id:              product._id,
        name:             product.name,
        slug:             product.slug,
        category:         product.category,
        subCategory:      product.subCategory,
        shortDescription: product.shortDescription,
        image:            product.image,
        variants:         product.variants,
        isFeatured:       product.isFeatured,
        isActive:         product.isActive,
        startingPrice:    product.startingPrice,   // Virtual
        inStock:          product.inStock,          // Virtual
        createdAt:        product.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in addProduct:', error);

    // Mongoose duplicate-key error (slug or SKU collision)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `Duplicate value detected for "${field}". Please use a unique value.`,
      });
    }

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all products (with optional category filter)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const { category, featured, bestseller, active, search, page = 1, limit = 12 } = req.query;

    // Build filter object
    const filter = {};
    if (category)   filter.category   = category;
    if (featured)   filter.isFeatured  = featured === 'true';
    if (bestseller) filter.isBestseller = bestseller === 'true';
    if (active !== undefined) {
      filter.isActive = active === 'true';
    } else {
      filter.isActive = true; // Default: only show active products
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      products,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:idOrSlug
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // Try ObjectId first, then fall back to slug lookup
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const product = isObjectId
      ? await Product.findById(idOrSlug)
      : await Product.findOne({ slug: idOrSlug, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Parse stringified JSON from updateData fields
    if (typeof updateData.variants === 'string') { try { updateData.variants = JSON.parse(updateData.variants); } catch (e) {} }
    if (typeof updateData.tags === 'string') { try { updateData.tags = JSON.parse(updateData.tags); } catch (e) {} }
    if (typeof updateData.ingredients === 'string') { try { updateData.ingredients = JSON.parse(updateData.ingredients); } catch (e) {} }
    if (typeof updateData.certificationBadges === 'string') { try { updateData.certificationBadges = JSON.parse(updateData.certificationBadges); } catch (e) {} }
    if (typeof updateData.nutritionalInfo === 'string') { try { updateData.nutritionalInfo = JSON.parse(updateData.nutritionalInfo); } catch (e) {} }
    if (typeof updateData.seo === 'string') { try { updateData.seo = JSON.parse(updateData.seo); } catch (e) {} }

    // Normalize image if string or imageUrl field is passed
    if (typeof updateData.image === 'string') {
      try {
        if (updateData.image.trim().startsWith('{')) updateData.image = JSON.parse(updateData.image);
        else updateData.image = { url: updateData.image.trim(), altText: updateData.name || 'Product Image' };
      } catch (e) {
        updateData.image = { url: updateData.image.trim(), altText: updateData.name || 'Product Image' };
      }
    }
    if (!updateData.image && updateData.imageUrl) {
      updateData.image = { url: updateData.imageUrl.trim(), altText: updateData.imageAlt || updateData.name || 'Product Image' };
    }

    // Normalize gallery if stringified or array of URL strings
    if (typeof updateData.gallery === 'string') {
      try { updateData.gallery = JSON.parse(updateData.gallery); } catch (e) { updateData.gallery = []; }
    }
    if (Array.isArray(updateData.gallery)) {
      updateData.gallery = updateData.gallery.map(g => (typeof g === 'string' ? { url: g.trim(), altText: updateData.name || 'Product Image' } : g)).filter(g => g && g.url);
    }

    // Convert string booleans
    ['isFeatured', 'isBestseller', 'isNewArrival', 'isActive', 'isVegetarian', 'isVegan', 'isGlutenFree', 'isOrganicCertified'].forEach(key => {
      if (updateData[key] === 'true') updateData[key] = true;
      if (updateData[key] === 'false') updateData[key] = false;
    });

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    // Process structured primaryImage payload ({ base64, url, altText })
    if (req.body.primaryImage) {
      let pImg = req.body.primaryImage;
      if (typeof pImg === 'string') { try { pImg = JSON.parse(pImg); } catch (e) {} }
      if (pImg && typeof pImg === 'object') {
        if (pImg.base64) {
          try {
            const filename = saveBase64Image(pImg.base64, 'product');
            updateData.image = { url: `${baseUrl}/uploads/${filename}`, altText: pImg.altText || updateData.name || 'Product Image' };
          } catch (err) {
            console.error('Primary image save error in update:', err);
          }
        } else if (pImg.url) {
          updateData.image = { url: pImg.url.trim(), altText: pImg.altText || updateData.name || 'Product Image' };
        }
      }
    }

    // Process structured galleryItems payload ([{ base64, url, altText }, ...])
    if (req.body.galleryItems) {
      let gItems = req.body.galleryItems;
      if (typeof gItems === 'string') { try { gItems = JSON.parse(gItems); } catch (e) { gItems = []; } }
      if (Array.isArray(gItems)) {
        const processedGallery = [];
        for (const item of gItems) {
          if (!item) continue;
          if (item.base64) {
            try {
              const filename = saveBase64Image(item.base64, 'gallery');
              processedGallery.push({ url: `${baseUrl}/uploads/${filename}`, altText: item.altText || updateData.name || 'Gallery Image' });
            } catch (err) {
              console.error('Gallery item save error in update:', err);
            }
          } else if (item.url) {
            processedGallery.push({ url: item.url.trim(), altText: item.altText || updateData.name || 'Gallery Image' });
          }
        }
        updateData.gallery = processedGallery;
      }
    }

    // Fallback: Process legacy uploaded base64 images
    let base64ListUpdate = req.body.base64Images;
    if (typeof base64ListUpdate === 'string') {
      try { base64ListUpdate = JSON.parse(base64ListUpdate); } catch (e) { base64ListUpdate = [base64ListUpdate]; }
    }

    if (!updateData.image?.url && Array.isArray(base64ListUpdate) && base64ListUpdate.length > 0) {
      try {
        const filename0 = saveBase64Image(base64ListUpdate[0], 'product');
        updateData.image = { url: `${baseUrl}/uploads/${filename0}`, altText: updateData.name || 'Product Image' };
        if (base64ListUpdate.length > 1) {
          const newGallery = base64ListUpdate.slice(1).map(b64 => {
            const fn = saveBase64Image(b64, 'product');
            return { url: `${baseUrl}/uploads/${fn}`, altText: updateData.name || 'Product Image' };
          });
          updateData.gallery = updateData.gallery && Array.isArray(updateData.gallery)
            ? [...updateData.gallery, ...newGallery]
            : newGallery;
        }
      } catch (imgErr) {
        console.error('Image save error in updateProduct:', imgErr);
        return res.status(400).json({ success: false, message: `Image upload failed: ${imgErr.message}` });
      }
    }

    // ── 1. Check if product exists ─────────────────────────────────────────
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // ── 2. Check for duplicate name / slug ────────────────────────────────
    if (updateData.name && updateData.name !== product.name) {
      const slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const existingProduct = await Product.findOne({
        _id: { $ne: id },
        $or: [{ slug }, { name: { $regex: new RegExp(`^${updateData.name}$`, 'i') } }],
      });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'A product with this name already exists',
        });
      }
    }

    // ── 3. Validate SKUs if variants are updated ──────────────────────────
    if (updateData.variants && Array.isArray(updateData.variants) && updateData.variants.length > 0) {
      const skus = updateData.variants.map((v) => (v.sku || '').toUpperCase().trim());
      const uniqueSkus = new Set(skus);
      if (uniqueSkus.size !== skus.length) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate SKUs found within variants — each SKU must be unique',
        });
      }

      const existingSku = await Product.findOne({
        _id: { $ne: id },
        'variants.sku': { $in: skus },
      });

      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: 'One or more SKUs already exist in the catalogue',
        });
      }
    }

    // ── 4. Update the product ──────────────────────────────────────────────
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // ── 5. Respond ─────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `Duplicate value detected for "${field}". Please use a unique value.`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message,
    });
  }
};


