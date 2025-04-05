import { useEffect, useState } from 'react';
import { testGet, testAdd, testDelete, testUpdate } from './Main.crud';
import toast from 'react-hot-toast';

export default function PageOne() {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await testGet();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      const response = await testAdd({ testName: newItem });
      setData(prev => [...prev, response.data]);
      setNewItem('');
      toast.success('Item added!');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Could not add item.');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await testDelete(itemToDelete.testId);
      setData(prev => prev.filter(item => item.testId !== itemToDelete.testId));
      setShowDeleteConfirm(false);
      toast.success('Item deleted!');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item.');
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await testUpdate(editingItem);
      setData(prev =>
        prev.map(item => (item.testId === editingItem.testId ? response.data : item))
      );
      setEditingItem(null);
      toast.success('Item updated!');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">🧾 Your List</h2>

      {/* Input + Add */}
      <div className="flex gap-2 mb-6">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Enter new item"
          className="flex-1 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {data.map(item => (
            <li
              key={item.testId}
              className="bg-white p-4 rounded shadow flex items-center justify-between"
            >
              {editingItem?.testId === item.testId ? (
                <>
                  <input
                    value={editingItem.testName}
                    onChange={e =>
                      setEditingItem({ ...editingItem, testName: e.target.value })
                    }
                    className="flex-1 px-3 py-1 border border-gray-300 rounded mr-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex-1 text-gray-800 font-medium">{item.testName}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setShowDeleteConfirm(true);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800">Are you sure you want to delete this item?</h3>
            <div className="mt-4 flex gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
