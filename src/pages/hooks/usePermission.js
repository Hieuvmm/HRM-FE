// hooks/usePermission.js

import { useMemo } from "react";
import {
  ROLES,
  hasRole,
  hasAnyRole,
  canEditPhieu,
  canApprove,
  canViewPrice,
  canChooseApprover
} from "../utils/roleUtils";

// Giả sử roles đến từ context, token, hoặc props
export default function usePermission(userRoles = []) {
  return useMemo(() => ({
    isAdmin: hasRole(userRoles, ROLES.ADMIN),
    isNhanVien: hasRole(userRoles, ROLES.NHANVIEN),
    isTho: hasRole(userRoles, ROLES.THO),
    isTelesale: hasRole(userRoles, ROLES.TELESALE),
    isKhach: hasRole(userRoles, ROLES.KHACH),

    canEditPhieu: (status) => canEditPhieu(status, userRoles),
    canApprove: canApprove(userRoles),
    canViewPrice: canViewPrice(userRoles),
    canChooseApprover: canChooseApprover(userRoles),
  }), [userRoles]);
}
