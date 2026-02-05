

export const hasPermission = (userPermissions, requiredPermission) => {
  if (!requiredPermission) return true;
  return userPermissions.includes(requiredPermission);
};
