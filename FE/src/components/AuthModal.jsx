import { X, Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const MODE = { LOGIN: "login", REGISTER: "register", FORGOT: "forgot", RESET: "reset" };

export function AuthModal({ isOpen, onClose, onLogin }) {
  const [mode, setMode] = useState(MODE.LOGIN);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "buyer",
    resetToken: "",
    newPassword: "",
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockEndTime, setLockEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Check if account is locked on mount
  useEffect(() => {
    const lockData = localStorage.getItem("loginLock");
    if (lockData) {
      const { endTime, attempts } = JSON.parse(lockData);
      const now = Date.now();
      if (now < endTime) {
        setIsLocked(true);
        setLockEndTime(endTime);
        setLoginAttempts(attempts);
      } else {
        // Lock expired, clear it
        localStorage.removeItem("loginLock");
      }
    }
  }, [isOpen]);

  // Update remaining time
  useEffect(() => {
    if (isLocked && lockEndTime) {
      const timer = setInterval(() => {
        const remaining = Math.ceil((lockEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setIsLocked(false);
          setLockEndTime(null);
          setLoginAttempts(0);
          setErrorMessage("");
          localStorage.removeItem("loginLock");
          clearInterval(timer);
        } else {
          setRemainingTime(remaining);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockEndTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if account is locked
    if (isLocked) {
      setErrorMessage(
        `Tài khoản đã bị khóa. Vui lòng thử lại sau ${remainingTime} giây.`,
      );
      return;
    }

    // Forgot: request reset token
    if (mode === MODE.FORGOT) {
      if (!formData.email.trim()) {
        setErrorMessage("Vui lòng nhập email.");
        return;
      }
      try {
        setErrorMessage("");
        const res = await authAPI.forgotPassword(formData.email);
        setForgotSuccess(true);
        setFormData((prev) => ({ ...prev, resetToken: res.resetToken || "" }));
      } catch (err) {
        setErrorMessage(err.message || "Không tìm thấy tài khoản với email này.");
      }
      return;
    }

    // Reset: submit new password with token
    if (mode === MODE.RESET) {
      if (!formData.resetToken.trim() || !formData.newPassword || formData.newPassword.length < 6) {
        setErrorMessage("Vui lòng dán mã đặt lại và nhập mật khẩu mới (ít nhất 6 ký tự).");
        return;
      }
      try {
        setErrorMessage("");
        await authAPI.resetPassword(formData.resetToken, formData.newPassword);
        setForgotSuccess(false);
        setMode(MODE.LOGIN);
        setFormData((prev) => ({ ...prev, resetToken: "", newPassword: "" }));
        setErrorMessage("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.");
      } catch (err) {
        setErrorMessage(err.message || "Mã đặt lại không hợp lệ hoặc đã hết hạn.");
      }
      return;
    }

    if (mode === MODE.REGISTER && formData.password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    const buildUserInfo = (response) => {
      const u = response.user || response;
      const name = u.name || u.fullName || u.email;
      return {
        id: u.id || u._id,
        name,
        email: u.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ef4444&color=fff`,
        role: (u.role || "buyer").toLowerCase(),
        token: response.token,
      };
    };

    try {
      setErrorMessage("");
      if (mode === MODE.LOGIN) {
        const response = await authAPI.login(formData.email, formData.password);
        const userInfo = buildUserInfo(response);
        if (response.token) userInfo.token = response.token;
        localStorage.setItem("user", JSON.stringify(userInfo));
        setLoginAttempts(0);
        localStorage.removeItem("loginLock");
        onLogin(userInfo);
        onClose();
        setFormData({ email: "", password: "", name: "", role: "buyer", resetToken: "", newPassword: "" });
      } else {
        const response = await authAPI.register(
          formData.email,
          formData.password,
          formData.name,
          formData.role,
        );
        const userInfo = buildUserInfo(response);
        if (response.token) userInfo.token = response.token;
        localStorage.setItem("user", JSON.stringify(userInfo));
        setLoginAttempts(0);
        localStorage.removeItem("loginLock");
        onLogin(userInfo);
        onClose();
        setFormData({ email: "", password: "", name: "", role: "buyer", resetToken: "", newPassword: "" });
      }
    } catch (error) {
      if (mode === MODE.LOGIN) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          // Lock account for 5 minutes after 5 failed attempts
          const lockDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
          const endTime = Date.now() + lockDuration;
          setIsLocked(true);
          setLockEndTime(endTime);
          setErrorMessage(
            "Quá nhiều lần đăng nhập sai. Tài khoản đã bị khóa trong 5 phút.",
          );

          // Save lock info to localStorage
          localStorage.setItem(
            "loginLock",
            JSON.stringify({
              endTime: endTime,
              attempts: newAttempts,
            }),
          );
        } else {
          setErrorMessage(
            error.message ||
              `Email hoặc mật khẩu không đúng. Còn ${5 - newAttempts} lần thử.`,
          );
        }
      } else {
        // Registration error - show detailed message
        let errorMsg = error.message || "Đăng ký thất bại. Vui lòng thử lại.";

        // Add helpful hints for common errors
        if (errorMsg.includes("Email") && errorMsg.includes("đã")) {
          errorMsg += "\n\nGợi ý: Thử đăng nhập nếu bạn đã có tài khoản.";
        } else if (errorMsg.includes("Lỗi hệ thống")) {
          errorMsg +=
            "\n\nNếu lỗi vẫn tiếp diễn, có thể email đã được đăng ký trước đó.";
        }

        setErrorMessage(errorMsg);
      }
    }
  };

  const handleSocialLogin = (provider) => {
    if (isLocked) {
      setErrorMessage(
        `Tài khoản đã bị khóa. Vui lòng thử lại sau ${remainingTime} giây.`,
      );
      return;
    }

    // Mock social login
    const userInfo = {
      name: `User from ${provider}`,
      email: `user@${provider}.com`,
      avatar: `https://ui-avatars.com/api/?name=${provider}&background=ef4444&color=fff`,
      role: "customer",
    };
    localStorage.setItem("user", JSON.stringify(userInfo));

    // Reset login attempts on successful social login
    setLoginAttempts(0);
    setErrorMessage("");
    localStorage.removeItem("loginLock");

    onLogin(userInfo);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl transform transition-all duration-300 scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === MODE.LOGIN && "Đăng nhập"}
              {mode === MODE.REGISTER && "Đăng ký"}
              {mode === MODE.FORGOT && "Quên mật khẩu"}
              {mode === MODE.RESET && "Đặt lại mật khẩu"}
            </h2>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  {errorMessage}
                </p>
                {isLocked && (
                  <p className="text-xs text-red-600 mt-1">
                    Thời gian còn lại: {Math.floor(remainingTime / 60)}:
                    {String(remainingTime % 60).padStart(2, "0")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Lock Warning */}
          {!isLocked && loginAttempts > 0 && loginAttempts < 5 && (
            <div className="mb-5 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Cảnh báo: Còn {5 - loginAttempts} lần thử trước khi tài khoản bị
                khóa 5 phút.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Forgot: only email */}
            {mode === MODE.FORGOT && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Nhập email để nhận mã đặt lại mật khẩu (mã hiển thị ngay sau khi gửi).</p>
              </div>
            )}
            {mode === MODE.FORGOT && forgotSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                Mã đặt lại đã được tạo. Sao chép mã bên dưới rồi bấm &quot;Đặt lại mật khẩu&quot; để nhập mã và mật khẩu mới.
                {formData.resetToken && (
                  <p className="mt-2 font-mono text-xs break-all bg-white p-2 rounded">{formData.resetToken}</p>
                )}
                <button type="button" onClick={() => { setMode(MODE.RESET); setErrorMessage(""); }} className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                  Đặt lại mật khẩu
                </button>
              </div>
            )}
            {/* Reset: token + new password */}
            {mode === MODE.RESET && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mã đặt lại</label>
                  <input
                    type="text"
                    value={formData.resetToken}
                    onChange={(e) => setFormData({ ...formData, resetToken: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                    placeholder="Dán mã nhận được sau bước quên mật khẩu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500"
                      placeholder="Ít nhất 6 ký tự"
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}
            {mode === MODE.REGISTER && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="••••••••"
                  minLength={mode === MODE.REGISTER ? 6 : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {mode === MODE.REGISTER &&
                formData.password &&
                formData.password.length < 6 && (
                  <p className="text-xs text-red-600 mt-1">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                )}
            </div>

            {mode === MODE.LOGIN && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => { setMode(MODE.FORGOT); setErrorMessage(""); }}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked}
              className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 transform shadow-lg ${
                isLocked
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98]"
              } text-white`}
            >
              {isLocked
                ? `Bị khóa (${Math.floor(remainingTime / 60)}:${String(remainingTime % 60).padStart(2, "0")})`
                : (mode === MODE.LOGIN && "Đăng nhập") || (mode === MODE.REGISTER && "Đăng ký") || (mode === MODE.FORGOT && "Gửi mã đặt lại") || (mode === MODE.RESET && "Đặt lại mật khẩu")}
            </button>
          </form>

          {/* Toggle */}
          {(mode === MODE.LOGIN || mode === MODE.REGISTER) && (
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                {mode === MODE.LOGIN ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              </span>
              <button type="button" onClick={() => { setMode(mode === MODE.LOGIN ? MODE.REGISTER : MODE.LOGIN); setErrorMessage(""); }} className="text-sm text-red-600 hover:text-red-700 font-bold">
                {mode === MODE.LOGIN ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </div>
          )}
          {(mode === MODE.FORGOT || mode === MODE.RESET) && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => { setMode(MODE.LOGIN); setErrorMessage(""); setForgotSuccess(false); }} className="text-sm text-red-600 hover:text-red-700 font-bold">
                ← Quay lại đăng nhập
              </button>
            </div>
          )}

          {(mode === MODE.LOGIN || mode === MODE.REGISTER) && (
          <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              disabled={isLocked}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 border-2 rounded-xl font-semibold transition-colors ${
                isLocked
                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập với Google
            </button>
          </div>
          </>
          )}
        </div>
      </div>
    </>
  );
}
