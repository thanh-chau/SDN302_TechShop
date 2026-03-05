import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Làm thế nào để đặt hàng?",
      answer:
        "Bạn có thể đặt hàng bằng cách chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán khác nhau.",
    },
    {
      question: "Chính sách bảo hành như thế nào?",
      answer:
        "Tất cả sản phẩm đều được bảo hành chính hãng từ 12-24 tháng tùy theo sản phẩm. Bạn có thể mang sản phẩm đến các trung tâm bảo hành được ủy quyền.",
    },
    {
      question: "Thời gian giao hàng mất bao lâu?",
      answer:
        "Thời gian giao hàng thông thường là 1-3 ngày làm việc đối với nội thành và 3-7 ngày đối với các tỉnh xa. Chúng tôi cũng có dịch vụ giao hàng nhanh trong ngày.",
    },
    {
      question: "Tôi có thể đổi trả sản phẩm không?",
      answer:
        "Có, bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên tem, hộp và chưa qua sử dụng.",
    },
    {
      question: "Các phương thức thanh toán nào được hỗ trợ?",
      answer:
        "Chúng tôi hỗ trợ thanh toán COD (tiền mặt khi nhận hàng), chuyển khoản ngân hàng, và các ví điện tử như MoMo, ZaloPay.",
    },
    {
      question: "Làm sao để kiểm tra bảo hành?",
      answer:
        "Bạn có thể kiểm tra tình trạng bảo hành bằng cách nhập mã sản phẩm hoặc số serial trên trang web của chúng tôi.",
    },
    {
      question: "Sản phẩm có chính hãng không?",
      answer:
        "Tất cả sản phẩm tại TechShop đều là hàng chính hãng 100%, có đầy đủ tem nhãn, hóa đơn VAT và được bảo hành chính hãng.",
    },
    {
      question: "Có hỗ trợ trả góp không?",
      answer:
        "Có, chúng tôi hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng và các công ty tài chính như Home Credit, FE Credit.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <HelpCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Câu hỏi thường gặp
        </h1>
        <p className="text-gray-600">
          Tìm câu trả lời cho các câu hỏi phổ biến của bạn
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-lg text-gray-900 pr-4">
                {faq.question}
              </h3>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-red-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {openIndex === index && (
              <div className="px-6 pb-6">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-red-50 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Không tìm thấy câu trả lời?
        </h2>
        <p className="text-gray-600 mb-4">
          Liên hệ với chúng tôi để được hỗ trợ trực tiếp
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="tel:1900-xxxx"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Gọi: 1900-xxxx
          </a>
          <a
            href="mailto:support@techshop.vn"
            className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-gray-300"
          >
            Email: support@techshop.vn
          </a>
        </div>
      </div>
    </div>
  );
}
