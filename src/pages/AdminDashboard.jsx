import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Table, Button, Form, Loader, Checkbox } from "semantic-ui-react";
import { Modal as RBModal, Spinner } from "react-bootstrap";
import LoadMoreButton from "../components/LoadMoreButton";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [excelFile, setExcelFile] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    is_active: true,
  });

  useEffect(() => {
    if(!showAdd) {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        is_active: true,
      })
    }
  }, [showAdd]);

  const [editId, setEditId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/all");
      setProducts(res.data.data);
      setNextPageUrl(res.data.next_page_url ?? null);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const appendProducts = (newItems) => {
    setProducts(prev => [...prev, ...newItems]);
  };

  const handleChange = (e, { name, value }) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddProduct = async () => {
    if (!formData.name || formData.name.length < 2)
      return toast.warning("Name minimal 2 characters");

    try {
      await api.post("/products", formData);
      toast.success("Product added!");
      setShowAdd(false);
      setFormData({ name: "", description: "", price: "", stock: "", is_active: true });
      fetchProducts();
    } catch {
      toast.error("Error adding product");
    }
  };

  const openEditModal = (p) => {
    setEditId(p.id);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      is_active: p.is_active,
    });
    setShowEdit(true);
  };

  const handleUpdateProduct = async () => {
    try {
      await api.put(`/products/${editId}`, formData);
      toast.success("Updated successfully");
      setShowEdit(false);
      fetchProducts();
    } catch {
      toast.error("Update failed");
    }
  };

  const toggleStatus = async (id, status) => {
    setToggleLoading(id);
    try {
      await api.put(`/products/${id}`, { is_active: !status });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: !status } : item
        )
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed toggling status");
    } finally {
      setToggleLoading(null);
    }
  };

  const uploadExcel = async () => {
    if (!excelFile) return toast.warning("Please select an Excel file!");

    const data = new FormData();
    data.append("file", excelFile);

    try {
      await api.post("/products/import", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Import success!");
      fetchProducts();
      setExcelFile(null);
    } catch {
      toast.error("Import failed");
    }
  };

  return (
    <div className="ui container" style={{ marginTop: "35px" }}>
      <h2 className="ui header">Admin Dashboard</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setExcelFile(e.target.files[0])}
          />

          <Button color="grey" className="ms-2" onClick={uploadExcel}>
            Import Excel
          </Button>
        </div>

        <Button color="green" onClick={() => setShowAdd(true)}>
          + Add Product
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Loader active inline="centered" size="large" />
        </div>
      ) : (
        <Table celled striped selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>#</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Stock</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {products.map((p, i) => (
              <Table.Row key={p.id}>
                <Table.Cell>{i + 1}</Table.Cell>
                <Table.Cell>{p.name}</Table.Cell>
                <Table.Cell>{Number(p.price).toLocaleString()}</Table.Cell>
                <Table.Cell>{p.stock}</Table.Cell>

                <Table.Cell>
                  <Button
                    size="tiny"
                    color={p.is_active ? "green" : "red"}
                    onClick={() => toggleStatus(p.id, p.is_active)}
                    disabled={toggleLoading === p.id}
                  >
                    {toggleLoading === p.id ? (
                      <Spinner animation="border" size="sm" />
                    ) : p.is_active ? (
                      "Active"
                    ) : (
                      "Inactive"
                    )}
                  </Button>
                </Table.Cell>

                <Table.Cell>
                  <Button color="blue" size="tiny" onClick={() => openEditModal(p)}>
                    Edit
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      <LoadMoreButton
        endpoint={nextPageUrl}
        onLoad={({ items, nextPage }) => {
          appendProducts(items);
          setNextPageUrl(nextPage);
        }}
      />


      <RBModal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <RBModal.Header closeButton>
          <RBModal.Title>Add Product</RBModal.Title>
        </RBModal.Header>

        <RBModal.Body>
          <Form>
            <Form.Input label="Name" name="name" value={formData.name} onChange={handleChange} />
            <Form.TextArea label="Description" name="description" value={formData.description} onChange={handleChange} />
            <Form.Input type="number" label="Price" name="price" value={formData.price} onChange={handleChange} />
            <Form.Input type="number" label="Stock" name="stock" value={formData.stock} onChange={handleChange} />
          </Form>
        </RBModal.Body>

        <RBModal.Footer>
          <Button color="grey" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button color="green" onClick={handleAddProduct}>Add</Button>
        </RBModal.Footer>
      </RBModal>

      <RBModal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <RBModal.Header closeButton>
          <RBModal.Title>Edit Product</RBModal.Title>
        </RBModal.Header>

        <RBModal.Body>
          <Form>
            <Form.Input label="Name" name="name" value={formData.name} onChange={handleChange} />
            <Form.TextArea label="Description" name="description" value={formData.description} onChange={handleChange} />
            <Form.Input label="Price" name="price" type="number" value={formData.price} onChange={handleChange} />
            <Form.Input label="Stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
          </Form>
        </RBModal.Body>

        <RBModal.Footer>
          <Button onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button color="blue" onClick={handleUpdateProduct}>Save</Button>
        </RBModal.Footer>
      </RBModal>
    </div>
  );
}
