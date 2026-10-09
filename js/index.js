
/* ==========================================
   WANDER — HOMEPAGE JAVASCRIPT
========================================== */

const weddingDate = new Date("2027-11-19T17:00:00-06:00");

function updateCountdown() {
  const countdown =
    document.getElementById("wedding-countdown");

  if (!countdown) return;

  const difference = Math.max(
    0,
    weddingDate.getTime() - Date.now()
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (difference / 1000) % 60
  );

  const setText = (id, value) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = String(value).padStart(2, "0");
    }
  };

  setText("countdown-days", days);
  setText("countdown-hours", hours);
  setText("countdown-minutes", minutes);
  setText("countdown-seconds", seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);
