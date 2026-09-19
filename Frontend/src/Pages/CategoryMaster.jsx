import React, { useEffect, useState } from "react";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";

import Input from "../Components/UI/Input";
import Textarea from "../Components/UI/Textarea";
import Button from "../Components/UI/Button";
import SweetAlert from "../Components/UI/SweetAlert";
import Table from "../Components/UI/Table";
import Modal from "../Components/UI/Model";
import { Pencil, Trash2 } from "lucide-react";

import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../API/Category";

const CategoryMaster = () => {

    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: ""
    });

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Reusable component
    const columns = [
        {
            header: "Action",
            accessor: "action",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(row)}
                        className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 transition"
                        title="Edit"
                    >
                        <Pencil size={17} />
                    </button>

                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-100 transition"
                        title="Delete"
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            )
        },
        {
            header: "ID",
            accessor: "id"
        },
        {
            header: "Category Name",
            accessor: "name"
        },
        {
            header: "Price",
            accessor: "price"
        },
        {
            header: "Description",
            accessor: "description"
        }
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();

            console.log("CATEGORY DATA:", data);

            setCategories(data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            SweetAlert.error("Please enter category name");
            return;
        }

        try {
            setLoading(true);

            await createCategory({
                name: formData.name.trim(),
                price: formData.price,
                description: formData.description.trim()
            });

            SweetAlert.success("Category added successfully");

            setFormData({
                name: "",
                price: "",
                description: ""
            });

            setShowModal(false);

            await fetchCategories();

        } catch (error) {
            console.error("Error creating category:", error);

            SweetAlert.error(
                error?.response?.data?.error ||
                "Failed to create category"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">

            <Sidebar />

            <div className="xl:ml-[17rem]">

                <Topbar />

                <main className="p-6">

                    <h1 className="text-2xl font-semibold text-[#434444] mb-6">
                        Category Master
                    </h1>

                    {/* Add Category Modal */}
                    <Modal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        title="Add Category"
                        isForm={false}
                    >

                        <form onSubmit={handleSubmit}>

                            {/* First Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                                <Input
                                    label="Category Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter category name"
                                />

                                <Input
                                    label="Price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="Enter price"
                                />

                            </div>

                            {/* Second Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">

                                <Textarea
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter description"
                                />

                                <div className="flex justify-end">

                                    <Button
                                        type="submit"
                                        variant="success"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Saving..."
                                            : "Add Category"}
                                    </Button>

                                </div>

                            </div>

                        </form>

                    </Modal>

                    {/* Category List */}
                    <div className="mt-6">

                        <Table
                            tableTitle="Categories"
                            columns={columns}
                            data={categories}
                            loading={loading}
                            showExport={false}
                            headerActions={
                                <Button
                                    type="button"
                                    variant="success"
                                    onClick={() => setShowModal(true)}
                                >
                                    Add Category
                                </Button>
                            }
                        />

                    </div>

                </main>

            </div>

        </div>
    );
};

export default CategoryMaster;




// Uncaught TypeError: Cannot read properties of undefined (reading 'startTime')
//     at et.reportAllChanges (<anonymous>:2:19429)
//     at <anonymous>:2:13070
//     at <anonymous>:2:331
//     at d (<anonymous>:2:6141)
//     at <anonymous>:2:6326
//     at <anonymous>:2:2895
//     at n.timeout (<anonymous>:2:5652)