const express = require('express');
const router = express.Router();
const base = require('../config/airtable');

router.get('/', async (req, res) => {
  try {
    const records = await base('Orders').select({
      view: 'Grid view'
    }).all();

    const orders = records.map(record => ({
      id: record.id,
      orderId: record.fields['Order ID'],
      orderDate: record.fields['Order Date'],
      totalPrice: record.fields['Total Price'],
      totalQuantity: record.fields['Total Quantity'],
      shippingAddress: record.fields['Shipping Address'],
      orderStatus: record.fields['Order Status'],
      productList: record.fields['Product List'],
      customer: record.fields['Customer'],
      createdTime: record.createdTime
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const record = await base('Orders').find(req.params.id);
    const order = {
      id: record.id,
      orderId: record.fields['Order ID'],
      orderDate: record.fields['Order Date'],
      totalPrice: record.fields['Total Price'],
      totalQuantity: record.fields['Total Quantity'],
      shippingAddress: record.fields['Shipping Address'],
      orderStatus: record.fields['Order Status'],
      productList: record.fields['Product List'],
      customer: record.fields['Customer'],
      createdTime: record.createdTime
    };
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(404).json({ message: 'Order not found' });
  }
});


router.post('/', async (req, res) => {
  try {
    const {
      totalPrice,
      productList,
      shippingAddress,
      totalQuantity,
      customer
    } = req.body;

    const allOrders = await base('Orders').select({
      fields: ['Order ID'],
      sort: [{ field: 'Order ID', direction: 'desc' }]
    }).firstPage();

    let nextOrderNum = 1;
    if (allOrders.length > 0) {
      const lastOrderId = allOrders[0].fields['Order ID'];
      const lastNum = parseInt(lastOrderId.replace('ORD', ''));
      nextOrderNum = lastNum + 1;
    }
    const orderId = `ORD${String(nextOrderNum).padStart(3, '0')}`;

    const record = await base('Orders').create({
      fields: {
        'Order ID': orderId,
        'Order Date': new Date().toISOString().split('T')[0],
        'Total Price': totalPrice,
        'Total Quantity': totalQuantity,
        'Shipping Address': shippingAddress,
        'Order Status': 'Pending',
        'Product List': productList,
        'Customer': customer
      }
    });

    const newOrder = {
      id: record.id,
      orderId: record.fields['Order ID'],
      orderDate: record.fields['Order Date'],
      totalPrice: record.fields['Total Price'],
      totalQuantity: record.fields['Total Quantity'],
      shippingAddress: record.fields['Shipping Address'],
      orderStatus: record.fields['Order Status'],
      productList: record.fields['Product List'],
      customer: record.fields['Customer'],
      createdTime: record.createdTime
    };

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Error creating order' });
  }
});


router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const record = await base('Orders').update(req.params.id, {
      fields: {
        'Order Status': status
      }
    });

    const updatedOrder = {
      id: record.id,
      orderId: record.fields['Order ID'],
      orderStatus: record.fields['Order Status']
    };

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ message: 'Error updating order status' });
  }
});

module.exports = router;