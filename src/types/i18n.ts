export interface LocaleMessages {
  [key: string]: any;
  header: {
    title: string;
    home: string;
    login: string;
    signup: string;
    logout: string;
    language: string;
  };
  taskList: {
    addTask: string;
    noTaskFound: string;
    taskFilt: string;
    modal: {
      titleCreate: string;
      titleEdit: string;
      titleView: string;
      okTitleSave: string;
      dueDate: string;
      taskCancelTitle: string;
      deleteTaskMessage: string;
      deleteTaskTitle: string;
      deleteTaskOkTitle: string;
      editTaskMessage: string;
      editTaskTitle: string;
      editTaskOkTitle: string;
      addTaskMessage: string;
      addTaskTitle: string;
      addTaskOkTitle: string;
      titleRequired: string;
      allFieldsRequired: string;
      description: string;
      selectStatus: string;
      selectPriority: string;
      formValidationError: string;
    };
    toast: {
      toastDeleteMessage: string;
      toastEditMessage: string;
      toastAddMessage: string;
    };
    popover: {
      message: string;
    };
  };
  taskFilter: {
    filterHeaderMessage: string;
    status: string;
    priority: string;
    dueDate: string;
    startDate: string;
    endDate: string;
    orderBy: string;
    clearBtn: string;
    removeDate: string;
    resetSort: string;
    dateLabel: string;
    addTask: string;
    sortByPriority: string;
    sortByDueDate: string;
    ascending: string;
    descending: string;
    clearFilter: string;
    statusFilter: {
      inProgress: string;
      completed: string;
      pending: string;
    };
    priorityFilter: {
      low: string;
      medium: string;
      high: string;
      urgent: string;
    };
  };
  baseTask: {
    title: string;
    priority: string;
    status: string;
    description: string;
    completition: string;
    button: {
      modify: string;
      delete: string;
    };
    createdOn: string;
  };
  signupForm: {
    messagges: string;
    email: string;
    username: string;
    placeholderName: string;
    usernameInvalid: string;
    signupError: string;
    password: string;
    usernameRequired: string,
    passwordRequired: string;
    placeholderPassword: string;
    passwordInvalid: string;
    signup: string;
    alreadyRegistered: string;
    login: string;
    emailInvalid: string;
    emailExample: string;
  };
  loginForm: {
    messagges: string;
    username: string;
    usernameRequired: string;
    placeholderName: string;
    usernameInvalid: string;
    loginError: string;
    password: string;
    passwordRequired: string;
    placeholderPassword: string;
    passwordInvalid: string;
    login: string;
    notAlreadyRegistered: string;
    signup: string;
    invalidCredentials: string;
  };
}

export type SupportedLocales = "en" | "it";
