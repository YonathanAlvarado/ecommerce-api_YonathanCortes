const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');

// Función para leer productos desde el archivo
const readProducts = () => JSON.parse(fs.readFileSync(productsFilePath, 'utf-8') || '[]');

// Función para escribir productos en el archivo
const writeProducts = (products) => fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');

// Ruta para obtener todos los productos, con soporte para ?limit
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit);
    const products = readProducts();

    if (!isNaN(limit) && limit > 0) {
        return res.json(products.slice(0, limit));
    }

    res.json(products);
});

// Ruta para obtener un producto específico por ID
router.get('/:pid', (req, res) => {
    const products = readProducts();
    const product = products.find(p => p.id === req.params.pid);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Ruta para agregar un nuevo producto
router.post('/', (req, res) => {
    const products = readProducts();

    const newId = products.length > 0 ? String(Number(products[products.length - 1].id) + 1) : "1";

    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || stock === undefined || !category) {
        return res.status(400).json({ error: 'All fields except thumbnails are required' });
    }

    const newProduct = { id: newId, title, description, code, price, status, stock, category, thumbnails };

    products.push(newProduct);
    writeProducts(products);

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
});

// Ruta para actualizar un producto por ID
router.put('/:pid', (req, res) => {
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === req.params.pid);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const { id, ...updates } = req.body;
    products[productIndex] = { ...products[productIndex], ...updates };
    writeProducts(products);

    res.json({ message: 'Product updated successfully', product: products[productIndex] });
});

// Ruta para eliminar un producto por ID
router.delete('/:pid', (req, res) => {
    let products = readProducts();
    const productIndex = products.findIndex(p => p.id === req.params.pid);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    products = products.filter(p => p.id !== req.params.pid);
    writeProducts(products);

    res.json({ message: 'Product deleted successfully' });
});

module.exports = router;
