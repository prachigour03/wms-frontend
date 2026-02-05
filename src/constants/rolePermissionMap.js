export const ROLE_PERMISSION_MAP = {
  "super admin": {
    USER: ["CREATE", "READ", "UPDATE", "DELETE"],
    ROLE: ["CREATE", "READ", "UPDATE", "DELETE"],
    PERMISSION: ["CREATE", "READ", "UPDATE", "DELETE"],
    ORDER: ["CREATE", "READ", "UPDATE", "DELETE"],
  },

  admin: {
    USER: ["CREATE", "READ", "UPDATE"],
    ORDER: ["READ", "UPDATE"],
  },

  manager: {
    ORDER: ["READ", "UPDATE"],
    PRODUCT: ["READ"],
  },

  staff: {
    ORDER: ["READ"],
  },

  vendor: {
    USER: ["READ"],
  },
};
