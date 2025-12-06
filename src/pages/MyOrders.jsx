import React, { useEffect, useState } from "react";
import { Container, Spinner, Card, Row, Col, Collapse, Badge, Modal as RBModal, Form as RBForm } from "react-bootstrap";
import { Table, Label, Icon, Button } from "semantic-ui-react";
import api from "../api/axios";
import { formatIDR, formatDate } from "../utils/formatter";
import "react-step-progress-bar/styles.css";
import { toast } from "react-toastify";
import LoadMoreButton from "../components/LoadMoreButton";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [nextPageUrlOrders, setNextPageUrlOrders] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingShipment, setLoadingShipment] = useState(false);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const statusStyle = {
    packing: { color: "warning", icon: "📦", label: "Packing" },
    shipped: { color: "primary", icon: "🚚", label: "Shipped" },
    delivered: { color: "success", icon: "✔️", label: "Delivered" },
  };

  const fetchOrders = () => {
    setLoading(true);
    api.get("/orders")
      .then(res => {
        if (res.data.success) setOrders(res.data.data || []);
        else setOrders([]);
        setNextPageUrlOrders(res.data.next_page_url ?? null);
        toast.success(res.data.message ?? "Fetch orders successful")
      })
      .catch((err) => {
        console.error(err)
        const message = err.response?.data.message;
        toast.error(message ?? "Failed to fetch orders data");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const appendOrders = (newItems) => {
    setOrders(prev => [...prev, ...newItems]);
  };

  const toggleOrder = (id) => {
    setOpenOrderId(openOrderId === id ? null : id);
  };

  const openPaymentModal = (orderId) => {
    setSelectedOrderId(orderId);
    setPaymentModalOpen(true);
  };
  
  const toggleShipment = (orderId) => {
    fetchShipments(orderId);
    setShipmentModalOpen(true);
  };

  const fetchShipments = (orderId) => {
    setLoadingShipment(true);
    api.get(`/shipment/${orderId}/logs`)
      .then(res => {
        console.log(res.data.data)
        if (res.data.success) setShipments(res.data.data || []);
        else setShipments([]);
      })
      .catch(err => {
        console.error(err)
        const message = err.response?.data.message;
        toast.error(message ?? "Failed to fetch shipment data");
      })
      .finally(() => setLoadingShipment(false));
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoadingUpload(true);

    const formData = new FormData();
    formData.append("proof", file);

    try {
      const res = await api.post(`/orders/${selectedOrderId}/payments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPaymentModalOpen(false);
      setFile(null);
      toast.success(res.data.message ?? "Upload proof data success")
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoadingUpload(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container className="mt-4">
      <h1 className="mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <Row className="g-4">
          {orders.map(order => {
            const statusColor =
              order.status === "completed" ? "success" :
              order.status === "pending_payment" ? "warning" :
              order.status === "shipping" ? "info" :
              order.status === "verified" ? "primary" :
              order.status === "cancelled" ? "danger" : "secondary";

            const isExpired = new Date(order.expired_at) < new Date() && order.status === "pending_payment";

            return (
              <Col key={order.id} md={6} lg={4}>
                <Card className={`shadow-sm border-0 ${isExpired ? "border-danger" : ""}`} style={{ transition: "transform 0.2s" }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold">{order.order_number}</h6>
                        <small className="text-muted">{formatDate(order.created_at)}</small>
                      </div>
                      <Badge bg={statusColor} pill className="py-2 px-3">
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <strong>Total Amount:</strong>{" "}
                      <span className="fs-5">{formatIDR(Number(order.total_amount))}</span>
                    </div>

                    <div className="d-flex gap-2 mb-2">
                      <Button
                        size="small"
                        color={openOrderId === order.id ? "grey" : "blue"}
                        onClick={() => toggleOrder(order.id)}
                      >
                        {openOrderId === order.id ? <Icon name="angle down" /> : <Icon name="angle right" />} View Details
                      </Button>

                      {order.status === "packing" || order.status === "shipping" || order.status === "completed" && (
                        <Button
                          size="small"
                          color="orange"
                          onClick={() => toggleShipment(order.id)}
                        >

                          <Icon name="truck" /> Tracking Shipment
                        </Button>
                      )}

                      {order.status === "pending_payment" && !isExpired && (
                        <Button
                          size="small"
                          color="green"
                          onClick={() => openPaymentModal(order.id)}
                        >
                          <Icon name="upload" /> Upload Payment
                        </Button>
                      )}
                    </div>

                    <Collapse in={openOrderId === order.id}>
                      <div className="mt-3 table-responsive">
                        <Table celled striped compact basic>
                          <Table.Header>
                            <Table.Row>
                              <Table.HeaderCell>#</Table.HeaderCell>
                              <Table.HeaderCell>Product</Table.HeaderCell>
                              <Table.HeaderCell>Price</Table.HeaderCell>
                              <Table.HeaderCell>Qty</Table.HeaderCell>
                              <Table.HeaderCell>Total</Table.HeaderCell>
                            </Table.Row>
                          </Table.Header>

                          <Table.Body>
                            {order.items.map((item, idx) => (
                              <Table.Row key={item.id}>
                                <Table.Cell>{idx + 1}</Table.Cell>
                                <Table.Cell>
                                  <div className="d-flex align-items-center">
                                    {item.product_name}
                                  </div>
                                </Table.Cell>
                                <Table.Cell>{formatIDR(Number(item.price))}</Table.Cell>
                                <Table.Cell>{item.quantity}</Table.Cell>
                                <Table.Cell>{formatIDR(Number(item.price) * item.quantity)}</Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>

                        {order.payment && (
                          <div className="mt-2 mb-5">
                            <strong>Payment Status: </strong>
                            <Label color={
                              order.payment.status === "verified" ? "green" :
                              order.payment.status === "pending" ? "yellow" :
                              "grey"
                            }>{order.payment.status.replace("_", " ")}</Label>
                          </div>
                        )}

                        {isExpired && (
                          <div className="mt-2 text-danger fw-bold">
                            This order has expired.
                          </div>
                        )}
                      </div>
                    </Collapse>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <LoadMoreButton
        endpoint={nextPageUrlOrders}
        onLoad={({ items, nextPage }) => {
          appendOrders(items);
          setNextPageUrlOrders(nextPage);
        }}
      />

      <RBModal show={paymentModalOpen} onHide={() => setPaymentModalOpen(false)} centered>
        <RBModal.Header closeButton>
          <RBModal.Title>Upload Payment Proof</RBModal.Title>
        </RBModal.Header>
        <RBModal.Body>
          <RBForm>
            <RBForm.Group controlId="formFile">
              <RBForm.Label>Select Image</RBForm.Label>
              <RBForm.Control type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            </RBForm.Group>
          </RBForm>
        </RBModal.Body>
        <RBModal.Footer>
          <Button color="grey" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
          <Button color="green" onClick={handleUpload} loading={loadingUpload} disabled={!file || loadingUpload}>
            Upload
          </Button>
        </RBModal.Footer>
      </RBModal>

      <RBModal show={shipmentModalOpen} onHide={() => setShipmentModalOpen(false)} centered size="lg">
        <RBModal.Header closeButton>
          <RBModal.Title>📦 Shipment Progress</RBModal.Title>
        </RBModal.Header>

        <RBModal.Body>
          {loadingShipment ? <div className="text-center"><Spinner animation="border" /></div> : (
            <>
              <h5 className="fw-bold mb-3">Shipment Progress</h5>

              <div className="shipment-progress-container">
                <div className="progress-line"></div>

                <div className="steps-wrapper">
                  {shipments.map((step, index) => {
                    const style = statusStyle[step.status] || {};
                    const isCompleted = index <= shipments.length - 1;

                    return (
                      <div key={step.id} className="step-item">
                        <div className={`step-icon ${isCompleted ? "active" : ""}`} style={{ backgroundColor: style.color }}>
                          {style.icon}
                        </div>
                        <div className="step-label">{style.label || step.status}</div>
                        <div className="step-date">{formatDate(step.created_at)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </RBModal.Body>


        <RBModal.Footer>
          <Button color="grey" onClick={() => setShipmentModalOpen(false)}>Close</Button>
        </RBModal.Footer>
      </RBModal>
    </Container>
  );
}
