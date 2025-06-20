import type { LocaleMessages } from "@/types/i18n";

const eng: LocaleMessages = {
  header: {
    title: "Task Manager",
    home: "Home",
    login: "Login",
    signup: "Signup",
    logout: "Logout",
    language: "Language:",
  },
  taskList: {
    addTask: "Add task",
    noTaskFound: "No tasks found",
    taskFilt: "No tasks with these characteristics were found",
    noTask: "No Tasks found",
    addMess: "Start adding a new task!",
    modal: {
      titleCreate: "Create new task",
      titleEdit: "Modify task",
      titleView: "View task",
      title: "Task title",
      okTitleSave: "Save",
      closeModal: "Close",
      dueDate: "Due date",
      taskCancelTitle: "Cancel",
      deleteTaskMessage: "Are you sure you wanna delete this task?",
      titleValidate: "Incorrect title, must contain less than 50 characters",
      descriptionValidate:
        "Incorrect description, must contain less than 200 characters",
      deleteTaskTitle: "Confirm delete",
      deleteTaskOkTitle: "Yes, delete",
      editTaskMessage: "Are you sure you want to edit this task?",
      editTaskTitle: "Confirm edit",
      editTaskOkTitle: "Edit",
      edit: "Edit",
      addTaskMessage: "Are you sure you want to create this task?",
      addTaskTitle: "Confirm creation",
      addTaskOkTitle: "Create",
      titleRequired: "Title required.",
      allFieldsRequired: "All fields are required",
      description: "Description",
      selectStatus: "Status",
      selectPriority: "Priority",
      formValidationError: "Please fill in all required fields",
      confirm: "Confirm",
      cancel: "Cancel",
    },
    toast: {
      toastDeleteMessage: "Task deleted successfully!",
      toastEditMessage: "Task edited successfully!",
      toastAddMessage: "Task added successfully!",
      toastErrorDelete: "Error deleting task",
      toastErrorModify: "Error while saving",
      toastErrorAdd: "Error creating task",
      toastCreate: "Fill in all the fields",
      toastDate: "Invalid date",
    },
  },
  taskFilter: {
    filterHeaderMessage: "Filter the tasks:",
    status: "Status:",
    priority: "Priority:",
    startDate: "START:",
    endDate: "END:",
    dueDate: "Expiration Date",
    orderBy: "Sort by:",
    clearBtn: "Clear",
    dateLabel: "SELECT",
    addTask: "Add Task",
    sortByPriority: "Sort by priority",
    sortByDueDate: "Sort by due date",
    ascending: "Ascending",
    removeDate: "Delete Date",
    resetSort: "Reset sort",
    descending: "Descending",
    clearFilter: "Clear filters",
    mobileTitle: "Filter",
    grid: "To Grid",
    table: "To Table",
    statusFilter: {
      inProgress: "IN PROGRESS",
      completed: "COMPLETED",
      pending: "PENDING",
    },
    priorityFilter: {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
      urgent: "URGENT",
    },
  },
  baseTask: {
    title: "Title:",
    priority: "Priority:",
    status: "Status: ",
    description: "Description:",
    completition: "To be completed by:  ",
    button: {
      modify: "Modify",
      delete: "Delete",
    },
    createdOn: "Created on: ",
    actions: "Actions:",
  },
  signupForm: {
    messagges: "Create your Account",
    email: "Email",
    username: "Username",
    usernameRequired: "Username required",
    placeholderName: "Enter the username",
    usernameInvalid:
      "Incorrect username (must be at least 6 characters long and maximum 32)",
    password: "Password",
    signupError: "Registration failed. Please try again later",
    passwordRequired: "Password required",
    placeholderPassword: "Enter you password",
    passwordInvalid:
      "Incorrect password (must be at least 8 characters long and maximum 20)",
    signup: "Signup",
    alreadyRegistered: "Are you registered? Sign in!",
    login: "Login now",
    emailEmpty: "Email required",
    emailInvalid: "Please enter a valid email address (example@gmail.com).",
    emailExample: "Name@example.com",
  },
  loginForm: {
    messagges: "Log in to your account",
    username: "Username",
    usernameRequired: "Username required",
    placeholderName: "Enter the username",
    passwordRequired: "Password required",
    usernameInvalid:
      "Incorrect username (must be at least 6 characters long and maximum 32)",
    loginError: "The server is not responding",
    password: "Password",
    placeholderPassword: "Enter you password",
    passwordInvalid:
      "Incorrect password (must be at least 8 characters long and maximum 20)",
    login: "Login",
    notAlreadyRegistered: "Sign up if you don't have an account!",
    signup: "Sign up",
    invalidCredentials: "Invalid username or password.",
    loginEr: "Incorrect credentials",
    bohError: "An unexpected error occurred during the login.",
  },
  store: {
    errorRegister: "Failed to register. Please check your data.",
    idError: "User ID not found",
    bohError: "Unexpected error occurred",
    newTaskError: "Couldn't create the task",
    deleteTaskError: "Couldn't delete the task",
    updateTaskError: "Couldn't update the task",
  },
};

export default eng;
