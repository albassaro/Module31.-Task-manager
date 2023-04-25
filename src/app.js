import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import { displayTasks } from "./userTasks";
import { User } from "./models/User";
import { generateTestUser, getFromStorage } from "./utils";
import { State } from "./state";

export const appState = new State();
//Поиск нужных эл-тов на странице
const loginForm = document.querySelector("#app-login-form");
const enterForm = document.querySelector(".d-flex");
const userMenu = document.querySelector(".user-info");
const userMenuArrow = document.querySelector(".dropdown-arrow-click");
const dropdownMenu = document.querySelector(".dropdown-menu");
const logOut = document.querySelector(".user-logOut");
// Переменная для задания угла поворота стрелки
let angle = 0;

generateTestUser(User);

// Событие открытия меню пользователя в шапке сайта
userMenuArrow.addEventListener("click", (e) => {
  rotateArrowMenu(e.target);
  if (dropdownMenu.classList.contains("show")) {
    dropdownMenu.classList.remove("show");
    return;
  } else {
    dropdownMenu.classList.add("show");
    return;
  }
});

// Функция для переворачивания стрелки в меню
function rotateArrowMenu(currentTarget) {
  angle += 180;
  currentTarget.style.transform = "rotate(" + angle + "deg)";
}

// Нажатие кнопки log out и возвращение на начальный экран 
logOut.addEventListener("click", (e) => {
  document.querySelector(".kenban-board").innerHTML = `<p id="content">Please Sign In to see your tasks!</p>`;
  if (dropdownMenu.classList.contains("show")) {
    rotateArrowMenu(userMenuArrow);
    dropdownMenu.classList.remove("show");
  }
  userMenu.classList.add("disabled");
  enterForm.classList.remove("disabled");
  enterForm.reset();
});

// Клик по документу в любом месте кроме эл-тов меню закроет меню пользователя
document.addEventListener('click',(e)=>{
  if (!document.querySelector(".dropdown").contains(e.target) && dropdownMenu.classList.contains("show")){
    rotateArrowMenu (userMenuArrow);
    dropdownMenu.classList.remove("show");
  }
});

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  // Проверяет есть ли в базе пользователь с данными, введенными в форме входа
  let fieldHTMLContent = User.hasAccess(login, password);
  // Если есть
  if (fieldHTMLContent) {
    enterForm.classList.add("disabled");
    userMenu.classList.remove("disabled");

    // Проверяем его статус: админ или пользователь
    if (appState.currentUser.storageKey === "admins") {
      let usersCount = getFromStorage("users");
      document.querySelector(".kenban-board").innerHTML = ``;
      for (const user of usersCount) {
        document.querySelector(".kenban-board").insertAdjacentHTML("afterbegin", taskFieldTemplate);
        displayTasks(user);
      }
      // Приветствуем админа
      document.querySelector(".kenban-board").insertAdjacentHTML("afterbegin",
      `<h1 class="board-title-admin">Здравствуйте, ${appState.currentUser.login}!` +" \n Ниже выведены задачи всех пользователей:</h1>");

      // Указываем имя пользователя в шапке сайта
      document.querySelector(".user-name").innerHTML = `${appState.currentUser.login}`;
    } else {
      document.querySelector(".kenban-board").innerHTML = taskFieldTemplate;
      displayTasks(appState.currentUser);
      document.querySelector(".user-name").innerHTML = `${appState.currentUser.login}`;
    }
  } else {
    document.querySelector(".kenban-board").innerHTML = noAccessTemplate;
  }
});
