export function ProfileModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const roleLabel =
    user?.role === "admin" || user?.role === "ADMIN"
      ? "Quản trị viên"
      : user?.role === "staff" || user?.role === "STAFF"
        ? "Nhân viên"
        : "Khách hàng";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full border-4 border-white/60 bg-white/20 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {user?.name || user?.fullName || "Người dùng"}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 bg-white/25 text-white text-xs font-semibold px-3 py-1 rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Info Body */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Thông tin cá nhân
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* ID */}
            <InfoRow
              iconColor="bg-gray-200"
              iconTextColor="text-gray-600"
              label="ID tài khoản"
              value={user?.id}
              truncate
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </InfoRow>

            {/* Name */}
            <InfoRow
              iconColor="bg-blue-100"
              iconTextColor="text-blue-600"
              label="Họ và tên"
              value={user?.name || user?.fullName || "—"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </InfoRow>

            {/* Email */}
            <InfoRow
              iconColor="bg-orange-100"
              iconTextColor="text-orange-600"
              label="Email"
              value={user?.email}
              truncate
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </InfoRow>

            {/* Phone */}
            {user?.phone && (
              <InfoRow
                iconColor="bg-green-100"
                iconTextColor="text-green-600"
                label="Số điện thoại"
                value={user.phone}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </InfoRow>
            )}

            {/* Address */}
            {user?.address && (
              <InfoRow
                iconColor="bg-purple-100"
                iconTextColor="text-purple-600"
                label="Địa chỉ"
                value={user.address}
                truncate
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </InfoRow>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center pt-2">
            Để chỉnh sửa thông tin, vui lòng vào{" "}
            <span className="text-red-500 font-medium">Cài đặt</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  iconColor,
  iconTextColor,
  label,
  value,
  truncate,
  children,
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className={`${iconColor} p-2 rounded-lg`}>
        <svg
          className={`w-4 h-4 ${iconTextColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {children}
        </svg>
      </div>
      <div className={truncate ? "min-w-0" : undefined}>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p
          className={`text-sm font-semibold text-gray-700 ${truncate ? "truncate" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
