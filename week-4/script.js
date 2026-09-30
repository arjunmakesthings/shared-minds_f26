// fill these in with your own supabase project's values
// (project settings -> api)
const SUPABASE_URL = "https://hwkejntffarkeerjrvjk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UUvPRSkqJSRxAuYdLO1l7Q_LUmc5-TQ";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("messageForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const list = document.getElementById("messageList");

async function loadMessages() {
  const { data, error } = await db
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  list.innerHTML = "";
  for (const row of data) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${row.name}</strong>${row.message}`;
    list.appendChild(li);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const { error } = await db.from("messages").insert({
    name: nameInput.value,
    message: messageInput.value,
  });

  if (error) {
    console.error(error);
    return;
  }

  form.reset();
  loadMessages();
});

loadMessages();
