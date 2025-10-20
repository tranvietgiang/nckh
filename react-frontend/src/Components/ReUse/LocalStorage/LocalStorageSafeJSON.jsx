// Đọc JSON an toàn
export const getSafeJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined" || value === "null") return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// Ghi JSON an toàn
export const setSafeJSON = (key, value) => {
  try {
    // Nếu dữ liệu null hoặc undefined → xóa luôn key
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`❌ setSafeJSON(${key}) lỗi:`, error);
  }
};

// Xóa key
export const removeSafeJSON = (key) => {
  localStorage.removeItem(key);
};
