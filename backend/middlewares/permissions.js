export const checkPermissions = (requiredPermission) => {
  return (req, res, next) => {
    // Temporalmente permitir todo sin validar permisos
    next();
  };
};

// export const checkPermissions = (requiredPermission) => {
//   return (req, res, next) => {
//     const userPermissions = req.user?.permissions || [];

//     if (!userPermissions.includes(requiredPermission)) {
//       return res
//         .status(403)
//         .json({ success: false, error: 'Permiso denegado' });
//     }

//     next();
//   };
// };
