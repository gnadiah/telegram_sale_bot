import { HOME_BUTTON } from "../keyboards/navigation";

export function renderStartMessage() {
  return {
    buttons: [{ ...HOME_BUTTON, label: "Xem san pham" }],
    text: "Chao mung ban den voi bot ban hang. Bam Xem san pham de tiep tuc."
  };
}
