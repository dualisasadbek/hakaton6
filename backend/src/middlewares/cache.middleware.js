// GET so'rovlarga qisqa muddatli brauzer keshini qo'shadi (foydalanuvchiga ko'rinishi tez)
export function shortCache(seconds = 15) {
  return (_req, res, next) => {
    res.set("Cache-Control", `public, max-age=${seconds}`);
    next();
  };
}
