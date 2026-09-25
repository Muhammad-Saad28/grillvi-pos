"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { getPOSMenuItems, getPOSCategories, POSMenuItem, POSCategory } from "@/lib/pos-data";
import { Search, Plus, Edit2, CheckCircle, XCircle, Tag } from "lucide-react";

export default function AdminMenuPage() {
  const [items, setItems] = useState<POSMenuItem[]>([]);
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Item State
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("c1");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const refreshData = async () => {
    const [fetchedItems, fetchedCats] = await Promise.all([
      getPOSMenuItems(),
      getPOSCategories(),
    ]);
    setItems(fetchedItems);
    setCategories(fetchedCats);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggleAvailability = (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));
  };

  const handleAddItem = () => {
    if (!newName || !newPrice) return;
    const priceNum = parseInt(newPrice, 10);
    const categoryObj = categories.find(c => c.id === newCategory) || categories[0];
    
    const newItem: POSMenuItem = {
      id: `m_${Date.now()}`,
      category_id: newCategory,
      category_name: categoryObj?.name || "General",
      name: newName,
      description: newDesc || null,
      price: priceNum,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
      available: true,
      featured: false,
    };

    setItems([newItem, ...items]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewPrice("");
    setNewDesc("");
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category_name === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Menu Management</h1>
          <p className="text-xs text-zinc-400">Configure menu categories, item pricing, and availability</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 font-bold text-xs flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Menu Item</span>
        </Button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div className="flex space-x-1 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === "All"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.name
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col justify-between p-0">
            {item.image && (
              <div className="h-32 w-full relative overflow-hidden bg-zinc-950">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-950/80 backdrop-blur-md text-orange-400 border border-zinc-800">
                  {item.category_name}
                </span>
              </div>
            )}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  <span className="font-extrabold text-orange-400 text-sm">Rs. {item.price}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{item.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleAvailability(item.id)}
                  className={`text-xs font-bold flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                    item.available
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {item.available ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  <span>{item.available ? "Available" : "Unavailable"}</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Menu Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Menu Item">
        <div className="space-y-4">
          <Input
            label="Item Name"
            placeholder="e.g. Chicken Karahi"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Price (Rs.)"
            type="number"
            placeholder="850"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Brief item description..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddItem} className="bg-orange-600 hover:bg-orange-500 font-bold">
              Save Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
