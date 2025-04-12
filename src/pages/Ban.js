import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllUsers, banUser } from './Main.crud';

export default function Ban() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [banNote, setBanNote] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data || []);
      } catch {
        toast.error('Kullanıcılar yüklenemedi.');
      }
    };
    fetchUsers();
  }, []);

  const handleBan = async () => {
    if (!selectedUserId) {
      toast.error('Kullanıcı seçin ve açıklama girin');
      return;
    }

    try {
      await banUser({ userId: selectedUserId, banNote });
      toast.success('Kullanıcı yasaklandı!');
      setSelectedUserId('');
      setBanNote('');
    } catch {
      toast.error('Ban işlemi başarısız');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-6 text-center">🚫 Kullanıcı Yasakla</h1>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Kullanıcı Seç:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">-- Seçiniz --</option>
            {users.map(user => (
              <option key={user.userId} value={user.userId}>
                {user.userName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Açıklama:</label>
          <textarea
            value={banNote}
            onChange={(e) => setBanNote(e.target.value)}
            rows="3"
            className="w-full border px-4 py-2 rounded"
            placeholder="Neden banlıyorsunuz?"
          />
        </div>

        <button
          onClick={handleBan}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Yasakla
        </button>
      </div>
    </div>
  );
}
