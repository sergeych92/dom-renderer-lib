import { definePrivateVar } from "./class-utils";

function ToDoList(notes) {
    definePrivateVar(this, '_notes', notes);
}
