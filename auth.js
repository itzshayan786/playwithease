function signup(){
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!name || !email || !password){
    alert("Please fill all fields");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  if(users.find(u => u.email === email)){
    alert("Account already exists");
    return;
  }

  users.push({name,email,password});
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created successfully");
  window.location.href = "login.html";
}

function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);

  if(!user){
    alert("Invalid email or password");
    return;
  }

  localStorage.setItem("loggedUser", JSON.stringify(user));
  window.location.href = "index.html";
}

function logout(){
  localStorage.removeItem("loggedUser");
  window.location.href = "login.html";
}

function checkLogin(){
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  if(!user){
    window.location.href = "login.html";
  }
}
