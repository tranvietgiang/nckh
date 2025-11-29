export const Logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.clear();
};
