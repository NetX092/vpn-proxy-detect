auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "/login.html";

  const check = await fetch(`https://YOUR-RENDER-URL.onrender.com/check-ip?uid=${user.uid}`);
  const result = await check.json();

  if (result.banned) {
    alert("You are using VPN/Proxy. Your account has been banned.");
    await auth.signOut();
    location.href = "/banned.html";
  } else {
    // load dashboard normally
  }
});
