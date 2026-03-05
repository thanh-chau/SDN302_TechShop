import { User, Mail, Shield, Hash } from "lucide-react";

export function ProfilePage({ user }) {
  // API UserDTO structure: { id, email, fullName, role }
  // No update endpoint available in Swagger API

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bạn chưa đăng nhập
        </h2>
        <p className="text-gray-600">
          Vui lòng đăng nhập để xem thông tin tài khoản
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Thông tin tài khoản
      </h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {user.fullName || user.name}
              </h2>
              <p className="opacity-90">{user.email}</p>
              {user.role && (
                <div className="mt-2 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {user.role === "admin" || user.role === "ADMIN"
                      ? "Quản trị viên"
                      : user.role === "staff" || user.role === "STAFF"
                        ? "Nhân viên"
                        : "Khách hàng"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                  <Hash className="w-4 h-4" />
                  ID Người dùng
                </label>
                <p className="text-lg text-gray-900">{user.id}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                  <User className="w-4 h-4" />
                  Họ và tên
                </label>
                <p className="text-lg text-gray-900">
                  {user.fullName || user.name}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                  <Shield className="w-4 h-4" />
                  Vai trò
                </label>
                <p className="text-lg text-gray-900">
                  {user.role === "admin" || user.role === "ADMIN"
                    ? "Quản trị viên (ADMIN)"
                    : user.role === "staff" || user.role === "STAFF"
                      ? "Nhân viên (STAFF)"
                      : "Khách hàng (USER)"}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Lưu ý:</strong> Thông tin tài khoản được quản lý bởi hệ
                thống. Vui lòng liên hệ quản trị viên để thay đổi thông tin cá
                nhân.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
