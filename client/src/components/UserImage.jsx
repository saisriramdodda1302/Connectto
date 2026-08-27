import { useState } from "react";
import { User } from "lucide-react";

export default function UserImage({ image, size = "60px" }) {
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const [failed, setFailed] = useState(false);

  const src = /^(data:|https?:)/.test(image || "")
    ? image
    : `${backendUrl}/assets/${image}`;

  return (
    <div
      className="rounded-full overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {!image || failed ? (
        <User className="w-1/2 h-1/2 text-neutral-500 dark:text-neutral-400" />
      ) : (
        <img
          style={{ objectFit: "cover" }}
          width={size}
          height={size}
          alt="user"
          src={src}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
