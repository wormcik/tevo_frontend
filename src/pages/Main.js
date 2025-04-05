export default function MainPage() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl w-full text-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Welcome to TevoApp 👋</h1>
          <p className="text-gray-600 text-lg">
            This is the main dashboard. Use the navigation above to manage your items, view data, or explore other features.
          </p>
        </div>
      </div>
    );
  }
  