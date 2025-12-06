import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Toast,
  Modal,
  Form
} from "react-bootstrap";

import { Button, Icon, Table, Input, Label } from "semantic-ui-react";
import { toast } from "react-toastify";

import { formatIDR } from "../utils/formatter";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import LoadMoreButton from "../components/LoadMoreButton";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [nextPageUrlProduct, setNextPageUrlProduct] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const imageUrl = "https://img.freepik.com/free-vector/colorful-new-product-composition-with-flat-design_23-2147927004.jpg?semt=ais_hybrid&w=740&q=80"
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products")
      .then((res) => {
        setProducts(res.data?.data || [])
        setNextPageUrlProduct(res.data.next_page_url ?? null);
        toast.success(res.data?.message ?? "Fetch data success")
      })
      .catch((err) => {
        console.error(err)
        const message = err.response?.data.message;
        toast.error(message ?? "Failed to fetch data!");
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const fetchCart = () => {
    setLoadingCart(true);
    api.get("/cart")
      .then(res => {
        if (res.data.success) setCart(res.data.data.items);
        else setCart([]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingCart(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const addToCart = async (product) => {
    try {
      await api.post("/cart/add", { product_id: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart!`);
      fetchCart();
    } catch (err) {
      const message = err.response?.data.message;
      toast.error(message ?? `Failed to add ${product.name}`);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.post("/cart/remove", { product_id: cartItemId });
      toast.success(`Item removed from cart`);
      fetchCart();
    } catch (err) {
      const message = err.response?.data.message;
      toast.error(message ?? `Failed to remove item`);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await api.put("/cart/update", { product_id: cartItemId, quantity });
      toast.success(`Item quantity updated`);
      fetchCart();
    } catch (err) {
      const message = err.response?.data.message;
      toast.error(message ?? `Failed to update quantity`);
    }
  };

  const checkout = async () => {
    setLoadingCheckout(true)
    try {
      await api.post("/order/checkout");
      toast.success("Checkout successful!");
      setCartModalOpen(false);
      fetchCart();
      navigate("/my-orders");
    } catch (err) {
      const message = err.response?.data.message;
      toast.error(message ?? `Failed to checkout`);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const appendProducts = (newItems) => {
    setProducts(prev => [...prev, ...newItems]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  if (loadingProducts) return <Spinner animation="border" />;

  return (
    <Container className="mt-4">
      <h1>Available Products</h1>

      {/* Product List */}
      <Row className="mt-3">
        {products.map(product => (
          <Col key={product.id} md={4} lg={3} className="mb-3">
            <Card className="h-100 d-flex flex-column">
              <Card.Img variant="top" src={imageUrl} style={{ height: 150, objectFit: "cover" }} />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{formatIDR(Number(product.price))}</Card.Subtitle>
                <Card.Text>{product.description}</Card.Text>
                {user && (
                  <Button color="blue" onClick={() => addToCart(product)}>
                    <i class="cart arrow down icon"></i> Add to Cart
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
        <Col sm={12}>
          {user && (
            <LoadMoreButton
              endpoint={nextPageUrlProduct}
              onLoad={({ items, nextPage }) => {
                appendProducts(items);
                setNextPageUrlProduct(nextPage);
              }}
            />
          )}
        </Col>
      </Row>

      {/* Floating Cart Button */}
      {user && (
        <Button
          color="orange"
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            borderRadius: "50%",
            width: 80,
            height: 80,
            fontSize: 20
          }}
          onClick={() => setCartModalOpen(true)}
        >
          <Icon name="shopping cart"></Icon>
          <Label color='red' floating>
              {totalItems}
          </Label>
        </Button>
      )}

      {/* Cart Modal */}
      <Modal show={cartModalOpen} onHide={() => setCartModalOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Your Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingCart ? <Spinner animation="border" /> :
            cart.length === 0 ? <p>Your cart is empty.</p> :
            <Table celled striped selectable>
                <Table.Header>
                    <Table.Row>
                    <Table.HeaderCell>#</Table.HeaderCell>
                    <Table.HeaderCell>Product</Table.HeaderCell>
                    <Table.HeaderCell>Price</Table.HeaderCell>
                    <Table.HeaderCell>Quantity</Table.HeaderCell>
                    <Table.HeaderCell>Total</Table.HeaderCell>
                    <Table.HeaderCell>Action</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {cart.map((item, idx) => (
                    <Table.Row key={item.id}>
                        <Table.Cell>{idx + 1}</Table.Cell>
                        <Table.Cell>{item.product.name}</Table.Cell>
                        <Table.Cell>{formatIDR(Number(item.product.price))}</Table.Cell>
                        <Table.Cell>
                        <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                            style={{ width: "80px" }}
                        />
                        </Table.Cell>
                        <Table.Cell>{formatIDR(Number(item.product.price) * item.quantity)}</Table.Cell>
                        <Table.Cell>
                        <Button color="grey" size="small" onClick={() => removeFromCart(item.product.id)}>
                            <Icon name="trash" /> Remove
                        </Button>
                        </Table.Cell>
                    </Table.Row>
                    ))}
                </Table.Body>

                <Table.Footer fullWidth>
                    <Table.Row>
                    <Table.HeaderCell colSpan="4" textAlign="right">
                        <strong>Total:</strong>
                    </Table.HeaderCell>
                    <Table.HeaderCell colSpan="2">{formatIDR(totalPrice)}</Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button color="white" onClick={() => setCartModalOpen(false)}>Close</Button>
          <Button color="orange" loading={loadingCheckout} disabled={cart.length === 0} onClick={() => checkout()}>
            Checkout
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
