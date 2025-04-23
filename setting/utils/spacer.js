export function Spacer(options = {}) {
  const { width = "100%", height = "8px" } = options;

  return View({
    style: {
      width: width,
      height: height,
      backgroundColor: "transparent",
    },
  });
}
