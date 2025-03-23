import { useState } from "react";

const getInitials = (name: string) => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  return words.length > 1
    ? words[0][0] + words[1][0] // Take first letter of first and second word
    : name.substring(0, 2); // Take first two characters
};

export default function Image(props: any) {
  const { src, alt, className, ...rest } = props;
  const [imageError, setImageError] = useState(false);

  const shouldShowAvatar = !src || imageError;

  //   const placeholderName = getInitials(rest.name || alt);
  const placeholderName = rest.name || getInitials(alt);
  //   const placeholderName = getInitials(rest.name || alt);
  return (
    <div>
      {shouldShowAvatar ? (
        <img
          src={`https://placehold.co/512x512@2x/6842ff/ffffff?text=${placeholderName}`}
          alt={alt || "Avatar"}
          onError={() => setImageError(true)}
          style={{
            // width: "100%",
            // height: "100%",
            width: rest.size,
            height: rest.size,

            objectFit: "cover",
            borderRadius: "50%",
          }}
          className={className}
        />
      ) : (
        <img
          src={src}
          alt={alt || "Avatar"}
          onError={() => setImageError(true)}
          style={{
            width: rest.size,
            height: rest.size,

            objectFit: "cover",
            borderRadius: "50%",
          }}
          className={className}
        />
      )}
    </div>
  );
}
