import { BaseModel } from "./BaseModel";
import { appState } from "../app";
import { getFromStorage, AddNewItem } from "../utils";

export class User extends BaseModel {
  constructor(login, password,storageKey) {
    super(),
      this.login = login;
      this.password = password;
      this.storageKey = storageKey;
  }
  // Изменил метод, чтобы он проверял наличие пользователя и админа в базе и записывал в State текущего пользователя
  // Убрал лишний файл auth.js за ненадобностью
  static hasAccess(inputLogin,InputPassword) {
    let users = getFromStorage("users");
    let admins = getFromStorage("admins");

    if (users.length == 0 || admins.length == 0) return false;
    for (let user of users) {
      if (user.login == inputLogin && user.password == InputPassword){
        appState.currentUser = user;
        return true;
      }
    }
    for (let admin of admins) {
      if (admin.login == inputLogin && admin.password == InputPassword){
        appState.currentUser = admin;
        return true;
      }
    }
    return false;
  }

  static save(user) {
    try {
      AddNewItem(user.storageKey, user,'' , '',"userData");
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}
