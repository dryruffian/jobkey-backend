
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());


const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');


app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));