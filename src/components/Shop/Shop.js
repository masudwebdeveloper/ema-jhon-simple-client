import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';

/*
count: pages
perpage (size): 10
pages: count / size
currentPage
*/
const Shop = () => {
   const [cart, setCart] = useState([]);
   // const { products, count } = useLoaderData();
   const [products, setProducts] = useState([]);
   const [count, setCount] = useState(0);
   const [size, setSize] = useState(9);
   const [page, setPage] = useState(0);

   useEffect(() => {
      const url = `http://localhost:5000/products?page=${page}&size=${size}`;
      fetch(url)
         .then(res => res.json())
         .then(data => {
            setProducts(data.products)
            setCount(data.count)
         })
   }, [page, size]);

   const pages = Math.ceil(count / size);

   useEffect(() => {
      const storedCart = getShoppingCart();
      const savedCart = [];
      const ids = Object.keys(storedCart);
      console.log(ids);

      fetch('http://localhost:5000/productsByIds', {
         method: 'POST',
         headers: {
            'content-type': 'application/json'
         },
         body: JSON.stringify(ids)

      })
         .then(res => res.json())
         .then(data => {
            console.log('by ids', data);
            for (const id in storedCart) {
               const getProduct = data.find(product => product._id === id);
               if (getProduct) {
                  const quantity = storedCart[id];
                  getProduct.quantity = quantity;
                  savedCart.push(getProduct);
               }
            }
            setCart(savedCart);
         })


   }, [products]);


   const handleAddToCart = (selectedProduct) => {
      let newCart = [];
      const exists = cart.find(product => product._id === selectedProduct._id);
      if (!exists) {
         selectedProduct.quantity = 1;
         newCart = [...cart, selectedProduct];
      } else {
         const rest = cart.filter(product => product._id !== selectedProduct._id);
         exists.quantity = exists.quantity + 1;
         newCart = [...rest, exists];
      }
      setCart(newCart);
      addToDb(selectedProduct._id)
   }

   const clearCart = () => {
      setCart([]);
      deleteShoppingCart();
   }
   return (
      <div className='shop-container'>
         <div className="product-container">
            {
               products.map(product => <Product
                  key={product._id}
                  product={product}
                  handleAddToCart={handleAddToCart}
               ></Product>)
            }

         </div>
         <div className="cart-container">
            <Cart clearCart={clearCart} cart={cart}>
               <Link to='/order'>
                  <button>Review Order</button>
               </Link>
            </Cart>
         </div>
         <div className='pagination'>
            <h3>current selected page: {page} & size: {size}</h3>
            {
               [...Array(pages).keys()].map(number => <button
                  key={number}
                  className={page === number && 'selected'}
                  onClick={() => setPage(number)}
               >
                  {number + 1}
               </button>)
            }
            <select onChange={event => setSize(event.target.value)}>
               <option value="6">6</option>
               <option value="9" selected>9</option>
               <option value="15">15</option>
               <option value="21">21</option>
            </select>
         </div>
      </div>
   );
};

export default Shop;