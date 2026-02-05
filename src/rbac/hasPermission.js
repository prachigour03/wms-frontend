
export const hasPermission = (
  userPermissions = [],
  module,
  action = "read"
) => {
  return userPermissions.some(
    (p) => p.module === module && p.actions.includes(action)
  );
};
