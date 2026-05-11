

const StarSVG: React.FC<{ fill: string; size: number; style?: React.CSSProperties }> = ({ fill, size, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="2 2 20 19"
    style={{ opacity: 1, display: "block", ...style }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 
    9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27z"
      fill={fill}
    />
  </svg>

);


interface StarWrapperProps {
  isFull: boolean;
  isPartial: boolean;
  size: number;
  fullColor?: string;
  emptyColor?: string;
}

const StarWrapper: React.FC<StarWrapperProps> = ({
  isFull,
  isPartial,
  size,
  fullColor = "#F4C430",
  emptyColor = "#E5E7EB",
}) => {
  const fracWidth = isPartial ? Math.round(size * 0.5) : 0;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Empty base */}
      <StarSVG fill={emptyColor} size={size} />

      {/* Full overlay */}
      {isFull && (
        <div style={{ position: "absolute", inset: 0 }}>
          <StarSVG fill={fullColor} size={size} />
        </div>
      )}

      {/* Fractional overlay */}
      {isPartial && (
        <div
          style={{
            position: "absolute",
            top: 0,
            insetInlineStart: 0,
            height: size,
            width: fracWidth,
            overflow: "hidden",
          }}
        >
          <StarSVG fill={fullColor} size={size} />
        </div>
      )}
    </div>
  );
};

export default StarWrapper;
