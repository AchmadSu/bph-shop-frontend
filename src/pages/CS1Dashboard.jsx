import React, { useEffect, useState } from "react";
import { Container, Spinner, Card, Modal, Form } from "react-bootstrap";
import { Table, Button, Icon, Label, Image } from "semantic-ui-react";
import api from "../api/axios";
import { formatIDR } from "../utils/formatter";

export default function CS1Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    api.get("/payment/waiting")
      .then(res => {
        if (res.data.success) setPayments(res.data.data || []);
        else setPayments([]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const openModal = (payment) => {
    setSelectedPayment(payment);
    setNotes(payment.payment.admin_notes || "");
    setModalOpen(true);
  };

  const handleVerify = async (approved) => {
    if (!selectedPayment) return;

    const confirmMessage = approved
      ? "Are you sure you want to APPROVE this payment?"
      : "Are you sure you want to REJECT this payment?";

    if (!window.confirm(confirmMessage)) return;

    setSubmitting(true);
    try {
      await api.put(`/payments/${selectedPayment.payment.id}/verify`, { approved, notes });
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Pending Payment Verifications</h1>

      {payments.length === 0 ? (
        <p>No payments waiting for verification.</p>
      ) : (
        payments.map(payment => (
          <Card className="mb-3 shadow-sm" key={payment.id}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 className="fw-bold">Order #{payment.order_number}</h6>
                  <small className="text-muted">Amount: {formatIDR(Number(payment.total_amount))}</small>
                </div>
                <Label color={payment.payment.status === "pending" ? "yellow" : "grey"}>
                  {payment.payment.status.replace("_", " ")}
                </Label>
              </div>

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
                  {payment.items.map((item, idx) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>{idx + 1}</Table.Cell>
                      <Table.Cell>{item.product_name}</Table.Cell>
                      <Table.Cell>{formatIDR(Number(item.price))}</Table.Cell>
                      <Table.Cell>{item.quantity}</Table.Cell>
                      <Table.Cell>{formatIDR(Number(item.price) * item.quantity)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              <div className="d-flex justify-content-end mt-3">
                <Button color="green" onClick={() => openModal(payment)}>
                  <Icon name="check" /> Verify
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}

      {/* Modal for verification */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <div className="mb-3">
                <strong>Order Number:</strong> {selectedPayment.order_number}
              </div>
              <div className="mb-3">
                <strong>Total Amount:</strong> {formatIDR(Number(selectedPayment.total_amount))}
              </div>
              {selectedPayment.payment.proof_path && (
                <div className="mb-3">
                  <strong>Payment Proof:</strong><br/>
                  <Image src={selectedPayment.payment.proof_path} style={{ maxWidth: "100%", maxHeight: 300 }} />
                </div>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="grey" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            color="green"
            loading={submitting}
            onClick={() => handleVerify(true)}
          >
            Approve
          </Button>
          <Button
            color="red"
            loading={submitting}
            onClick={() => handleVerify(false)}
          >
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
