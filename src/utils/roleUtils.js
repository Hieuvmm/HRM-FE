export const getRolesFromToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token || !token.includes(".")) return [];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.resource_access?.["home-service"]?.roles || [];
  } catch (err) {
    console.error("Token decode failed:", err);
    return [];
  }
};

export const hasRole = (roleName) => {
  const roles = getRolesFromToken();
  return roles.includes(roleName);
};
