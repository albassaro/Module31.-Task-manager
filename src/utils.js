// Функция для получения всех данных из базы, привязанных к ключу  
export const getFromStorage = function (key, typeData = "") {
  const json = localStorage.getItem(key);

  if (!json) {
    if (typeData != "userData") {
      // Для задач
      return [
        {
          id: 1,
          items: [],
        },
        {
          id: 2,
          items: [],
        },
        {
          id: 3,
          items: [],
        },
      ];
    } else return []; // Для пользователей
  }
  return JSON.parse(json);
}; 

export const addToStorage = function (key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}; 

// Функция для добавления нового польз-ля или задачи в базу
export const AddNewItem = function (key, obj, columnId, content, typeData) {
  // Проверяем что добавляется в базу, новый польз-ль или задача (т.к. хранение в базе разное)
  if (typeData === "userData") {
    // Для пользователей
    // Добавление в базу по ключу
    const storageData = getFromStorage(key, "userData");
    storageData.push(obj);
    addToStorage(key, storageData);
  } else {
    // Для задач с доски
    const data = getFromStorage(key);
    // Ищем куда вставить задачу
    const targetInsert = data.find((targetInsert) => targetInsert.id == columnId);
    // Записываем в виде массива данные о задаче: уникальный id и текст задачи
    const item = {
      // Задаем каждой задаче уникальный 6-значный id, генерирующийся с помощью рандомного числа
      id: Math.floor(Math.random() * 1000000),
      content,
    };

    if (!targetInsert) {
      throw new Error("Column does not exist.");
    }
    // Добавляем в базу новую задачу по ключу
    targetInsert.items.push(item);
    addToStorage(key, data);
    return item;
  }
};
// Функция обновления текста задачи и обновление базы при перемещении задачи по колонкам
export const updateItem = function (key, itemId, newProps) {
  const data = getFromStorage(key);
  // Получение эл-та через уникальный id
  const [item, currentColumn] = (() => {
    for (const column of data) {
      if (column == undefined) {
        return;
      }
      const item = column.items.find((item) => item.id == itemId);

      if (item) {
        return [item, column];
      }
    }
  })();

  if (!item) throw new Error("item not found");

  item.content =
    newProps.content === undefined ? item.content : newProps.content;
  // Если эл-т перемещен
  if (newProps.columnId !== undefined && newProps.position !== undefined) {
    const targetColumn = data.find((column) => column.id == newProps.columnId);

    if (!targetColumn) {
      throw new Error("Target column not found.");
    }
    // Удаление эл-та из старой колонки
    currentColumn.items.splice(currentColumn.items.indexOf(item), 1);
    // Добавление эл-та в колонку, в которую его перетащили
    targetColumn.items.splice(newProps.position, 0, item);
  }
  // Перезапись данных о задаче в базе
  addToStorage(key, data);
};
// Функция получения списка эл-тов(задач) в колонке
export const getItemsInColumn = function (key, columnId) {
  const data = getFromStorage(key);

  const itemsList = data.find((itemsList) => itemsList.id == columnId);
  return itemsList.items;
};
// Функция для получения эл-та без перезаписи в базе
export const getItems = function (key, elemId) {
  const data = getFromStorage(key);

  for (const column of data) {
    const item = column.items.find((item) => item.id == elemId);
    if (item) {
      return item;
    }
    if (!item) {
      return [];
    }
  }
  return item;
};
// Функция удаления эл-та из базы
export const deleteItem = function (key, itemId) {
  const data = getFromStorage(key);

  for (const column of data) {
    const item = column.items.find((item) => item.id == itemId);

    if (item) {
      column.items.splice(column.items.indexOf(item), 1);
    }
  }
  addToStorage(key, data);
};

// Функция создания заранее прописанных пользователей: 2 обычных и 1 админа
export const generateTestUser = function (User) {
  const testUser = new User("test", "qwerty123", "users");
  const testUser2 = new User("test2", "123", "users");
  const testUser3 = new User("admin", "1234", "admins");

  // Чтобы не удалять каждый раз данные из базы, поставил условие на разовую запись данных о пользователях в базу
  if (getFromStorage("users","userData").length == 0){
    User.save(testUser);
    User.save(testUser2);
  }
  if (getFromStorage("admins","userData").length == 0){
    User.save(testUser3);
  }
};
