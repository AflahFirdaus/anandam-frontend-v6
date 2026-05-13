import { useEffect, useRef } from "react";

export default function GlassParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const img = new Image();
    img.src = "/background-morphism1.svg";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
      drawBackground();
    };

    const drawBackground = () => {
      if (!img.complete) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imgWidth = 1366;
      const imgHeight = 768;

      const cols = Math.ceil(canvas.width / imgWidth);
      const rows = Math.ceil(canvas.height / imgHeight);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * imgWidth;
          const y = row * imgHeight;

          ctx.save();

          ctx.translate(x + imgWidth / 2, y + imgHeight / 2);

          const flipX = row % 2 === 1;
          const flipY = col % 2 === 1;

          ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

          ctx.drawImage(
            img,
            -imgWidth / 2,
            -imgHeight / 2,
            imgWidth,
            imgHeight
          );

          ctx.restore();
        }
      }

      // BLUR
      ctx.save();
      ctx.filter = "blur(3px)";
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();

      // overlay putih
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    img.onload = resize;

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}