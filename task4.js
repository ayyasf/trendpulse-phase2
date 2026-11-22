// ===== TrendPulse - المرحلة 2 =====

// ---------- البيانات ----------
const database = {
    p1: {
        id: "p1",
        author: { name: "Mira", email: "mira@trendpulse.dev", verified: true },
        content: "Meet @sara at the hub #js #async",
        engagement: { likes: 12, shares: 2, comments: 4 },
        createdAt: "2026-04-01T09:00:00.000Z"
        },
    p2: {
        id: "p2",
        author: { name: "Rami", email: "invalid-email", verified: false },
        content: "Checkout #node tutorials",
        engagement: { likes: 3 },
        createdAt: "2026-04-02T11:30:00.000Z"
    }
};
// ---------- 1) نموذج منشور غني -------
function describePostForUi(post) {
    const merged = { ...post, meta: { channel: "web" } };
    const { name } = post.author; 

    return {
    title: post.id,
    authorName: name,
    keysCount: Object.keys(merged).length
    };
}
// ---------- 2) قراءات متداخلة آمنة ----------
function getEngagementTotals(post) {
    const likes = post.engagement?.likes ?? 0;
    const shares = post.engagement?.shares ?? 0;
    const comments = post.engagement?.comments ?? 0;

    return { likes, shares, comments };
}

// ---------- 3) جلب غير متزامن محاكى ----------
function fetchPostById(id) {
    return new Promise((resolve, reject) => {
    setTimeout(() => {
        if (database[id]) {
        resolve({ ...database[id] }); // نسخة
        } else {
        reject("NOT_FOUND");
        }
    }, 30);
    });
}

async function demoFetch() {
    try {
    const post = await fetchPostById("p1");
    console.log("found:", post.id);
    } catch (e) {
    console.log("error:", e);
    } finally {
    console.log("done"); // دايمًا
    }
}

// ---------- 4) تحليل النص بالـ regex ----------
const emailOk = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
const hashTag = /#[\w؀-ۿ]+/g;
const mention = /@[\w]+/g;

function analyzePostText(post) {
    const emailValid = emailOk.test(post.author?.email ?? "");

  // match بترجّع null إذا ما لقت شي، فنعوّض بـ []
    const tags = (post.content ?? "").match(hashTag) ?? [];
    const mentions = (post.content ?? "").match(mention) ?? [];

    return { emailValid, tags, mentions };
}


// ---------- 6) التواريخ والمؤقت ----------
function formatIsoDateOnly(iso) {
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // الشهر يبدأ من 0
    const day = String(d.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
}

function startRefreshDemo(onTick) {
    let n = 0;
    const id = setInterval(() => {
    n++;
    onTick(n);
    if (n >= 3) clearInterval(id); // نوقف بعد 3 نبضات
    }, 200);
}

// ---------- 7) التجميعة النهائية ----------
async function runTrendPulsePhase2() {
    const ids = ["p1", "p2"];

    let loaded = 0;
    let validEmails = 0;
    let invalidAuthorId = null;
    const datesFormatted = [];

    for (let i = 0; i < ids.length; i++) {
    const post = await fetchPostById(ids[i]); // واحد ورا واحد
    loaded++;

    const { emailValid } = analyzePostText(post);
    if (emailValid) {
        validEmails++;
    } else if (invalidAuthorId === null) {
        invalidAuthorId = post.id; 
    }

    datesFormatted.push(formatIsoDateOnly(post.createdAt));
    }

    return { loaded, validEmails, invalidAuthorId, datesFormatted };
}

// ===== اختبار =====
console.log(describePostForUi(database.p1));
// { title: "p1", authorName: "Mira", keysCount: 4 }

console.log(getEngagementTotals({ engagement: { likes: 5, shares: 1 } }));
// { likes: 5, shares: 1, comments: 0 }

console.log(analyzePostText(database.p1));
// { emailValid: true, tags: ["#js", "#async"], mentions: ["@sara"] }

console.log(analyzePostText(database.p2));
// { emailValid: false, tags: ["#node"], mentions: [] }