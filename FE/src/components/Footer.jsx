import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Laptop,
  Smartphone,
  Tablet,
  Speaker,
  Cable,
  Monitor,
} from "lucide-react";

export function Footer() {
  const categories = [
    { name: "Laptop", icon: Laptop },
    { name: "Điện thoại", icon: Smartphone },
    { name: "Tablet", icon: Tablet },
    { name: "Âm thanh", icon: Speaker },
    { name: "Phụ kiện", icon: Cable },
    { name: "Màn hình", icon: Monitor },
  ];

  const supportLinks = [
    "Chính sách bảo hành",
    "Chính sách đổi trả",
    "Hướng dẫn mua hàng",
    "Phương thức thanh toán",
    "Câu hỏi thường gặp",
    "Kiểm tra bảo hành",
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold">TechShop</h3>
            <p className="text-sm leading-relaxed">
              Hệ thống bán lẻ điện tử hàng đầu Việt Nam. Chuyên cung cấp laptop,
              điện thoại, phụ kiện công nghệ chính hãng với giá tốt nhất.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-red-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Danh mục</h4>
            <ul className="space-y-3">
              {categories.map(({ name, icon: Icon }) => (
                <li key={name}>
                  <a
                    href="#"
                    className="flex items-center gap-2 hover:text-red-500 transition-colors text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="hover:text-red-500 transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span>Hotline: 1900-xxxx</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span>support@techshop.vn</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <div>
                  <div className="font-semibold text-white">Giờ làm việc</div>
                  <div>Thứ 2 - Chủ nhật</div>
                  <div>8:00 - 22:00</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>© 2026 TechShop. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
