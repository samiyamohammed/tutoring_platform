import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signUp } from "../services/authService";

export const signUpUser = createAsyncThunk("auth/signUpUser", async (userData, thunkAPI) => {
  try {
    return await signUp(userData.fullName, userData.email, userData.password);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
