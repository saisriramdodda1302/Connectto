export default function UserImage({ image, size = "60px" }) {
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return (
    <div style={{ width: size, height: size }}>
      <img
        style={{ objectFit: "cover", borderRadius: "50%" }}
        width={size}
        height={size}
        alt="user"
        src={`${backendUrl}/assets/${image}`}
      />
    </div>
  );
}