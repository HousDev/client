import { Howl } from "howler";

let sound: Howl | null = null;

export const initNotificationSound = () => {
  sound = new Howl({
    src: ["/notification.mp3"],
    volume: 0.7,
    html5: true,
  });

  // 🔥 FORCE UNLOCK AUDIO (CRITICAL)
  sound.once("load", () => {
    sound?.play(); // play once silently
    sound?.pause(); // immediately pause
    sound!.seek(0); // reset
  });
};

export const playNotificationSound = () => {
  if (!sound) {
    console.log("Sound not initialized");
    return;
  }

  sound.play();
};
