import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './MenuPage.css';

const CATEGORIES = [
  { id: 'all', name: 'Wszystko' },
  { id: 'burgery', name: 'Burgery' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'napoje', name: 'Napoje' },
  { id: 'desery', name: 'Desery' },
  { id: 'inne', name: 'Inne' },
];

const MenuPage = () => {
  const navigate = useNavigate();
  const { addToCart, getTotalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Nie udało się załadować produktów');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.category === selectedCategory)
      );
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    // Można dodać toast notification
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="loading">Ładowanie menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="error">{error}</div>
        <button onClick={loadProducts} className="btn-primary">
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <header className="menu-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Powrót
        </button>
        <h1>Menu</h1>
        <button className="btn-cart" onClick={() => navigate('/cart')}>
          🛒 Koszyk ({getTotalItems()})
        </button>
      </header>

      <div className="categories">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${
              selectedCategory === category.id ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            Brak produktów w tej kategorii
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price.toFixed(2)} zł</span>
                  <button
                    className="btn-add"
                    onClick={() => handleAddToCart(product)}
                  >
                    Dodaj +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuPage;
