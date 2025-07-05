const fighterImages = {
  Медуза: "/images/medusa.webp",
  "Король Артур": "/images/arthur.jpg",
  Алиса: "/images/alice.webp",
  Синдбад: "/images/sindbad.webp",
  // ... остальные 21 изображение
  _default: "/images/default.jpg",
};

export const getFighterImage = (name) =>
  fighterImages[name] || fighterImages._default;
export default fighterImages;
