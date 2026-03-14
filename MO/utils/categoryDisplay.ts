/** Map tên danh mục từ API (en) sang tên hiển thị đầy đủ, đẹp (dùng ở Header + ProductGrid). */
const DISPLAY_NAME_MAP: Record<string, string> = {
  phone: 'Điện thoại',
  laptop: 'Laptop',
  tablet: 'Tablet',
  audio: 'Âm thanh',
  accessories: 'Phụ kiện',
  monitor: 'Màn hình',
};

export function getCategoryDisplayName(apiName: string | null | undefined): string {
  if (apiName == null || apiName === '') return '';
  const key = String(apiName).toLowerCase().trim();
  return DISPLAY_NAME_MAP[key] || apiName;
}
