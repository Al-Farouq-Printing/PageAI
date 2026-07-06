/* =========================================================
   PageAI — كل حاجة شغالة من المتصفح مباشرة، بدون أي سيرفر خارجي
   ========================================================= */

// 👇👇 غيّري القيم دي بالقيم من Firebase Console → Project settings → Your apps (سطور 6-13) 👇👇
const firebaseConfig = {
  apiKey: "AIzaSyCqgkTyEsmh-KTW_2TmyR9wNvLlUvhMKZA",
  authDomain: "pageai-c99f9.firebaseapp.com",
  projectId: "pageai-c99f9",
  storageBucket: "pageai-c99f9.firebasestorage.app",
  messagingSenderId: "170017778677",
  appId: "1:170017778677:web:5efdc50092ff32078a8ebc",
};
// 👆👆 خلصنا هنا 👆👆

// المفاتيح دي هتبقى ظاهرة لأي حد يفتح كود الصفحة — ده تريد أوف طبيعي لما تشتغلي بدون سيرفر
const GEMINI_API_KEY = "AQ.Ab8RN6JmgpHmEj4vMrHc1a7NIMONL_5PIWWnW-pzXCgjXRZW5g";
const TELEGRAM_BOT_TOKEN = "7581398773:AAFi-E6UbJtcbXytEClyABITYrdM6DnP6kA";
const TELEGRAM_ADMIN_CHAT_ID = "6274518836";

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ---------- تليجرام مباشرة من المتصفح ---------- */
async function notifyTelegram(text) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_CHAT_ID, text, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.warn("Telegram notify failed", err);
  }
}

/* ---------- تسجيل الدخول ---------- */
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  try {
    const result = await auth.signInWithPopup(provider);
    return result.user;
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      await auth.signInWithRedirect(provider); // الصفحة هتتحوّل وترجع تاني بعد اختيار الحساب
      return null;
    }
    throw err; // أي خطأ تاني (زي auth/unauthorized-domain) لازم يظهر للمستخدمة بدل ما يتبلع
  }
}

async function checkRedirectResult() {
  const result = await auth.getRedirectResult(); // من غير try/catch عشان أي خطأ حقيقي يظهر بدل ما يتبلع
  return result && result.user ? result.user : null;
}

async function signUpWithEmail(email, password) {
  await auth.createUserWithEmailAndPassword(email, password);
}

async function signInWithEmail(email, password) {
  await auth.signInWithEmailAndPassword(email, password);
}

async function signOutUser() {
  await auth.signOut();
}

/* بعد أي دخول ناجح: نتأكد من وجود بروفايل المستخدم في Firestore، ولو أول مرة نبعت إشعار تليجرام */
async function registerUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = db.collection("users").doc(user.uid);
  const snap = await userRef.get();

  if (!snap.exists) {
    await userRef.set({
      email: user.email || "غير متوفر",
      provider: user.providerData[0]?.providerId || "unknown",
      plan: "free",
      dailyCount: 0,
      dailyDate: "",
      subscriptionExpiry: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await notifyTelegram(`🆕 <b>تسجيل جديد في PageAI</b>\nالبريد: ${user.email}`);
  }

  return (await userRef.get()).data();
}
