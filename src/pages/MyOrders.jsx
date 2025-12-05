import React, { useEffect, useState } from "react";
import { Container, Spinner, Card, Row, Col, Collapse, Badge, Modal as RBModal, Form as RBForm } from "react-bootstrap";
import { Table, Label, Icon, Image, Button } from "semantic-ui-react";
import api from "../api/axios";
import { formatIDR } from "../utils/formatter";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openOrderId, setOpenOrderId] = useState(null);

  // Modal Upload Payment
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    api.get("/orders")
      .then(res => {
        if (res.data.success) setOrders(res.data.data || []);
        else setOrders([]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const toggleOrder = (id) => {
    setOpenOrderId(openOrderId === id ? null : id);
  };

  const openPaymentModal = (orderId) => {
    setSelectedOrderId(orderId);
    setPaymentModalOpen(true);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoadingUpload(true);

    const formData = new FormData();
    formData.append("proof", file);

    try {
      await api.post(`/orders/${selectedOrderId}/payments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPaymentModalOpen(false);
      setFile(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
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
              order.status === "cancelled" ? "danger" : "secondary";

            const isExpired = new Date(order.expired_at) < new Date() && order.status === "pending_payment";

            return (
              <Col key={order.id} md={6} lg={4}>
                <Card className={`shadow-sm border-0 ${isExpired ? "border-danger" : ""}`} style={{ transition: "transform 0.2s" }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold">{order.order_number}</h6>
                        <small className="text-muted">{new Date(order.created_at).toLocaleString()}</small>
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

      {/* Bootstrap Modal for Upload Payment */}
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
    </Container>
  );
}
