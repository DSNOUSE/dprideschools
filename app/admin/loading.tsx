export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-blue-600 border-r-transparent mb-3"></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
