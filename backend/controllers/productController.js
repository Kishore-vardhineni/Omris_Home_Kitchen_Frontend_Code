import Product from '../models/Product.js';

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

    // Parse stringified JSON from FormData
    if (typeof variants === 'string') variants = JSON.parse(variants);
    if (typeof tags === 'string') tags = JSON.parse(tags);
    if (typeof ingredients === 'string') ingredients = JSON.parse(ingredients);
    if (typeof certificationBadges === 'string') certificationBadges = JSON.parse(certificationBadges);
    if (typeof nutritionalInfo === 'string') nutritionalInfo = JSON.parse(nutritionalInfo);
    if (typeof seo === 'string') seo = JSON.parse(seo);
    if (typeof image === 'string') image = JSON.parse(image);
    if (typeof gallery === 'string') gallery = JSON.parse(gallery);

    // Convert string booleans
    isFeatured = isFeatured === 'true' || isFeatured === true;
    isBestseller = isBestseller === 'true' || isBestseller === true;
    isNewArrival = isNewArrival === 'true' || isNewArrival === true;
    isActive = isActive !== 'false' && isActive !== false;
    isVegetarian = isVegetarian !== 'false' && isVegetarian !== false;
    isVegan = isVegan === 'true' || isVegan === true;
    isGlutenFree = isGlutenFree === 'true' || isGlutenFree === true;
    isOrganicCertified = isOrganicCertified === 'true' || isOrganicCertified === true;

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      const baseUrl = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001';
      image = { url: `${baseUrl}/uploads/${req.files[0].filename}`, altText: name };
      if (req.files.length > 1) {
        const newGallery = req.files.slice(1).map(f => ({ url: `${baseUrl}/uploads/${f.filename}`, altText: name }));
        gallery = gallery ? [...gallery, ...newGallery] : newGallery;
      }
    }

    // ── 1. Required-field validation ──────────────────────────────────────
    if (!name || !category || !image?.url) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields: name, category, and image (with url)',
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

    // Parse stringified JSON from FormData
    if (typeof updateData.variants === 'string') updateData.variants = JSON.parse(updateData.variants);
    if (typeof updateData.tags === 'string') updateData.tags = JSON.parse(updateData.tags);
    if (typeof updateData.ingredients === 'string') updateData.ingredients = JSON.parse(updateData.ingredients);
    if (typeof updateData.certificationBadges === 'string') updateData.certificationBadges = JSON.parse(updateData.certificationBadges);
    if (typeof updateData.nutritionalInfo === 'string') updateData.nutritionalInfo = JSON.parse(updateData.nutritionalInfo);
    if (typeof updateData.seo === 'string') updateData.seo = JSON.parse(updateData.seo);
    if (typeof updateData.image === 'string') updateData.image = JSON.parse(updateData.image);
    if (typeof updateData.gallery === 'string') updateData.gallery = JSON.parse(updateData.gallery);

    // Convert string booleans
    ['isFeatured', 'isBestseller', 'isNewArrival', 'isActive', 'isVegetarian', 'isVegan', 'isGlutenFree', 'isOrganicCertified'].forEach(key => {
      if (updateData[key] === 'true') updateData[key] = true;
      if (updateData[key] === 'false') updateData[key] = false;
    });

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      const baseUrl = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001';
      updateData.image = { url: `${baseUrl}/uploads/${req.files[0].filename}`, altText: updateData.name || 'Product Image' };
      if (req.files.length > 1) {
        const newGallery = req.files.slice(1).map(f => ({ url: `${baseUrl}/uploads/${f.filename}`, altText: updateData.name || 'Product Image' }));
        updateData.gallery = updateData.gallery ? [...updateData.gallery, ...newGallery] : newGallery;
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


