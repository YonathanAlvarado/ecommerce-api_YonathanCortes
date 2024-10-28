const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// Función para leer carritos desde el archivo
const readCarts = () => JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8') || '[]');

// Función para escribir carritos en el archivo
const writeCarts = (carts) => fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2), 'utf-8');

// Función para leer los productos desde el archivo
const readProducts = () => JSON.parse(fs.readFileSync(productsFilePath, 'utf-8') || '[]');

// Ruta para crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = readCarts();

    const newId = carts.length > 0 ? String(Number(carts[carts.length - 1].id) + 1) : "1";

    const newCart = { id: newId, products: [] };

    carts.push(newCart);
    writeCarts(carts);

    res.status(201).json({ message: 'Cart created successfully', cart: newCart });
});

// Ruta para listar los productos de un carrito específico
router.get('/:cid', (req, res) => {
    const carts = readCarts();
    const cart = carts.find(c => c.id === req.params.cid);

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(cart.products);
});

// Ruta para agregar un producto a un carrito específico
router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCarts();
    const products = readProducts();

    const cartIndex = carts.findIndex(c => c.id === req.params.cid);
    if (cartIndex === -1) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    const product = products.find(p => p.id === req.params.pid);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const cart = carts[cartIndex];
    const productInCart = cart.products.find(p => p.product === req.params.pid);

    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    writeCarts(carts);

    res.json({ message: 'Product added to cart successfully', cart });
});

module.exports = router;
