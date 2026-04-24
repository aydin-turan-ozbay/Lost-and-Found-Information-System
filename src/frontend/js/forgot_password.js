const questionLabels = {
    nickname: "What was your childhood nickname?",
    first_pet: "What was the name of your first pet?",
    mother_maiden: "What is your mother's maiden name?",
    favorite_color: "What is your favorite color?"
};

const $ = (id) => document.getElementById(id);
const statusEl = $("statusText");

function setStatus(msg, type) {
    statusEl.classList.remove("error", "success");
    if (type) statusEl.classList.add(type);
    statusEl.textContent = msg || "";
}

function setBusy(isBusy) {
    $("searchBtn").disabled = isBusy;
    $("retrieveBtn").disabled = isBusy;
    $("updateBtn").disabled = isBusy;
}

async function post(action, payload) {
    const form = new URLSearchParams({ action, ...payload });
    const res = await fetch("../backend/forgot_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString()
    });
    const data = await res.json().catch(() => null);
    if (!data) throw new Error("Invalid server response.");
    return data;
}

function resetUI() {
    $("full_name").value = "";
    $("security_answer").value = "";
    $("new_password").value = "";
    $("securityBlock").classList.add("hidden");
    $("updateBlock").classList.add("hidden");
    $("security_question").innerHTML = `<option value="" selected>—</option>`;
}

$("searchBtn").addEventListener("click", async () => {
    const email = $("email").value.trim();
    resetUI();
    setStatus("", null);

    if (!email) {
        setStatus("Please enter your email.", "error");
        return;
    }

    setBusy(true);
    try {
        const data = await post("lookup", { email });
        if (!data.ok) {
            setStatus(data.error || "User not found.", "error");
            return;
        }

        $("full_name").value = data.full_name || "";

        const qKey = data.security_question || "";
        const label = questionLabels[qKey] || qKey || "—";
        $("security_question").innerHTML = `<option value="${qKey}" selected>${label}</option>`;

        $("securityBlock").classList.remove("hidden");
        setStatus("Please fill in the security question.", null);
    } catch (e) {
        setStatus(e.message || "System error.", "error");
    } finally {
        setBusy(false);
    }
});

$("retrieveBtn").addEventListener("click", async () => {
    const email = $("email").value.trim();
    const answer = $("security_answer").value.trim();
    setStatus("", null);

    if (!email) {
        setStatus("Please enter your email.", "error");
        return;
    }
    if (!answer) {
        setStatus("Please enter your security answer.", "error");
        return;
    }

    setBusy(true);
    try {
        const data = await post("verify", { email, answer });
        if (!data.ok) {
            setStatus(data.error || "Wrong answer.", "error");
            return;
        }

        $("updateBlock").classList.remove("hidden");
        setStatus("Verification successful! Enter your new password.", "success");
        alert("Verification successful! Please enter your new password.");
    } catch (e) {
        setStatus(e.message || "System error.", "error");
    } finally {
        setBusy(false);
    }
});

$("updateBtn").addEventListener("click", async () => {
    const email = $("email").value.trim();
    const answer = $("security_answer").value.trim();
    const newPassword = $("new_password").value;
    setStatus("", null);

    if (!email) {
        setStatus("Please enter your email.", "error");
        return;
    }
    if (!answer) {
        setStatus("Please enter your security answer.", "error");
        return;
    }
    if (!newPassword || newPassword.length < 8) {
        setStatus("Password must be at least 8 characters long.", "error");
        return;
    }

    setBusy(true);
    try {
        const data = await post("update", { email, answer, new_password: newPassword });
        if (!data.ok) {
            setStatus(data.error || "Could not update password.", "error");
            return;
        }

        setStatus("Your password has been updated. You are being redirected to the login page.", "success");
        alert("Your password has been updated. You are being redirected to the login page.");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 900);
    } catch (e) {
        setStatus(e.message || "System error.", "error");
    } finally {
        setBusy(false);
    }
});
