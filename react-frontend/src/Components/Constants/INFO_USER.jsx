export const getUser = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Lỗi parse user:", error);
    return null;
  }
};

export const getToken = () => {
  const token = localStorage.getItem("token") ?? null;
  return token && token !== "null" && token !== "undefined" ? token : null;
};

// Nếu muốn gộp cả hai thành 1 hàm tiện hơn
export const getAuth = () => {
  const user = getUser();
  const token = getToken();
  return { user, token };
};

export const getRole = () => {
  const user = getUser();
  return user?.role ?? null;
};
