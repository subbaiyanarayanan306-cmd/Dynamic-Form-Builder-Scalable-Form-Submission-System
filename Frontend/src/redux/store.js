import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import formReducer from "./slices/formSlice";
import submissionReducer from "./slices/submissionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forms: formReducer,
    submissions: submissionReducer,
  },
});
