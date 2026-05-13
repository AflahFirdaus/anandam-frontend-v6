let idleTimeout: any;

const IDLE_LIMIT = 15 * 60 * 1000; // 15 menit (ubah sesuai kebutuhan)

function logout() {
  localStorage.clear();
  window.location.href = "/ayamgoreng/login";
}

// ================= IDLE TIMER =================
function resetIdleTimer() {
  clearTimeout(idleTimeout);

  idleTimeout = setTimeout(() => {
    console.warn("Idle limit tercapai. Melakukan logout otomatis...");
    logout();
  }, IDLE_LIMIT);
}

// ================= INIT =================
export function initIdleTimer() {
  if (!localStorage.getItem("token")) return;

  clearIdleTimer();

  const events = ["mousemove", "keydown", "click", "scroll"];

  events.forEach((event) => {
    window.addEventListener(event, resetIdleTimer);
  });

  resetIdleTimer();
}

// ================= CLEANUP (optional) =================
export function clearIdleTimer() {
  clearTimeout(idleTimeout);

  const events = ["mousemove", "keydown", "click", "scroll"];
  events.forEach((event) => {
    window.removeEventListener(event, resetIdleTimer);
  });
}

// let idleTimeout: any;
// let tokenTimeout: any;

// const IDLE_LIMIT = 15 * 60 * 1000; // 15 menit (ubah sesuai kebutuhan)

// function logout() {
//   localStorage.clear();
//   window.location.href = "/ayamgoreng/login";
// }

// // ================= TOKEN EXP CHECK =================
// function setupTokenExpiry() {
//   const token = localStorage.getItem("token");
//   if (!token) return;

//   try {
//     function parseJwt(token: string) {
//       try {
//         const base64 = token.split(".")[1];
//         const base64Url = base64.replace(/-/g, "+").replace(/_/g, "/");
//         const jsonPayload = decodeURIComponent(
//           atob(base64Url)
//             .split("")
//             .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//             .join("")
//         );

//         return JSON.parse(jsonPayload);
//       } catch {
//         return null;
//       }
//     }

//     const payload = parseJwt(token);

//     if (!payload || !payload.exp) {
//       logout();
//       return;
//     }

//     const exp = payload.exp * 1000;
//     const now = Date.now();

//     const remaining = exp - now;

//     if (remaining <= 0) {
//       logout();
//       return;
//     }

//     clearTimeout(tokenTimeout);

//     tokenTimeout = setTimeout(() => {
//       logout();
//     }, remaining);

//   } catch {
//     logout();
//   }
// }

// // ================= IDLE TIMER =================
// function resetIdleTimer() {
//   clearTimeout(idleTimeout);

//   idleTimeout = setTimeout(() => {
//     logout();
//   }, IDLE_LIMIT);
// }

// // ================= INIT =================
// export function initIdleTimer() {
//   if (!localStorage.getItem("token")) return;

//   clearIdleTimer();

//   // setup token expiry
//   setupTokenExpiry();

//   const events = ["mousemove", "keydown", "click", "scroll"];

//   events.forEach((event) => {
//     window.addEventListener(event, resetIdleTimer);
//   });

//   resetIdleTimer();
// }

// // ================= CLEANUP (optional) =================
// export function clearIdleTimer() {
//   clearTimeout(idleTimeout);
//   clearTimeout(tokenTimeout);

//   const events = ["mousemove", "keydown", "click", "scroll"];
//   events.forEach((event) => {
//     window.removeEventListener(event, resetIdleTimer);
//   });
// }