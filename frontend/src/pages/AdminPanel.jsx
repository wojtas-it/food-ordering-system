import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, productsAPI } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    preparationTime: 10,
  });

  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin()) {
      navigate('/kitchen');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const response = await adminAPI.getPendingUsers();
        setPendingUsers(response.data);
      } else if (activeTab === 'users') {
        const response = await adminAPI.getAllUsers();
        setAllUsers(response.data);
      } else if (activeTab === 'products') {
        const response = await productsAPI.getAll();
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Błąd ładowania danych:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      loadData();
    } catch (error) {
      console.error('Błąd zatwierdzania użytkownika:', error);
      alert('Błąd zatwierdzania użytkownika');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await adminAPI.rejectUser(userId);
      loadData();
    } catch (error) {
      console.error('Błąd odrzucania użytkownika:', error);
      alert('Błąd odrzucania użytkownika');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;

    try {
      await adminAPI.deleteUser(userId);
      loadData();
    } catch (error) {
      console.error('Błąd usuwania użytkownika:', error);
      alert('Błąd usuwania użytkownika');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminAPI.changeUserRole(userId, newRole);
      loadData();
    } catch (error) {
      console.error('Błąd zmiany roli:', error);
      alert('Błąd zmiany roli');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        preparationTime: parseInt(productForm.preparationTime),
      };

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, productData);
      } else {
        await adminAPI.createProduct(productData);
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        preparationTime: 10,
      });
      loadData();
    } catch (error) {
      console.error('Błąd zapisu produktu:', error);
      alert('Błąd zapisu produktu');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      preparationTime: product.preparationTime,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return;

    try {
      await adminAPI.deleteProduct(productId);
      loadData();
    } catch (error) {
      console.error('Błąd usuwania produktu:', error);
      alert('Błąd usuwania produktu');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">Panel Administratora</h1>
          <div className="admin-user-info">
            <span className="admin-username">Witaj, {user.username}!</span>
            <button onClick={handleLogout} className="btn-logout">
              Wyloguj
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <div className="admin-tabs">
            <button
              onClick={() => setActiveTab('pending')}
              className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
            >
              Oczekujące konta ({pendingUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            >
              Wszyscy użytkownicy
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            >
              Produkty
            </button>
          </div>

          <div className="admin-tab-content">
            {loading ? (
              <div className="loading-state">Ładowanie...</div>
            ) : (
              <>
                {activeTab === 'pending' && (
                  <div>
                    {pendingUsers.length === 0 ? (
                      <div className="empty-state">Brak oczekujących kont</div>
                    ) : (
                      <div className="user-list">
                        {pendingUsers.map((user) => (
                          <div key={user._id} className="user-card">
                            <div className="user-info">
                              <h3>{user.username}</h3>
                              <p>
                                Zarejestrowany:{' '}
                                {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                              </p>
                            </div>
                            <div className="user-actions">
                              <button
                                onClick={() => handleApproveUser(user._id)}
                                className="btn-approve"
                              >
                                Zatwierdź
                              </button>
                              <button
                                onClick={() => handleRejectUser(user._id)}
                                className="btn-reject"
                              >
                                Odrzuć
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'users' && (
                  <div>
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Nazwa użytkownika</th>
                          <th>Rola</th>
                          <th>Status</th>
                          <th>Data rejestracji</th>
                          <th>Akcje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user) => (
                          <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>
                              <select
                                value={user.role}
                                onChange={(e) => handleChangeRole(user._id, e.target.value)}
                                className="role-select"
                                disabled={user.username === 'admin'}
                              >
                                <option value="kucharz">Kucharz</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td>
                              <span className={`status-badge ${user.status}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString('pl-PL')}</td>
                            <td>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={user.username === 'admin'}
                                className="btn-delete"
                                style={{
                                  opacity: user.username === 'admin' ? 0.5 : 1,
                                  cursor: user.username === 'admin' ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Usuń
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '',
                          description: '',
                          price: '',
                          category: '',
                          imageUrl: '',
                          preparationTime: 10,
                        });
                        setShowProductForm(true);
                      }}
                      className="btn-add-product"
                    >
                      + Dodaj produkt
                    </button>

                    {showProductForm && (
                      <div className="product-form-container">
                        <h3 className="product-form-title">
                          {editingProduct ? 'Edytuj produkt' : 'Nowy produkt'}
                        </h3>
                        <form onSubmit={handleProductSubmit} className="product-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Nazwa</label>
                              <input
                                type="text"
                                value={productForm.name}
                                onChange={(e) =>
                                  setProductForm({ ...productForm, name: e.target.value })
                                }
                                className="input"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Kategoria</label>
                              <input
                                type="text"
                                value={productForm.category}
                                onChange={(e) =>
                                  setProductForm({ ...productForm, category: e.target.value })
                                }
                                className="input"
                                required
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Cena (PLN)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={productForm.price}
                                onChange={(e) =>
                                  setProductForm({ ...productForm, price: e.target.value })
                                }
                                className="input"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Czas przygotowania (min)</label>
                              <input
                                type="number"
                                value={productForm.preparationTime}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    preparationTime: e.target.value,
                                  })
                                }
                                className="input"
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Opis</label>
                            <textarea
                              value={productForm.description}
                              onChange={(e) =>
                                setProductForm({ ...productForm, description: e.target.value })
                              }
                              className="textarea"
                              rows="3"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">URL obrazka</label>
                            <input
                              type="text"
                              value={productForm.imageUrl}
                              onChange={(e) =>
                                setProductForm({ ...productForm, imageUrl: e.target.value })
                              }
                              className="input"
                              placeholder="/food_images/nazwa.jpg"
                              required
                            />
                          </div>

                          <div className="product-form-actions">
                            <button type="submit" className="btn-save">
                              {editingProduct ? 'Zapisz zmiany' : 'Dodaj produkt'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowProductForm(false);
                                setEditingProduct(null);
                              }}
                              className="btn-cancel"
                            >
                              Anuluj
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="products-grid">
                      {products.map((product) => (
                        <div key={product._id} className="product-card">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="product-image"
                          />
                          <div className="product-details">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>
                            <p className="product-price">{product.price} PLN</p>
                            <p className="product-meta">
                              Kategoria: {product.category} | Czas: {product.preparationTime} min
                            </p>
                            <div className="product-actions">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="btn-edit"
                              >
                                Edytuj
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="btn-delete"
                              >
                                Usuń
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
