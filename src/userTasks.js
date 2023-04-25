import autosize from "autosize";
import { addToStorage } from "./utils";
import { getFromStorage, AddNewItem } from "./utils";
import { getItemsInColumn } from "./utils";
import { getItems } from "./utils";
import { deleteItem } from "./utils";
import { updateItem } from "./utils";
import { appState } from "./app";

export const displayTasks = function (userId) {

  // Берем уникальный ключ пользователя и на него создаем новую запись со списком задач на доске,
  // чтобы каждый пользователь был привязан к своей доске задач
  let userKey = userId.id;
  
  // Ищем общий родительский элемент для делегирования событий через него
  let parentDelegate = document.querySelector(".wrapper");

  // Находим заголовок таблицы и указываем в названии имя пользователя
  document.querySelector(".board-title").innerHTML =
    `Здравствуйте, ${userId.login}!` + "\n Ваш список задач:";
  // Читаем базу данных
  let saveData = getFromStorage(userKey, 2);
  for (const data of saveData) {
    renderFromStorage(data);
  }
  // Подсчет количества задач
  getNumberOfTasks();

  // Функция для отрисовки задач из базы данных при загрузке страницы
  function renderFromStorage(data) {
    // Находим текущую колонку по атрибуту
    const currentColumn = document.querySelector(`[column-id ="${data.id}"]`);
    // Находим div зону со всеми задачами для отрисовки эл-тов из базы если они есть
    const taskItems = currentColumn.querySelector(".tasks-column");

    // Пробегаем по данным каждого элемента из всех колонок по очереди(от 1 до 3) и отрисовываем их(задачи)
    for (const item of data.items) {
      let newItem = document.createElement("div");
      newItem.className = "tasks-list";
      newItem.dataset.id = item.id;
      newItem.innerHTML = `<textarea name="textarea" class="task-list__item" draggable = true>${item.content}</textarea>
      <div class="board-dropzone"></div>`;
      taskItems.appendChild(newItem);
      autosize(document.querySelectorAll("textarea"));
    }
  }

  // Функция вывода количества текущих (существующих и заполненных) задач
  function getNumberOfTasks(parent) {
    // Счетчики пустых задач в колонках
    let countEmptyActiveTasks = 0;
    let countEmptyFinishTasks = 0;

    // Поиск эл-тов для вывода в них значений

    // Считаем во 2 и 3 колонках количество пустых задач чтобы их не выводить в итоговых значениях
    let activeItemsCount = getItemsInColumn(userKey, 2);
    for (let i = 0; i < activeItemsCount.length; i++) {
      if (activeItemsCount[i].content === "") {
        countEmptyActiveTasks++;
      }
    }

    let finishItemsCount = getItemsInColumn(userKey, 3);
    for (let i = 0; i < finishItemsCount.length; i++) {
      if (finishItemsCount[i].content === "") {
        countEmptyFinishTasks++;
      }
    }

    // Вывод кол-ва задач исключая пустые
    if (parent) { // Когда пользователь - админ
      const countTasksParent = parent.closest(".wrapper").previousElementSibling;

      const activeTasksCount = countTasksParent.querySelector(".active-tasks");
      const finishedTasksCount = countTasksParent.querySelector(".finish-tasks");

      if (activeTasksCount && finishedTasksCount) {
        activeTasksCount.innerHTML = `Active tasks - ${
          activeItemsCount.length - countEmptyActiveTasks}`;

        finishedTasksCount.innerHTML = `Finish tasks - ${
          finishItemsCount.length - countEmptyFinishTasks}`;
      } else return;
    } else { // Когда обычный пользователь
      const activeTasksCount = document.querySelector(".active-tasks");
      const finishedTasksCount = document.querySelector(".finish-tasks");
      activeTasksCount.innerHTML = `Active tasks - ${
        activeItemsCount.length - countEmptyActiveTasks}`;

      finishedTasksCount.innerHTML = `Finish tasks - ${
        finishItemsCount.length - countEmptyFinishTasks}`;
    }
  }

  // Функция добавления нового эл-та через кнопку "+Add"
  function renderItem(e) {
    // Ищем колонку в которой нажали кнопку
    const parentItem = e.closest(".board-column");
    // Функция для добавления нового эл-та в базу данных
    AddNewItem(userKey, "", parentItem.getAttribute("column-id"), "", 1);
    // Ищем все элем-ты в указанной колонке, в базе данных
    let arrItems = getItemsInColumn(
      userKey,
      parentItem.getAttribute("column-id")
    );
    // Находим div зону со всеми задачами для добавления в нее новой задачи
    const tasksItem = parentItem.querySelector(".tasks-column");
    // Поиск кнопок для смены их классов
    const changeAddBtn = parentItem.querySelector(".task-add");
    const changeSbmBtn = parentItem.querySelector(".task-submit.disable");

    // Добавление нового эл-та на страницу
    let newItem = document.createElement("div");
    newItem.className = "tasks-list";
    // Добавляем новому эл-ту атрибут, который берем из последнего эл-та массива в базе данных (выше его создали и назначили уникальный id)
    newItem.dataset.id = arrItems[arrItems.length - 1].id;

    newItem.innerHTML = `<textarea name="textarea" class="task-list__item" draggable = true></textarea>
      <div class="board-dropzone"></div>`;

    tasksItem.appendChild(newItem);
    // Фокус на элементе
    tasksItem.lastChild.firstChild.focus();
    // Автокорректировка размеров textarea
    autosize(document.querySelectorAll("textarea"));
    // Смена кнопок между собой
    changeAddBtn.classList.add("disable");
    changeSbmBtn.classList.remove("disable");
  }

  // Функция отвечающая за обновление данных в базе
  function changeContent(blurItemData) {
    // Ищем родительский div нажатой textarea
    const parentItem = blurItemData.closest(".tasks-list");
    // Получаем из базы текущее содержимое нажатой задачи по уникальному коду id
    const oldContent = getItems(userKey, parentItem.getAttribute("data-id"));
    // Убираем лишние пробелы
    const newContent = blurItemData.value.trim();
    // Сравниваем поменялось ли содержимое
    if (newContent == oldContent.textContent) {
      return;
    }

    oldContent.textContent = newContent;

    // Обновляем в базе содержимое задачи
    updateItem(userKey, parentItem.getAttribute("data-id"), {
      content: oldContent.textContent,
    });

    // Обновляем счетчики задач
    getNumberOfTasks(blurItemData);
  }

  // Событие нажатия на кнопку добавления задачи (+Add)
  parentDelegate.addEventListener("click", (e) => {
    if (e.target.closest(".task-add")) {
      // Проверяем что нажата кнопка +Add
      // Вызываем функцию для отрисовки нового текстового поля
      renderItem(e.target);
    } else if (e.target.closest(".task-submit")) {
      // Если нажата кнопка Submit
      // Ищем родительский эл-т для кнопок
      const parentItem = e.target.closest(".task-button");
      // Ищем кнопку + Add которая выключена
      const changeAddBtn = parentItem.querySelector(".task-add.disable");
      // Ищем активную кнопку Submit
      const changeSbmBtn = parentItem.querySelector(".task-submit");
      // Смена кнопок между собой
      changeSbmBtn.classList.add("disable");
      changeAddBtn.classList.remove("disable");
    }
  });

  // Событие фокуса на эл-те. Меняюет кнопки и обновляет данныу в базе при их изменении (текст задачи или позиция эл-та)
  parentDelegate.addEventListener("focusin", (e) => {
    if (e.target.closest(".task-list__item")) {
      const parentItem = e.target.closest(".board-column");
      const changeAddBtn = parentItem.querySelector(".task-add");
      const changeSbmBtn = parentItem.querySelector(".task-submit.disable");
      changeAddBtn.classList.add("disable");
      changeSbmBtn.classList.remove("disable");
      changeContent(e.target);
    }
  });
  // Событие обратное фокусу. Делает тоже самое только при снятии фокуса с эл-та
  parentDelegate.addEventListener("focusout", (e) => {
    if (e.target.closest(".task-list__item")) {
      const parentItem = e.target.closest(".board-column");
      const changeAddBtn = parentItem.querySelector(".task-add.disable");
      const changeSbmBtn = parentItem.querySelector(".task-submit");
      changeSbmBtn.classList.add("disable");
      changeAddBtn.classList.remove("disable");
      changeContent(e.target);
    }
  });
  // Событие двойного клика для удаления задачи
  parentDelegate.addEventListener("dblclick", (e) => {
    if (e.target.closest(".task-list__item")) {
      // Отключаем задачу чтобы не сработали события фокуса
      e.target.setAttribute("disabled", "disabled");

      const check = confirm("Вы точно хотите удалить данный элемент?");
      if (check) {
        const targetParent = e.target.closest(".tasks-list");
        // Функция удаления эл-та в базе
        deleteItem(userKey, targetParent.getAttribute("data-id"));
        // Обновление счетчика задач
        getNumberOfTasks(e.target);
        // Удаление эл-та из верстки
        targetParent.remove();
        
      } else {
        e.target.removeAttribute("disabled");
      }
    }
  });

  // РЕАЛИЗАЦИЯ Drag&Drop

  parentDelegate.addEventListener("dragstart", (e) => {
    // Записываем уникальный id взятого для перетаскивания эл-та 
    const targetId = e.target.closest(".tasks-list");
    e.dataTransfer.setData("targetId", targetId.dataset.id);
    // Выключение эл-та во время перетаскивания чтобы случайно не сработали другие собития
    e.target.setAttribute("disabled", "disabled");
  });

  parentDelegate.addEventListener("dragend", (e) => {
    // Делаем эл-т снова доступным
    e.target.removeAttribute("disabled");
    // Считаем кол-во задач
    getNumberOfTasks(e.target);
  });

  parentDelegate.addEventListener("dragover", (e) => {
    e.preventDefault();
    // При наведении на зону сброса меняем ее стили, чтобы польз-ль понимал куда можно сбросить задачу
    if (e.target.closest(".board-dropzone")) {
      e.target.className = "board-dropzone--active";
    }
  });

  parentDelegate.addEventListener("dragleave", (e) => {
    e.preventDefault();
    if (e.target.closest(".board-dropzone--active")) {
      e.target.className = "board-dropzone";
    }
  });

  parentDelegate.addEventListener("drop", (e) => {
    if (e.target.closest(".board-dropzone--active")) {
      e.target.className = "board-dropzone";
      // Находим колонку куда сбросили эл-т
      const columnElement = e.target.closest(".board-column");
      // Получаем в этой колонке все доступные зоны для сброса
      const dropZonesArr = Array.from(
        columnElement.querySelectorAll(".board-dropzone")
      );
      // Находим номер зоны куда сбросили эл-т
      const dropIndex = dropZonesArr.indexOf(e.target);
      // Находим эл-т по уникальному коду
      const dragElem = document.querySelector(
        `[data-id = "${e.dataTransfer.getData("targetId")}"]`);
      // Проверяем что зона сброса находится в нужном классе и получаем ее родителя
      const nextElement = e.target.parentElement.classList.contains("tasks-list")
        ? e.target.parentElement
        : e.target;
      // Если сбросили не там то отмена перемещения
      if (dragElem.contains(e.target)) {
        return;
      }
      // Вставляем перетаскиваемый эл-т после родителя зоны сброса
      nextElement.after(dragElem);
      // Обновляем базу данных
      updateItem(userKey, dragElem.getAttribute("data-id"), 
      {
        columnId: columnElement.getAttribute("column-id"),
        position: dropIndex,
      });
    }
  });
};
