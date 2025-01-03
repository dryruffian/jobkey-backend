// routes/products.js
const express = require('express');
const router = express.Router();
const base = require('../config/airtable');

// Get all products
router.get('/', async (req, res) => {
  try {
    const records = await base('Products').select().all();
    const products = records.map(record => ({
      id: record.id,
      'Product Name': record.fields['Product Name'],
      'Description': record.fields['Description'],
      'Price': record.fields['Price'],
      'Category': record.fields['Category'],
      'Inventory Level': record.fields['Inventory Level'],
      'Product Photo': record.fields['Product Photo'] || []
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const record = await base('Products').find(req.params.id);
    const product = {
      id: record.id,
      'Product Name': record.fields['Product Name'],
      'Description': record.fields['Description'],
      'Price': record.fields['Price'],
      'Category': record.fields['Category'],
      'Inventory Level': record.fields['Inventory Level'],
      'Product Photo': record.fields['Product Photo'] || []
    };
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(404).json({ message: 'Product not found' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    console.log('Received data:', req.body);  // Debug log

    // Validate required fields
    const requiredFields = ['Product Name', 'Description', 'Price', 'Category', 'Inventory Level'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Format the category as an array
    const categoryValue = Array.isArray(req.body['Category']) 
      ? req.body['Category']
      : [req.body['Category']];

    const record = await base('Products').create([
      {
        fields: {
          'Product Name': req.body['Product Name'],
          'Description': req.body['Description'],
          'Price': parseFloat(req.body['Price']),
          'Category': categoryValue,
          'Inventory Level': parseInt(req.body['Inventory Level']),
          'Product Photo': req.body['Product Photo'] || []
        }
      }
    ]);

    console.log('Created record:', record);  // Debug log

    res.status(201).json({
      id: record[0].id,
      ...record[0].fields
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error.message);  // Additional error details
    res.status(400).json({ 
      message: 'Error creating product: ' + error.message,
      details: error.statusCode
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const productData = {};

    // Only update provided fields
    const allowedFields = ['Product Name', 'Description', 'Price', 'Category', 'Inventory Level', 'Product Photo'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'Price') {
          productData[field] = parseFloat(req.body[field]);
        } else if (field === 'Inventory Level') {
          productData[field] = parseInt(req.body[field]);
        } else if (field === 'Category') {
          productData[field] = Array.isArray(req.body[field]) 
            ? req.body[field]
            : [req.body[field]];
        } else {
          productData[field] = req.body[field];
        }
      }
    });

    const record = await base('Products').update([
      {
        id: req.params.id,
        fields: productData
      }
    ]);

    res.json({
      id: record[0].id,
      ...record[0].fields
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Error updating product: ' + error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await base('Products').destroy([req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;