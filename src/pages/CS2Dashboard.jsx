import React,{ useEffect, useState } from "react";
import api from "../api/axios";
import { Container, Card, Button, Modal, Table, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import { formatIDR } from "../utils/formatter";
import LoadMoreButton from "../components/LoadMoreButton";

export default function CS2Dashboard() {
  const [orders, setOrders] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchShipments = async () => {
    try {
      const res = await api.get("/shipment");
      setOrders(res.data.data);
      toast.success(res.data.message ?? "Get shipment data successful")
      setNextPageUrl(res.data.next_page_url ?? null)
    } catch (err) {
      const message = err.response?.data.message;
      toast.error(message ?? "Failed to load shipment data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const appendOrders = (newItems) => {
    setOrders(prev => [...prev, ...newItems]);
  };

  const getNextStatus = (status) => {
    switch (status) {
      case "verified": return "packing";
      case "packing": return "shipped";
      case "shipped": return "delivered";
      default: return null;
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    const nextStatus = getNextStatus(selectedOrder.status);

    if (!nextStatus) {
      toast.warning("Status cannot be updated further.");
      return;
    }

    setUpdating(true);

    try {
      await api.put(`/shipment/${selectedOrder.id}/status/${nextStatus}`);
      toast.success(`Order ${selectedOrder.order_number} updated to ${nextStatus}`);

      setOrders(prev =>
        prev.map(o => o.id === selectedOrder.id ? { ...o, status: nextStatus } : o)
      );

      setModalOpen(false);
    } catch (err) {
      const message = err.response?.data.message;
      toast.error(message ?? "Failed to update status");
    }

    setUpdating(false);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">CS Shipment Dashboard</h2>

      {loading ? (
        <p>Loading shipments...</p>
      ) : orders.length === 0 ? (
        <p>No shipment data available.</p>
      ) : (
        orders.map(order => (
          <Card className="mb-3 shadow-sm" key={order.id}>
            <Card.Body>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="fw-bold">Order #{order.order_number}</h6>
                  <small className="text-muted">
                    Total: {formatIDR(Number(order.total_amount))}
                  </small>
                </div>

                <Badge pill className="py-2 px-3" bg={
                  order.status === "verified" ? "warning" :
                  order.status === "packing" ? "primary" :
                  order.status === "shipped" ? "info" : "success"
                }>
                  {order.status.toUpperCase()}
                </Badge>
              </div>

              <div className="d-flex justify-content-end">
                <Button variant="outline-primary" onClick={() => { setSelectedOrder(order); setModalOpen(true); }}>
                  Update Status
                </Button>
              </div>

            </Card.Body>
          </Card>
        ))
      )}

      <LoadMoreButton
        endpoint={nextPageUrl}
        onLoad={({ items, nextPage }) => {
          appendOrders(items);
          setNextPageUrl(nextPage);
        }}
      />

      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Shipment Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p><strong>Order Number:</strong> {selectedOrder.order_number}</p>
              <p><strong>Total Amount:</strong> {formatIDR(Number(selectedOrder.total_amount))}</p>
              <p><strong>Current Status:</strong> {selectedOrder.status}</p>

              <hr />

              <p>
                Next Status:&nbsp;
                <strong className="text-primary">
                  {getNextStatus(selectedOrder.status) || "No further updates"}
                </strong>
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={updating} onClick={() => setModalOpen(false)}>Cancel</Button>
          {getNextStatus(selectedOrder?.status) && (
            <Button variant="success" disabled={updating} onClick={handleStatusUpdate}>
              {updating ? "Updating..." : "Confirm Update"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
