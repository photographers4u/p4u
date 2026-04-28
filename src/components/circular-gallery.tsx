type CircularGalleryProps = {
  items: string[];
  radius?: number;
  imageScale?: number; // base size multiplier
  duration?: number; // seconds for one full rotation
  className?: string;
};

function formatCssNumber(value: number) {
  const rounded = Number(value.toFixed(3));

  return Object.is(rounded, -0) ? "0" : rounded.toString();
}

function toPx(value: number) {
  return `${formatCssNumber(value)}px`;
}

function toDeg(value: number) {
  return `${formatCssNumber(value)}deg`;
}

export default function CircularGallery({
  items,
  radius = 260,
  imageScale = 1,
  duration = 20,
  className = "",
}: CircularGalleryProps) {
  const baseWidth = 120;
  const imageWidth = baseWidth * imageScale;
  const imageHeight = imageWidth * (5 / 4);

  const size = radius * 2 + Math.max(imageWidth, imageHeight) * 2;
  const center = size / 2;

  return (
    <div className={`absolute w-full overflow-hidden h-full ${className}`}>
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-full"
        style={{
          width: toPx(size),
          height: toPx(size),
        }}
      >
        <div
          className="relative h-full w-full animate-[spin_linear_infinite]"
          style={{
            animationDuration: `${duration}s`,
            animationDirection: "reverse",
          }}
        >
          {items.map((item, index) => {
            const angle = (360 / items.length) * index;
            const radians = (angle * Math.PI) / 180;

            const x = center + Math.cos(radians) * radius - imageWidth / 2;
            const y = center + Math.sin(radians) * radius - imageHeight / 2;

            return (
              <div
                key={item}
                className="absolute"
                style={{
                  width: toPx(imageWidth),
                  height: toPx(imageHeight),
                  left: toPx(x),
                  top: toPx(y),
                  transform: `rotate(${toDeg(angle + 90)})`,
                  transformOrigin: "center center",
                }}
              >
                <div className="h-full w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-lg">
                  {/** biome-ignore lint/performance/noImgElement: <-> */}
                  <img
                    src={item}
                    // biome-ignore lint/a11y/noRedundantAlt: <->
                    alt={`Gallery image ${index + 1}`}
                    className="h-full w-full object-cover pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
