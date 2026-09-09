export function makePostcard(frame, title) {
  if (!frame?.width || !frame?.height)
    throw new Error("The view is not ready yet.");
  const scale = Math.min(1, 1600 / Math.max(frame.width, frame.height));
  const width = Math.max(1, Math.round(frame.width * scale));
  const height = Math.max(1, Math.round(frame.height * scale));
  const footer = Math.round(Math.max(80, width * 0.075));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height + footer;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not create a postcard.");
  context.drawImage(frame, 0, 0, width, height);
  context.fillStyle = "#f3eedb";
  context.fillRect(0, height, width, footer);
  context.fillStyle = "#244b3c";
  const padding = Math.max(16, width * 0.025);
  context.font = `${Math.max(18, width * 0.022)}px Georgia, serif`;
  context.fillText(title, padding, height + footer * 0.4, width - padding * 2);
  context.font = `${Math.max(11, width * 0.011)}px sans-serif`;
  context.fillText(
    "KERALA UNFOLDED · nattilevde.com · A fictional Kerala journey",
    padding,
    height + footer * 0.75,
    width - padding * 2,
  );
  return canvas.toDataURL("image/png");
}
export function postcardFile(dataUrl) {
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) =>
    c.charCodeAt(0),
  );
  return new File([bytes], "kerala-postcard.png", { type: "image/png" });
}
