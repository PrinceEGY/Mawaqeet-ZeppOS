const T = `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5"%3E%3Cpath fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /%3E%3C/svg%3E%0A')`;

export function MenuButton(options) {
  const { label, onClick } = options;

  return Button({
    style: {
      backgroundColor: "#202020",
      color: "white",
      width: "100%",
      borderBottom: "1px solid grey",
      borderRadius: 0,
      padding: "12px 8px",
      fontWeight: "normal",
      fontSize: "16px",
    },
    label: View(
      {
        style: {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        },
      },
      [
        Text({}, label),
        View({
          style: {
            width: "32px",
            height: "32px",

            WebkitMaskImage: T,
            maskImage: T,
            backgroundColor: "white", // Image is black, getting multiplied by white makes it white

            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",

            WebkitMaskSize: "contain",
            maskSize: "contain",

            WebkitPosition: "center",
            maskPosition: "center",
          },
        }),
      ]
    ),
    onClick,
  });
}
